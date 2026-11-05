/**
 * VECTOR OS - Motor de Agregación y Conversión Comercial para Lista de la Compra
 *
 * Compila y calcula los requerimientos de alimentos comerciales según los días
 * de entrenamiento y descanso del protocolo activo en el horizonte temporal seleccionado.
 */

import type { BiologicalSex, NutritionGoal } from "./types.ts";
import { calculateNutritionPlan, calculateCreatineDose } from "./nutrition-engine.ts";
import { CLEAN_FOODS, calculateFoodPortion, type FoodItem } from "./food-database.ts";
import { type MealCustomization, DEFAULT_MEAL_FOODS } from "../stores/useMealCustomizationsStore.ts";

export type GroceryHorizon = 3 | 5 | 7;

export type GroceryCategory =
  | "meat_fish"
  | "produce"
  | "dairy_eggs"
  | "pantry_carbs"
  | "healthy_fats"
  | "supplements";

export interface GroceryCategoryConfig {
  id: GroceryCategory;
  name: string;
  emoji: string;
  title: string;
}

export const GROCERY_CATEGORIES: Record<GroceryCategory, GroceryCategoryConfig> = {
  meat_fish: {
    id: "meat_fish",
    name: "Carnes y Pescados",
    emoji: "🥩",
    title: "🥩 Carnes y Pescados",
  },
  produce: {
    id: "produce",
    name: "Frutas, Verduras y Tubérculos",
    emoji: "🥦",
    title: "🥦 Frutas, Verduras y Tubérculos",
  },
  dairy_eggs: {
    id: "dairy_eggs",
    name: "Huevos y Lácteos",
    emoji: "🥚",
    title: "🥚 Huevos y Lácteos",
  },
  pantry_carbs: {
    id: "pantry_carbs",
    name: "Despensa y Carbohidratos",
    emoji: "🌾",
    title: "🌾 Despensa y Carbohidratos",
  },
  healthy_fats: {
    id: "healthy_fats",
    name: "Grasas Saludables y Frutos Secos",
    emoji: "🫒",
    title: "🫒 Grasas Saludables y Frutos Secos",
  },
  supplements: {
    id: "supplements",
    name: "Suplementación y Rendimiento",
    emoji: "⚡",
    title: "⚡ Suplementación y Rendimiento",
  },
};

export interface GroceryItem {
  id: string; // ID único para el checklist (ej. "item_pechuga_pollo" o "supp_creatina")
  foodId?: string;
  name: string;
  emoji: string;
  category: GroceryCategory;
  totalGrams: number;
  formattedAmount: string;
  commercialNote?: string;
  detailText: string;
  whatsappLine: string;
}

export interface GrocerySection {
  category: GroceryCategory;
  name: string;
  emoji: string;
  title: string;
  items: GroceryItem[];
}

export interface GroceryEngineInput {
  weightKg: number;
  bodyFatPct: number;
  targetBodyFatPct?: number;
  nutritionGoal?: NutritionGoal;
  sex?: BiologicalSex;
  profileId: string;
  athleteName: string;
  horizonDays?: GroceryHorizon; // 3, 5 o 7 (default: 7)
  getCustomization: (profileId: string, mealId: string) => MealCustomization;
}

export interface GroceryListResult {
  horizonDays: GroceryHorizon;
  trainingDays: number;
  restDays: number;
  athleteName: string;
  goalLabel: string;
  sections: GrocerySection[];
  totalItemsCount: number;
}

/**
 * Determina a qué categoría de compra pertenece un alimento limpio
 */
export function getGroceryCategoryForFood(foodId: string): GroceryCategory {
  if (foodId === "whey_isolate" || foodId === "creatina_monohidrato") {
    return "supplements";
  }

  const food = CLEAN_FOODS[foodId];
  if (!food) return "pantry_carbs";

  if (food.category === "protein") {
    if (foodId === "huevos_enteros" || foodId === "claras_huevo" || foodId === "queso_batido") {
      return "dairy_eggs";
    }
    return "meat_fish";
  }

  if (food.category === "carbs") {
    if (foodId === "patata" || foodId === "boniato") {
      return "produce";
    }
    return "pantry_carbs";
  }

  if (food.category === "fats") {
    return "healthy_fats";
  }

  if (food.category === "micros") {
    return "produce";
  }

  return "pantry_carbs";
}

/**
 * Calcula los gramos diarios de cada alimento para un tipo de día (entreno o descanso)
 */
