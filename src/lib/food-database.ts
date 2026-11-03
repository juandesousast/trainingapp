/**
 * VECTOR OS - Base de Datos de Alimentos Limpios y Motor de Equivalencias
 * Catálogo adaptado al mercado y supermercados de España (Mercadona, Carrefour, etc.)
 * Macros exactos cada 100 g de producto pesado (crudo o formato comercial).
 */

export type MacroCategory = "protein" | "carbs" | "fats" | "micros";

export interface FoodItem {
  id: string;
  name: string;
  shortName: string;
  category: MacroCategory;
  emoji: string;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  caloriesPer100g: number;
  unitWeightGrams?: number; // Para cálculo de unidades (ej. 54g por huevo M, 30g por cazo de Whey)
  unitLabel?: string; // ej. "huevos", "cazos"
  commercialNote?: string; // Nota de supermercado / formato de pesado
}

export const CLEAN_FOODS: Record<string, FoodItem> = {
  // ==========================================
  // A. FUENTES PRINCIPALES DE PROTEÍNA
  // ==========================================
  pechuga_pollo: {
    id: "pechuga_pollo",
    name: "Pechuga de pollo",
    shortName: "Pechuga de Pollo",
    category: "protein",
    emoji: "🍗",
    proteinPer100g: 23.0,
    fatsPer100g: 1.2,
    carbsPer100g: 0.0,
    caloriesPer100g: 103,
    commercialNote: "Limpia y pesada en crudo",
  },
  pechuga_pavo: {
    id: "pechuga_pavo",
    name: "Pechuga de pavo",
    shortName: "Pechuga de Pavo",
    category: "protein",
    emoji: "🦃",
    proteinPer100g: 24.0,
    fatsPer100g: 1.0,
    carbsPer100g: 0.0,
    caloriesPer100g: 105,
    commercialNote: "Filetes magros en crudo",
  },
  ternera_magra: {
    id: "ternera_magra",
    name: "Ternera magra / Babilla / Picada magra",
    shortName: "Ternera Magra",
    category: "protein",
    emoji: "🥩",
    proteinPer100g: 21.0,
    fatsPer100g: 4.5,
    carbsPer100g: 0.0,
    caloriesPer100g: 125,
    commercialNote: "Babilla o picada magra (<5% grasa)",
  },
  lomo_embuchado: {
    id: "lomo_embuchado",
    name: "Lomo embuchado",
    shortName: "Lomo Embuchado",
    category: "protein",
    emoji: "🥓",
    proteinPer100g: 38.0,
    fatsPer100g: 5.0,
    carbsPer100g: 1.0,
    caloriesPer100g: 200,
    commercialNote: "Embutido magro curado",
  },
  merluza_bacalao: {
    id: "merluza_bacalao",
    name: "Merluza / Bacalao fresco o congelado",
    shortName: "Merluza o Bacalao",
    category: "protein",
    emoji: "🐟",
    proteinPer100g: 17.5,
    fatsPer100g: 0.8,
    carbsPer100g: 0.0,
    caloriesPer100g: 77,
    commercialNote: "Lomos frescos o descongelados",
  },
  salmon_fresco: {
    id: "salmon_fresco",
    name: "Salmón fresco (lomo)",
    shortName: "Salmón Fresco",
    category: "protein",
    emoji: "🍣",
    proteinPer100g: 20.0,
    fatsPer100g: 13.0,
    carbsPer100g: 0.0,
    caloriesPer100g: 208,
    commercialNote: "Lomo con piel y ácidos grasos Omega-3 EPA/DHA",
  },
  atun_natural: {
    id: "atun_natural",
    name: "Atún claro al natural (escurrido)",
    shortName: "Atún al Natural",
    category: "protein",
    emoji: "🥫",
    proteinPer100g: 24.0,
    fatsPer100g: 0.8,
    carbsPer100g: 0.0,
    caloriesPer100g: 103,
    commercialNote: "Lata escurrida de agua",
  },
  claras_huevo: {
    id: "claras_huevo",
    name: "Claras de huevo pasteurizadas (bote)",
    shortName: "Claras de Huevo",
    category: "protein",
    emoji: "🍳",
    proteinPer100g: 11.0,
    fatsPer100g: 0.2,
    carbsPer100g: 0.7,
    caloriesPer100g: 50,
    commercialNote: "Bote pasteurizado refrigerado",
  },
  huevos_enteros: {
    id: "huevos_enteros",
    name: "Huevos enteros medianos",
    shortName: "Huevos Enteros (M)",
    category: "protein",
    emoji: "🥚",
    proteinPer100g: 13.0,
    fatsPer100g: 10.0,
    carbsPer100g: 1.0,
    caloriesPer100g: 145,
    unitWeightGrams: 54,
    unitLabel: "huevos",
    commercialNote: "Huevos camperos medianos (~53-55g/u)",
  },
  queso_batido: {
    id: "queso_batido",
    name: "Queso fresco batido 0% / Quark",
    shortName: "Queso Batido 0%",
    category: "protein",
    emoji: "🥣",
    proteinPer100g: 8.5,
    fatsPer100g: 0.1,
    carbsPer100g: 3.5,
    caloriesPer100g: 49,
    commercialNote: "Tarrina 0% materia grasa",
  },
  whey_isolate: {
    id: "whey_isolate",
    name: "Aislado de Suero (Whey Isolate en polvo)",
    shortName: "Whey Isolate",
    category: "protein",
    emoji: "🥛",
    proteinPer100g: 84.0,
    fatsPer100g: 1.5,
    carbsPer100g: 2.5,
    caloriesPer100g: 360,
    unitWeightGrams: 30,
    unitLabel: "cazos",
    commercialNote: "Polvo de asimilación rápida (1 cazo = 30g)",
  },

  // ==========================================
  // B. FUENTES PRINCIPALES DE CARBOHIDRATOS
  // ==========================================
  arroz_basmati: {
    id: "arroz_basmati",
    name: "Arroz basmati / vaporizado (en crudo)",
    shortName: "Arroz Basmati / Vaporizado",
    category: "carbs",
    emoji: "🍚",
    carbsPer100g: 78.0,
    proteinPer100g: 7.5,
    fatsPer100g: 0.8,
    caloriesPer100g: 350,
    commercialNote: "Grano largo pesado en crudo",
  },
  patata: {
    id: "patata",
    name: "Patata (pesada en crudo/cocida sin piel)",
    shortName: "Patata (cruda/cocida)",
    category: "carbs",
    emoji: "🥔",
    carbsPer100g: 17.0,
    proteinPer100g: 2.0,
    fatsPer100g: 0.1,
    caloriesPer100g: 77,
    commercialNote: "Sin piel hervida o al vapor",
  },
  boniato: {
    id: "boniato",
    name: "Boniato / Batata (en crudo)",
    shortName: "Boniato / Batata",
    category: "carbs",
    emoji: "🍠",
    carbsPer100g: 20.0,
    proteinPer100g: 1.6,
    fatsPer100g: 0.1,
    caloriesPer100g: 86,
    commercialNote: "Pesado en crudo o asado",
  },
  avena_integral: {
    id: "avena_integral",
    name: "Copos de avena integral",
    shortName: "Copos de Avena",
    category: "carbs",
    emoji: "🥣",
    carbsPer100g: 60.0,
    proteinPer100g: 13.5,
    fatsPer100g: 7.0,
    caloriesPer100g: 370,
    commercialNote: "Copos suaves o harina de avena",
  },
  pasta_integral: {
    id: "pasta_integral",
    name: "Pasta integral (en crudo)",
    shortName: "Pasta Integral",
    category: "carbs",
    emoji: "🍝",
    carbsPer100g: 66.0,
    proteinPer100g: 12.5,
    fatsPer100g: 2.0,
    caloriesPer100g: 345,
    commercialNote: "Macarrones o espaguetis en crudo",
  },
  pan_centeno: {
    id: "pan_centeno",
    name: "Pan de centeno / masa madre",
    shortName: "Pan de Centeno / Masa Madre",
    category: "carbs",
    emoji: "🍞",
    carbsPer100g: 46.0,
    proteinPer100g: 8.0,
    fatsPer100g: 1.5,
    caloriesPer100g: 235,
    commercialNote: "Rebanadas integrales 100%",
  },
  lentejas_cocidas: {
    id: "lentejas_cocidas",
    name: "Lentejas cocidas (tarro escurrido)",
    shortName: "Lentejas en Tarro",
    category: "carbs",
    emoji: "🥘",
    carbsPer100g: 15.0,
    proteinPer100g: 7.0,
    fatsPer100g: 0.8,
    caloriesPer100g: 98,
    commercialNote: "Tarro escurrido y aclarado",
  },
  garbanzos_cocidos: {
    id: "garbanzos_cocidos",
    name: "Garbanzos cocidos (tarro escurrido)",
    shortName: "Garbanzos en Tarro",
    category: "carbs",
    emoji: "🧆",
    carbsPer100g: 18.0,
    proteinPer100g: 7.0,
    fatsPer100g: 2.5,
    caloriesPer100g: 128,
    commercialNote: "Tarro escurrido",
  },
  tortitas_arroz: {
    id: "tortitas_arroz",
    name: "Tortitas de arroz / maíz",
    shortName: "Tortitas de Arroz / Maíz",
    category: "carbs",
    emoji: "🍘",
    carbsPer100g: 80.0,
    proteinPer100g: 8.0,
    fatsPer100g: 2.5,
    caloriesPer100g: 380,
    commercialNote: "Paquete comercial sin sal añadida",
  },

  // ==========================================
  // C. FUENTES PRINCIPALES DE GRASAS SALUDABLES
  // ==========================================
  aove: {
    id: "aove",
    name: "Aceite de oliva virgen extra (AOVE)",
    shortName: "AOVE (Aceite de Oliva)",
    category: "fats",
    emoji: "🫒",
    fatsPer100g: 100.0,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    caloriesPer100g: 900,
    commercialNote: "Prensado en frío español (1 cucharada = ~10g)",
  },
  aguacate: {
    id: "aguacate",
    name: "Aguacate maduro",
    shortName: "Aguacate Maduro",
    category: "fats",
    emoji: "🥑",
    fatsPer100g: 15.0,
    proteinPer100g: 2.0,
    carbsPer100g: 2.0,
    caloriesPer100g: 160,
    commercialNote: "Pulpa fresca sin hueso",
  },
  nueces: {
    id: "nueces",
    name: "Nueces peladas",
    shortName: "Nueces Peladas",
    category: "fats",
    emoji: "🌰",
    fatsPer100g: 65.0,
    proteinPer100g: 15.0,
    carbsPer100g: 7.0,
    caloriesPer100g: 650,
    commercialNote: "Mitades naturales sin sal",
  },
  almendras: {
    id: "almendras",
    name: "Almendras naturales / tostadas sin sal",
    shortName: "Almendras Naturales",
    category: "fats",
    emoji: "🥜",
    fatsPer100g: 53.0,
    proteinPer100g: 21.0,
    carbsPer100g: 6.0,
    caloriesPer100g: 600,
    commercialNote: "En crudo o tostadas al horno",
  },
  crema_cacahuete: {
    id: "crema_cacahuete",
    name: "Crema de cacahuete 100%",
    shortName: "Crema de Cacahuete 100%",
    category: "fats",
    emoji: "🥜",
    fatsPer100g: 50.0,
    proteinPer100g: 26.0,
    carbsPer100g: 12.0,
    caloriesPer100g: 610,
    commercialNote: "100% cacahuete sin azúcar ni aceites",
  },

  // ==========================================
  // D. FUENTES DE MICRONUTRIENTES, FIBRA Y ANTIOXIDANTES
  // ==========================================
  arandanos_frutos_rojos: {
    id: "arandanos_frutos_rojos",
    name: "Arándanos / Frutos rojos frescos o congelados",
    shortName: "Arándanos / Frutos Rojos",
    category: "micros",
    emoji: "🫐",
    proteinPer100g: 0.7,
    carbsPer100g: 14.5,
    fatsPer100g: 0.3,
    caloriesPer100g: 57,
    commercialNote: "Ricos en antocianinas, polifenoles y antioxidantes",
  },
  fresas_frescas: {
    id: "fresas_frescas",
    name: "Fresas frescas",
    shortName: "Fresas Frescas",
    category: "micros",
    emoji: "🍓",
    proteinPer100g: 0.7,
    carbsPer100g: 7.7,
    fatsPer100g: 0.3,
    caloriesPer100g: 32,
    commercialNote: "Vitamina C y baja densidad calórica",
  },
  kiwi_fresco: {
    id: "kiwi_fresco",
    name: "Kiwi verde / amarillo",
    shortName: "Kiwi",
    category: "micros",
    emoji: "🥝",
    proteinPer100g: 1.1,
    carbsPer100g: 14.7,
    fatsPer100g: 0.5,
    caloriesPer100g: 61,
    commercialNote: "Actinidina digestiva y vitamina C",
  },
  brocoli_vapor: {
    id: "brocoli_vapor",
    name: "Brócoli al vapor o cocido",
    shortName: "Brócoli al Vapor",
    category: "micros",
    emoji: "🥦",
    proteinPer100g: 2.5,
    carbsPer100g: 4.0,
    fatsPer100g: 0.4,
    caloriesPer100g: 28,
    commercialNote: "Sulforafano, folatos y alta fibra prebiótica",
  },
  espinacas_baby: {
    id: "espinacas_baby",
    name: "Espinacas baby frescas o al vapor",
    shortName: "Espinacas Baby",
    category: "micros",
    emoji: "🥬",
    proteinPer100g: 2.9,
    carbsPer100g: 3.6,
    fatsPer100g: 0.4,
    caloriesPer100g: 23,
    commercialNote: "Magnesio, hierro y nitratos para vasodilatación",
  },
  esparragos_trigueros: {
    id: "esparragos_trigueros",
    name: "Espárragos trigueros a la plancha",
    shortName: "Espárragos Trigueros",
    category: "micros",
    emoji: "🌱",
    proteinPer100g: 2.2,
    carbsPer100g: 3.9,
    fatsPer100g: 0.1,
    caloriesPer100g: 20,
    commercialNote: "Asparagina y equilibrio hídrico celular",
  },
  calabacin_plancha: {
    id: "calabacin_plancha",
    name: "Calabacín a la plancha o al vapor",
    shortName: "Calabacín a la Plancha",
    category: "micros",
    emoji: "🥒",
    proteinPer100g: 1.2,
    carbsPer100g: 3.1,
    fatsPer100g: 0.3,
    caloriesPer100g: 17,
    commercialNote: "Volumen gástrico y digestión liviana para cena",
  },
  judias_verdes: {
    id: "judias_verdes",
    name: "Judías verdes redondas / Ensalada mixta",
    shortName: "Judías Verdes / Ensalada",
    category: "micros",
    emoji: "🫛",
    proteinPer100g: 1.8,
    carbsPer100g: 7.0,
    fatsPer100g: 0.2,
    caloriesPer100g: 31,
    commercialNote: "Fibra saciante y micronutrientes esenciales",
  },
};

