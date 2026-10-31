/**
 * HOPLITA OS - Motor Metabólico y de Nutrición Dinámica
 *
 * Servicio matemático puro y reactivo que calcula el gasto energético (BMR / TDEE),
 * ajuste calórico según metas de recomposición corporal y distribución de macronutrientes
 * y porciones de comida para días de entrenamiento vs. descanso.
 */

export interface NutritionEngineInput {
  weightKg: number;
  bodyFatPct: number;
  targetBodyFatPct: number;
  isTrainingDay: boolean;
}

export interface MealPortion {
  id: string;
  name: string;
  subtitle: string;
  timing: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  calories: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  suggestions: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export interface NutritionPlan {
  // Parámetros basales
  lbmKg: number; // Masa magra en kg
  bmr: number; // Tasa metabólica basal (Katch-McArdle)
  tdee: number; // Gasto energético diario total
  isDeficitPhase: boolean; // true si bodyFat > target
  caloricAdjustmentPct: number; // -18% o 0%

  // Metas diarias de macros y calorías
  targetCalories: number;
  proteinGrams: number;
  proteinKcal: number;
  proteinPct: number;

  fatGrams: number;
  fatKcal: number;
  fatPct: number;

  carbGrams: number;
  carbKcal: number;
  carbPct: number;

  // Distribución en 4 comidas
  meals: MealPortion[];
}

/**
 * Calcula el plan nutricional dinámico a partir de las métricas corporales y el calendario
 */
export function calculateNutritionPlan(input: NutritionEngineInput): NutritionPlan {
  const { weightKg, bodyFatPct, targetBodyFatPct, isTrainingDay } = input;

  // 1. Masa Libre de Grasa (LBM): weightKg * (1 - (bodyFatPct / 100))
  const safeFatPct = Math.max(3, Math.min(60, bodyFatPct || 20));
  const lbmKg = Number((weightKg * (1 - safeFatPct / 100)).toFixed(2));

  // 2. Tasa Metabólica Basal (BMR - Fórmula Katch-McArdle): 370 + (21.6 * lbmKg)
  const bmr = Math.round(370 + 21.6 * lbmKg);

  // 3. Gasto Energético Diario (TDEE):
  //    - Día de Entrenamiento: BMR * 1.45 (demanda glucolítica + EPOC)
  //    - Día de Descanso: BMR * 1.25 (recuperación pasiva)
  const activityMultiplier = isTrainingDay ? 1.45 : 1.25;
  const tdee = Math.round(bmr * activityMultiplier);

  // 4. Ajuste por Meta (% Grasa Actual vs. Meta):
  //    - Si bodyFatPct > target: Déficit del 18% (targetCalories = Math.round(tdee * 0.82))
  //    - Si bodyFatPct <= target: Normocalórica (targetCalories = Math.round(tdee))
  const isDeficitPhase = safeFatPct > (targetBodyFatPct || 16);
  const caloricAdjustmentPct = isDeficitPhase ? -18 : 0;
  const targetCalories = isDeficitPhase ? Math.round(tdee * 0.82) : tdee;

  // 5. Reparto de Macronutrientes:
  //    - Proteína: 2.2 g por kg de LBM (o mínimo 1.8 g/kg de peso total)
  const proteinGrams = Math.round(Math.max(lbmKg * 2.2, weightKg * 1.8));
  const proteinKcal = proteinGrams * 4;

  //    - Grasas: 0.9 g por kg de peso total (soporte hormonal)
  const fatGrams = Math.round(weightKg * 0.9);
  const fatKcal = fatGrams * 9;

  //    - Carbohidratos: Cubren el balance calórico restante
  const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbGrams = Math.round(carbKcal / 4);

  // Porcentajes calóricos
  const proteinPct = Math.round((proteinKcal / targetCalories) * 100);
  const fatPct = Math.round((fatKcal / targetCalories) * 100);
  const carbPct = Math.max(0, 100 - proteinPct - fatPct);

  // 6. Subdivisión en 4 comidas
  // Día de entreno vs. Día de descanso
  const ratios = isTrainingDay
    ? [
        // Comida 1 (Desayuno)
        { p: 0.25, f: 0.30, c: 0.25 },
        // Comida 2 (Pre-Entreno / Almuerzo)
        { p: 0.25, f: 0.20, c: 0.35 },
        // Comida 3 (Post-Entreno / Merienda)
        { p: 0.30, f: 0.15, c: 0.30 },
        // Comida 4 (Cena)
        { p: 0.20, f: 0.35, c: 0.10 },
      ]
    : [
        // Día de descanso: balanceado y carbohidratos ligeros
        { p: 0.25, f: 0.30, c: 0.25 },
        { p: 0.25, f: 0.25, c: 0.30 },
        { p: 0.25, f: 0.20, c: 0.25 },
        { p: 0.25, f: 0.25, c: 0.20 },
      ];

  const mealConfigs = [
    {
      id: "meal_1",
      name: "Comida 1",
      subtitle: "Desayuno Anabólico",
      timing: "08:00 - 09:00",
      suggestions: {
        protein: "Huevos camperos enteros (3 u) + 100g de claras o scoop de Whey",
        carbs: "50-70g Copos de avena integral o frutos rojos / arándanos",
        fats: "Yemas de huevo + 15g de nueces o crema de cacahuete pura",
      },
    },
    {
      id: "meal_2",
      name: "Comida 2",
      subtitle: isTrainingDay ? "Pre-Entreno / Almuerzo" : "Almuerzo Principal",
      timing: "13:30 - 14:30",
      suggestions: {
        protein: "160-200g Pechuga de pollo de corral o ternera magra",
        carbs: "Arroz basmati / jazmín o 250g patata cocida al vapor",
        fats: "1 cucharada sopera de AOVE (Aceite de Oliva Virgen Extra)",
      },
    },
    {
      id: "meal_3",
      name: "Comida 3",
      subtitle: isTrainingDay ? "Post-Entreno / Carga Glucolítica" : "Merienda Proteica",
      timing: "18:00 - 19:00",
      suggestions: {
        protein: "1 scoop Whey Isolate + 150g queso fresco batido 0%",
        carbs: "Tortitas de arroz con miel cruda o 1 plátano maduro",
        fats: "10-15g Almendras crudas o semillas de chía",
      },
    },
    {
      id: "meal_4",
      name: "Comida 4",
      subtitle: "Cena Regenerativa",
      timing: "21:30 - 22:30",
      suggestions: {
        protein: "180-220g Lomo de salmón salvaje, merluza o dorada al horno",
        carbs: "Ensalada verde abundante + espárragos, calabacín o brócoli",
        fats: "AOVE en crudo + 1/4 de aguacate maduro",
      },
    },
  ];

  const meals: MealPortion[] = mealConfigs.map((cfg, idx) => {
    const r = ratios[idx];
    const mP = Math.round(proteinGrams * r.p);
    const mF = Math.round(fatGrams * r.f);
    const mC = Math.round(carbGrams * r.c);
    const mKcal = mP * 4 + mF * 9 + mC * 4;

    return {
      id: cfg.id,
      name: cfg.name,
      subtitle: cfg.subtitle,
      timing: cfg.timing,
      proteinGrams: mP,
      fatGrams: mF,
      carbGrams: mC,
      calories: mKcal,
      proteinPct: Math.round(r.p * 100),
      fatPct: Math.round(r.f * 100),
      carbPct: Math.round(r.c * 100),
      suggestions: cfg.suggestions,
    };
  });

  return {
    lbmKg,
    bmr,
    tdee,
    isDeficitPhase,
    caloricAdjustmentPct,
    targetCalories,
    proteinGrams,
    proteinKcal,
    proteinPct,
    fatGrams,
    fatKcal,
    fatPct,
    carbGrams,
    carbKcal,
    carbPct,
    meals,
  };
}