function computeDailyFoodGrams(
  isTrainingDay: boolean,
  input: {
    weightKg: number;
    bodyFatPct: number;
    targetBodyFatPct?: number;
    nutritionGoal?: NutritionGoal;
    sex?: BiologicalSex;
    profileId: string;
    getCustomization: (profileId: string, mealId: string) => MealCustomization;
  }
): Record<string, number> {
  const plan = calculateNutritionPlan({
    weightKg: input.weightKg,
    bodyFatPct: input.bodyFatPct,
    targetBodyFatPct: input.targetBodyFatPct,
    isTrainingDay,
    nutritionGoal: input.nutritionGoal,
    sex: input.sex,
  });

  const gramsMap: Record<string, number> = {};

  const addGrams = (foodId: string, g: number) => {
    if (!foodId || g <= 0) return;
    gramsMap[foodId] = (gramsMap[foodId] || 0) + g;
  };

  for (const meal of plan.meals) {
    const mealId = meal.id;
    const custom = input.getCustomization(input.profileId, mealId);

    // 1. Alimento Proteico
    const proteinFoodId =
      custom.proteinFoodId || DEFAULT_MEAL_FOODS[mealId]?.proteinFoodId || "pechuga_pollo";
    const proteinFood = CLEAN_FOODS[proteinFoodId] || CLEAN_FOODS.pechuga_pollo;
    const proteinPortion = calculateFoodPortion(meal.proteinGrams, "protein", proteinFood);
    addGrams(proteinFoodId, proteinPortion.grams);

    // 2. Alimento Micronutrientes (Comidas 1, 2 y 4)
    const hasMicroSlot = mealId === "meal_1" || mealId === "meal_2" || mealId === "meal_4";
    let microCarbDeduction = 0;

    if (hasMicroSlot) {
      const defaultMicroId =
        mealId === "meal_1"
          ? "arandanos_frutos_rojos"
          : mealId === "meal_2"
          ? "brocoli_vapor"
          : "calabacin_plancha";
      const microFoodId = custom.microFoodId || defaultMicroId;
      const microFood = CLEAN_FOODS[microFoodId] || CLEAN_FOODS[defaultMicroId];
      const microTargetGrams = mealId === "meal_1" ? 100 : 200;
      const microPortion = calculateFoodPortion(microTargetGrams, "micros", microFood);
      addGrams(microFoodId, microPortion.grams);
      microCarbDeduction = Math.round(microPortion.carbContribution);
    }

    // 3. Alimento Carbohidrato
    const carbFoodId =
      custom.carbFoodId || DEFAULT_MEAL_FOODS[mealId]?.carbFoodId || "arroz_basmati";
    const carbFood = CLEAN_FOODS[carbFoodId] || CLEAN_FOODS.arroz_basmati;
    const adjustedCarbGrams = hasMicroSlot
      ? Math.max(10, meal.carbGrams - microCarbDeduction)
      : meal.carbGrams;
    const carbPortion = calculateFoodPortion(adjustedCarbGrams, "carbs", carbFood);
    addGrams(carbFoodId, carbPortion.grams);

    // 4. Alimento Grasa Saludable
    const fatFoodId = custom.fatFoodId || DEFAULT_MEAL_FOODS[mealId]?.fatFoodId || "aove";
    const fatFood = CLEAN_FOODS[fatFoodId] || CLEAN_FOODS.aove;
    let adjustedFatGrams = meal.fatGrams;
    if (proteinFoodId === "salmon_fresco") {
      const salmonFatGrams = Math.round(proteinPortion.fatContribution);
      adjustedFatGrams = Math.max(0, meal.fatGrams - salmonFatGrams);
    }
    if (adjustedFatGrams > 0) {
      const fatPortion = calculateFoodPortion(adjustedFatGrams, "fats", fatFood);
      addGrams(fatFoodId, fatPortion.grams);
    }
  }

  return gramsMap;
}

/**
 * Formatea un alimento según los estándares comerciales del mercado español
 */