export const PROTEIN_FOODS = Object.values(CLEAN_FOODS).filter((f) => f.category === "protein");
export const CARB_FOODS = Object.values(CLEAN_FOODS).filter((f) => f.category === "carbs");
export const FAT_FOODS = Object.values(CLEAN_FOODS).filter((f) => f.category === "fats");
export const MICRO_FOODS = Object.values(CLEAN_FOODS).filter((f) => f.category === "micros");

export function getFoodsByCategory(category: MacroCategory, mealId?: string): FoodItem[] {
  if (category === "protein") return PROTEIN_FOODS;
  if (category === "carbs") return CARB_FOODS;
  if (category === "fats") return FAT_FOODS;
  if (mealId === "meal_1") {
    // Frutas / Antioxidantes de Desayuno
    return MICRO_FOODS.filter((f) =>
      ["arandanos_frutos_rojos", "fresas_frescas", "kiwi_fresco"].includes(f.id)
    );
  }
  // Verduras fibrosas para Almuerzo y Cena
  return MICRO_FOODS.filter(
    (f) => !["arandanos_frutos_rojos", "fresas_frescas", "kiwi_fresco"].includes(f.id)
  );
}

export interface PortionResult {
  grams: number;
  displayQuantity: string; // ej. "150g" o "162g (~3 huevos)" o "36g (~1.2 cazos)"
  unitNote?: string;
  targetMacroGrams: number;
  macroType: MacroCategory;
  calories: number;
  proteinContribution: number;
  carbContribution: number;
  fatContribution: number;
}