function formatCommercialGroceryItem(
  foodId: string,
  totalGrams: number,
  category: GroceryCategory
): GroceryItem {
  const food = CLEAN_FOODS[foodId];
  const name = food ? food.shortName : foodId;
  const emoji = food ? food.emoji : "📦";

  // 1. Huevos
  if (foodId === "huevos_enteros") {
    const units = Math.ceil(totalGrams / 53);
    const dozens = Math.round(units / 12);
    const dozensNote = dozens > 0 ? `~${dozens} docenas` : undefined;
    const commercialNote = dozensNote;
    const formattedAmount = `${units} unidades`;
    const detailText = dozensNote ? `${units} unidades (${dozensNote})` : `${units} unidades`;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name: "Huevos clase M",
      emoji,
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- Huevos clase M: ${detailText}`,
    };
  }

  // 2. Claras de huevo
  if (foodId === "claras_huevo") {
    const botes = Math.ceil(totalGrams / 300);
    const commercialNote = `~${botes} ${botes === 1 ? "bote" : "botes"} (300g)`;
    const formattedAmount = `${Math.round(totalGrams)}g`;
    const detailText = `${Math.round(totalGrams)}g (~${botes} botes)`;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- ${name}: ${detailText}`,
    };
  }

  // 3. Queso batido
  if (foodId === "queso_batido") {
    const tarrinas = Math.ceil(totalGrams / 500);
    const commercialNote = `~${tarrinas} ${tarrinas === 1 ? "tarrina" : "tarrinas"} (500g)`;
    const formattedAmount = `${Math.round(totalGrams)}g`;
    const detailText = `${Math.round(totalGrams)}g (~${tarrinas} ${tarrinas === 1 ? "tarrina" : "tarrinas"})`;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- ${name}: ${detailText}`,
    };
  }

  // 4. Tortitas de arroz
  if (foodId === "tortitas_arroz") {
    const paquetes = Math.ceil(totalGrams / 130);
    const commercialNote = `${paquetes} ${paquetes === 1 ? "paquete" : "paquetes"}`;
    const formattedAmount = `${commercialNote}`;
    const detailText = `${commercialNote}`;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- ${name}: ${commercialNote}`,
    };
  }

  // 5. Aceite de Oliva (AOVE)
  if (foodId === "aove") {
    const commercialNote = "1 botella";
    const formattedAmount = "1 botella";
    const detailText = `1 botella (${Math.round(totalGrams)}g)`;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name: "AOVE",
      emoji,
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- AOVE: 1 botella`,
    };
  }

  // 6. Carnes y Pescados
  if (category === "meat_fish") {
    if (totalGrams >= 1000) {
      const kg = (totalGrams / 1000).toFixed(2);
      const bandejas = Math.round(totalGrams / 500);
      const commercialNote = bandejas > 0 ? `~${bandejas} bandejas` : undefined;
      const formattedAmount = `${kg} kg`;
      const detailText = commercialNote ? `${kg} kg (${commercialNote})` : `${kg} kg`;

      return {
        id: `grocery_${foodId}`,
        foodId,
        name,
        emoji,
        category,
        totalGrams,
        formattedAmount,
        commercialNote,
        detailText,
        whatsappLine: `- ${name}: ${kg} kg`,
      };
    }

    const formattedAmount = `${Math.round(totalGrams)}g`;
    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      detailText: formattedAmount,
      whatsappLine: `- ${name}: ${formattedAmount}`,
    };
  }

  // 7. Frutas, Verduras y Tubérculos
  if (category === "produce") {
    if (totalGrams >= 1000) {
      const kg = (totalGrams / 1000).toFixed(2);
      const formattedAmount = `${kg} kg`;
      return {
        id: `grocery_${foodId}`,
        foodId,
        name,
        emoji,
        category,
        totalGrams,
        formattedAmount,
        detailText: formattedAmount,
        whatsappLine: `- ${name}: ${formattedAmount}`,
      };
    }

    const formattedAmount = `${Math.round(totalGrams)}g`;
    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      detailText: formattedAmount,
      whatsappLine: `- ${name}: ${formattedAmount}`,
    };
  }

  // 8. Whey Isolate (en Suplementación)
  if (foodId === "whey_isolate") {
    const cazos = Math.round(totalGrams / 30);
    const commercialNote = cazos > 0 ? `~${cazos} cazos` : undefined;
    const formattedAmount = `${Math.round(totalGrams)}g`;
    const detailText = commercialNote ? `${formattedAmount} (${commercialNote})` : formattedAmount;

    return {
      id: `grocery_${foodId}`,
      foodId,
      name: "Whey Isolate",
      emoji: "🥛",
      category,
      totalGrams,
      formattedAmount,
      commercialNote,
      detailText,
      whatsappLine: `- Whey Isolate: ${formattedAmount}`,
    };
  }

  // 9. Otros alimentos genéricos (arroz, avena, pasta, nueces, etc.)
  if (totalGrams >= 1000) {
    const kg = (totalGrams / 1000).toFixed(2);
    const formattedAmount = `${kg} kg`;
    return {
      id: `grocery_${foodId}`,
      foodId,
      name,
      emoji,
      category,
      totalGrams,
      formattedAmount,
      detailText: formattedAmount,
      whatsappLine: `- ${name}: ${formattedAmount}`,
    };
  }

  const formattedAmount = `${Math.round(totalGrams)}g`;
  return {
    id: `grocery_${foodId}`,
    foodId,
    name,
    emoji,
    category,
    totalGrams,
    formattedAmount,
    detailText: formattedAmount,
    whatsappLine: `- ${name}: ${formattedAmount}`,
  };
}

/**
 * Genera la lista completa de la compra agregada según horizonte de días
 */
export function generateSmartGroceryList(input: GroceryEngineInput): GroceryListResult {
  const horizonDays = input.horizonDays || 7;

  // Distribución de días según horizonte del mesociclo BIIO estándar:
  // - 7 días: 3 de entreno / 4 de descanso
  // - 5 días: 2 de entreno / 3 de descanso
  // - 3 días: 2 de entreno / 1 de descanso
  const trainingDays = horizonDays === 3 ? 2 : horizonDays === 5 ? 2 : 3;
  const restDays = horizonDays === 3 ? 1 : horizonDays === 5 ? 3 : 4;

  const trainingGrams = computeDailyFoodGrams(true, input);
  const restGrams = computeDailyFoodGrams(false, input);

  // Recolectar todos los foodIds únicos
  const allFoodIds = new Set<string>([
    ...Object.keys(trainingGrams),
    ...Object.keys(restGrams),
  ]);

  // Mapa de ítems agrupados por categoría
  const sectionItemsMap: Record<GroceryCategory, GroceryItem[]> = {
    meat_fish: [],
    produce: [],
    dairy_eggs: [],
    pantry_carbs: [],
    healthy_fats: [],
    supplements: [],
  };

  for (const foodId of allFoodIds) {
    const tG = trainingGrams[foodId] || 0;
    const rG = restGrams[foodId] || 0;
    const totalG = Math.round(tG * trainingDays + rG * restDays);

    if (totalG <= 0) continue;

    const category = getGroceryCategoryForFood(foodId);
    const item = formatCommercialGroceryItem(foodId, totalG, category);
    sectionItemsMap[category].push(item);
  }

  // Añadir Creatina Monohidrato a Suplementación y Rendimiento
  const dailyCreatine = calculateCreatineDose(input.weightKg);
  const totalCreatineGrams = Math.round(dailyCreatine * horizonDays);
  if (totalCreatineGrams > 0) {
    const creatineItem: GroceryItem = {
      id: "grocery_creatina_monohidrato",
      foodId: "creatina_monohidrato",
      name: "Creatina Monohidrato",
      emoji: "⚡",
      category: "supplements",
      totalGrams: totalCreatineGrams,
      formattedAmount: `${totalCreatineGrams}g`,
      commercialNote: `${dailyCreatine}g/día`,
      detailText: `${totalCreatineGrams}g (${dailyCreatine}g/día)`,
      whatsappLine: `- Creatina Monohidrato: ${totalCreatineGrams}g (${dailyCreatine}g/día)`,
    };

    // Poner la creatina en primer lugar de suplementos
    sectionItemsMap.supplements.unshift(creatineItem);
  }

  // Orden de categorías canónico
  const orderedCategoryKeys: GroceryCategory[] = [
    "meat_fish",
    "produce",
    "dairy_eggs",
    "pantry_carbs",
    "healthy_fats",
    "supplements",
  ];

  const sections: GrocerySection[] = [];
  let totalItemsCount = 0;

  for (const catKey of orderedCategoryKeys) {
    const items = sectionItemsMap[catKey];
    if (items.length > 0) {
      sections.push({
        category: catKey,
        name: GROCERY_CATEGORIES[catKey].name,
        emoji: GROCERY_CATEGORIES[catKey].emoji,
        title: GROCERY_CATEGORIES[catKey].title,
        items,
      });
      totalItemsCount += items.length;
    }
  }

  // Obtener etiqueta de fase nutricional activa
  const basePlan = calculateNutritionPlan({
    weightKg: input.weightKg,
    bodyFatPct: input.bodyFatPct,
    targetBodyFatPct: input.targetBodyFatPct,
    isTrainingDay: true,
    nutritionGoal: input.nutritionGoal,
    sex: input.sex,
  });

  return {
    horizonDays,
    trainingDays,
    restDays,
    athleteName: input.athleteName,
    goalLabel: basePlan.goalLabel,
    sections,
    totalItemsCount,
  };
}

/**
 * Genera el texto formateado y limpio listo para copiar y enviar por WhatsApp
 */
export function generateGroceryWhatsAppText(result: GroceryListResult): string {
  const lines: string[] = [
    `🛒 LISTA DE LA COMPRA - VECTOR OS (${result.horizonDays} Días)`,
    `Atleta: ${result.athleteName} | Fase: ${result.goalLabel}`,
    "",
  ];

  for (const section of result.sections) {
    lines.push(section.title.toUpperCase());
    for (const item of section.items) {
      lines.push(item.whatsappLine);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