/**
 * Motor de Equivalencias Matemáticas:
 * Calcula la porción exacta de un alimento para cubrir un objetivo en gramos de un macronutriente.
 */
export function calculateFoodPortion(
  targetMacroGrams: number,
  macroType: MacroCategory,
  food: FoodItem
): PortionResult {
  if (macroType === "micros") {
    const isFruit = ["arandanos_frutos_rojos", "fresas_frescas", "kiwi_fresco"].includes(food.id);
    const grams = targetMacroGrams > 0 ? targetMacroGrams : (isFruit ? 100 : 200);
    const factor = grams / 100;
    const calories = Math.round(food.caloriesPer100g * factor);
    const proteinContribution = Math.round(food.proteinPer100g * factor * 10) / 10;
    const carbContribution = Math.round(food.carbsPer100g * factor * 10) / 10;
    const fatContribution = Math.round(food.fatsPer100g * factor * 10) / 10;

    return {
      grams,
      displayQuantity: `${grams}g`,
      targetMacroGrams,
      macroType,
      calories,
      proteinContribution,
      carbContribution,
      fatContribution,
    };
  }

  const macroKeyPer100g =
    macroType === "protein"
      ? food.proteinPer100g
      : macroType === "carbs"
      ? food.carbsPer100g
      : food.fatsPer100g;

  if (macroKeyPer100g <= 0) {
    return {
      grams: 0,
      displayQuantity: "0g",
      targetMacroGrams,
      macroType,
      calories: 0,
      proteinContribution: 0,
      carbContribution: 0,
      fatContribution: 0,
    };
  }

  // gramos = Math.round((macroTargetGrams / foodItem[macroTypeKey]) * 100)
  const grams = Math.round((targetMacroGrams / macroKeyPer100g) * 100);

  let unitNote: string | undefined;
  if (food.unitWeightGrams && food.unitLabel) {
    const rawUnits = grams / food.unitWeightGrams;
    const roundedUnits =
      rawUnits >= 1 && Math.abs(rawUnits - Math.round(rawUnits)) < 0.15
        ? Math.round(rawUnits).toString()
        : (Math.round(rawUnits * 10) / 10).toFixed(1);

    unitNote = `~${roundedUnits} ${food.unitLabel}`;
  }

  const displayQuantity = unitNote ? `${grams}g (${unitNote})` : `${grams}g`;

  const factor = grams / 100;
  const calories = Math.round(food.caloriesPer100g * factor);
  const proteinContribution = Math.round(food.proteinPer100g * factor * 10) / 10;
  const carbContribution = Math.round(food.carbsPer100g * factor * 10) / 10;
  const fatContribution = Math.round(food.fatsPer100g * factor * 10) / 10;

  return {
    grams,
    displayQuantity,
    unitNote,
    targetMacroGrams,
    macroType,
    calories,
    proteinContribution,
    carbContribution,
    fatContribution,
  };
}
