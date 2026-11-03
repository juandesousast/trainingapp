/**
 * VECTOR OS - Motor Metabólico y de Nutrición Dinámica
 *
 * Servicio matemático puro y reactivo que calcula el gasto energético (BMR / TDEE),
 * ajuste calórico según metas de recomposición corporal y distribución de macronutrientes
 * y porciones de comida para días de entrenamiento vs. descanso.
 */

import type { NutritionGoal, BiologicalSex } from "./types";

export interface NutritionEngineInput {
  weightKg: number;
  bodyFatPct: number;
  targetBodyFatPct?: number;
  isTrainingDay: boolean;
  nutritionGoal?: NutritionGoal;
  sex?: BiologicalSex;
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
    micros?: string;
  };
}

export interface NutritionPlan {
  // Parámetros basales
  lbmKg: number; // Masa magra en kg
  bmr: number; // Tasa metabólica basal (Katch-McArdle)
  tdee: number; // Gasto energético diario total
  nutritionGoal: NutritionGoal;
  goalLabel: string;
  isDeficitPhase: boolean;
  caloricAdjustmentPct: number;

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
  const { weightKg, bodyFatPct, targetBodyFatPct, isTrainingDay, nutritionGoal, sex = "male" } = input;

  // 1. Masa Libre de Grasa (LBM): weightKg * (1 - (bodyFatPct / 100))
  const safeFatPct = Math.max(3, Math.min(60, bodyFatPct || (sex === "female" ? 22 : 20)));
  const lbmKg = Number((weightKg * (1 - safeFatPct / 100)).toFixed(2));

  // 2. Tasa Metabólica Basal (BMR - Fórmula Katch-McArdle): 370 + (21.6 * lbmKg)
  const bmr = Math.round(370 + 21.6 * lbmKg);

  // 3. Gasto Energético Diario (TDEE):
  //    - Día de Entrenamiento: BMR * 1.45 (demanda glucolítica + EPOC)
  //    - Día de Descanso: BMR * 1.25 (recuperación pasiva)
  const activityMultiplier = isTrainingDay ? 1.45 : 1.25;
  const tdee = Math.round(bmr * activityMultiplier);

  // 4. Ajuste por Objetivo Nutricional Seleccionado (nutritionGoal):
  //    Meta sugerida por defecto: 21% en mujeres, 16% en hombres
  const defaultTargetFatPct = sex === "female" ? 21.0 : 16.0;
  const effectiveTargetFatPct = targetBodyFatPct || defaultTargetFatPct;

  const activeGoal: NutritionGoal =
    nutritionGoal || (safeFatPct > effectiveTargetFatPct ? "fat_loss" : "recomp");

  let caloricMultiplier = 1.0;
  let caloricAdjustmentPct = 0;
  let goalLabel = "Normocalórica · Mantenimiento";

  switch (activeGoal) {
    case "fat_loss":
      caloricMultiplier = 0.82;
      caloricAdjustmentPct = -18;
      goalLabel = "Déficit -18% · Fase de Definición";
      break;
    case "recomp":
      caloricMultiplier = isTrainingDay ? 1.0 : 0.92;
      caloricAdjustmentPct = isTrainingDay ? 0 : -8;
      goalLabel = isTrainingDay
        ? "Normocalórica · Recomposición BIIO"
        : "Déficit Leve -8% · Recomposición BIIO";
      break;
    case "maintenance":
      caloricMultiplier = 1.0;
      caloricAdjustmentPct = 0;
      goalLabel = "Normocalórica · Mantenimiento";
      break;
    case "hypertrophy":
      caloricMultiplier = 1.08;
      caloricAdjustmentPct = 8;
      goalLabel = "Superávit +8% · Ganancia Muscular";
      break;
  }

  const isDeficitPhase = caloricAdjustmentPct < 0;
  const targetCalories = Math.round(tdee * caloricMultiplier);

  // 5. Reparto de Macronutrientes:
  //    - Proteína (Fija y blindada universal): 2.2 g por kg de LBM (o mínimo 1.8 g/kg de peso total)
  const proteinGrams = Math.round(Math.max(lbmKg * 2.2, weightKg * 1.8));
  const proteinKcal = proteinGrams * 4;

  //    - Suelo de Grasas según Sexo Fisiológico:
  //      Mujeres (female): 1.0 g por kg de peso total (protección hormonal / estrogénica)
  //      Hombres (male): 0.9 g por kg de peso total
  const fatFloorMultiplier = sex === "female" ? 1.0 : 0.9;
  const fatGrams = Math.round(weightKg * fatFloorMultiplier);
  const fatKcal = fatGrams * 9;

  //    - Carbohidratos (Ciclados por demanda): Cubren el balance calórico restante
  const rawCarbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbGrams = Math.round(rawCarbKcal / 4);
  const carbKcal = carbGrams * 4;

  // Presupuesto calórico total alineado exactamente con la suma real de macronutrientes (P*4 + F*9 + C*4)
  const finalTargetCalories = proteinKcal + fatKcal + carbKcal;

  // Porcentajes calóricos
  const proteinPct = Math.round((proteinKcal / finalTargetCalories) * 100);
  const fatPct = Math.round((fatKcal / finalTargetCalories) * 100);
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
        protein: "Huevos camperos enteros + claras pasteurizadas o scoop de Whey",
        carbs: "Copos de avena integral (descontando carbohidratos de la fruta)",
        fats: "Nueces peladas o crema de cacahuete pura",
        micros: "80-100g Arándanos frescos o frutos rojos antioxidantes",
      },
    },
    {
      id: "meal_2",
      name: "Comida 2",
      subtitle: isTrainingDay ? "Pre-Entreno / Almuerzo" : "Almuerzo Principal",
      timing: "13:30 - 14:30",
      suggestions: {
        protein: "Pechuga de pollo de corral o pavo en crudo",
        carbs: "Arroz basmati / vaporizado (ajustado en báscula por verduras)",
        fats: "1 cucharada sopera de AOVE (Aceite de Oliva Virgen Extra)",
        micros: "200g Brócoli al vapor, espárragos trigueros o espinacas baby",
      },
    },
    {
      id: "meal_3",
      name: "Comida 3",
      subtitle: isTrainingDay ? "Post-Entreno / Carga Glucolítica" : "Merienda Proteica",
      timing: "18:00 - 19:00",
      suggestions: {
        protein: "1 scoop Whey Isolate + 150g queso fresco batido 0%",
        carbs: "Tortitas de arroz / maíz de rápida asimilación",
        fats: "10-15g Almendras crudas o semillas de chía",
      },
    },
    {
      id: "meal_4",
      name: "Comida 4",
      subtitle: "Cena Regenerativa",
      timing: "21:30 - 22:30",
      suggestions: {
        protein: "Lomo de salmón fresco, merluza o dorada al horno",
        carbs: "Patata cocida o boniato asado (ajustado por verduras)",
        fats: "AOVE en crudo (compensado si se elige pescado azul/salmón)",
        micros: "200g Calabacín a la plancha, judías verdes o ensalada mixta",
      },
    },
  ];

  let sumP = 0;
  let sumF = 0;
  let sumC = 0;

  const meals: MealPortion[] = mealConfigs.map((cfg, idx) => {
    let mP = 0;
    let mF = 0;
    let mC = 0;

    if (idx === mealConfigs.length - 1) {
      mP = Math.max(0, proteinGrams - sumP);
      mF = Math.max(0, fatGrams - sumF);
      mC = Math.max(0, carbGrams - sumC);
    } else {
      const r = ratios[idx];
      mP = Math.round(proteinGrams * r.p);
      mF = Math.round(fatGrams * r.f);
      mC = Math.round(carbGrams * r.c);
      sumP += mP;
      sumF += mF;
      sumC += mC;
    }

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
      proteinPct: Math.round((mP / (proteinGrams || 1)) * 100),
      fatPct: Math.round((mF / (fatGrams || 1)) * 100),
      carbPct: Math.round((mC / (carbGrams || 1)) * 100),
      suggestions: cfg.suggestions,
    };
  });

  return {
    lbmKg,
    bmr,
    tdee,
    nutritionGoal: activeGoal,
    goalLabel,
    isDeficitPhase,
    caloricAdjustmentPct,
    targetCalories: finalTargetCalories,
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

/**
 * Dosificación de creatina monohidrato basada en masa corporal.
 * Regla: 0.1g por kg de peso corporal, redondeado a intervalos de 0.5g.
 * Rango fisiológico seguro: mínimo 3g, máximo 10g/día.
 */
export function calculateCreatineDose(weightKg: number): number {
  if (!weightKg || weightKg <= 0) return 5;
  const dose = Math.round((weightKg * 0.1) * 2) / 2;
  return Math.min(Math.max(dose, 3), 10);
}

export interface TargetWeightProjection {
  recommendedWeightKg: number;
  lbmKg: number;
  fatMassDeltaKg: number;
  isDeficit: boolean;
  minWeeks: number;
  optimalWeeks: number;
  ratePerWeekKg: number;
}

/**
 * Cálculo del peso objetivo recomendado preservando el 100% de la masa magra (LBM).
 * Fórmula: Peso Objetivo = Masa Magra / (1 - (% Grasa Objetivo / 100))
 * Plazos seguros:
 * - Pérdida de grasa: 0.5% a 1.0% del peso corporal/semana (óptimo ~0.75%/sem para blindar masa muscular).
 * - Ganancia limpia: 0.25% a 0.5% del peso corporal/semana.
 */
export function calculateRecommendedTargetWeight(params: {
  currentWeightKg: number;
  currentBodyFatPct: number;
  targetBodyFatPct: number;
}): TargetWeightProjection {
  const { currentWeightKg, currentBodyFatPct, targetBodyFatPct } = params;

  const currentFatFraction = Math.max(0.03, Math.min(0.65, currentBodyFatPct / 100));
  const targetFatFraction = Math.max(0.03, Math.min(0.65, targetBodyFatPct / 100));

  // Masa magra actual (LBM)
  const lbmKg = currentWeightKg * (1 - currentFatFraction);

  // Peso final necesario para que esa misma masa magra represente el (1 - targetFatFraction) del total
  const rawTargetWeight = lbmKg / (1 - targetFatFraction);
  const recommendedWeightKg = Math.round(rawTargetWeight * 10) / 10;

  const weightDelta = Math.round((currentWeightKg - recommendedWeightKg) * 10) / 10;
  const isDeficit = weightDelta > 0;
  const absoluteDelta = Math.abs(weightDelta);

  let optimalRatePerWeek = 0;
  let minWeeks = 0;
  let optimalWeeks = 0;

  if (isDeficit) {
    // Tasa óptima de pérdida: 0.75% del peso actual por semana; Máxima segura: 1.0%/semana
    optimalRatePerWeek = Math.round((currentWeightKg * 0.0075) * 10) / 10;
    const maxSafeRate = currentWeightKg * 0.01;
    minWeeks = Math.max(1, Math.ceil(absoluteDelta / (maxSafeRate || 0.5)));
    optimalWeeks = Math.max(1, Math.ceil(absoluteDelta / (optimalRatePerWeek || 0.5)));
  } else {
    // Superávit limpio: ganancia de ~0.25% - 0.35% por semana para minimizar acumulación adiposa
    optimalRatePerWeek = Math.round((currentWeightKg * 0.003) * 10) / 10;
    optimalWeeks = Math.max(1, Math.ceil(absoluteDelta / (optimalRatePerWeek || 0.2)));
    minWeeks = Math.max(1, Math.ceil(optimalWeeks * 0.75));
  }

  return {
    recommendedWeightKg,
    lbmKg: Math.round(lbmKg * 10) / 10,
    fatMassDeltaKg: absoluteDelta,
    isDeficit,
    minWeeks,
    optimalWeeks,
    ratePerWeekKg: optimalRatePerWeek,
  };
}

export type FatZone = 'essential_risk' | 'competition' | 'athletic' | 'fitness' | 'high';

export interface FatEvaluation {
  zone: FatZone;
  label: string;
  warning?: string;
  recommendedRange: { min: number; max: number };
  color: 'rose' | 'amber' | 'emerald' | 'zinc';
}

export function evaluateBodyFatGoal(sex: 'male' | 'female', fatPct: number): FatEvaluation {
  if (sex === 'female') {
    const recommendedRange = { min: 20, max: 24 };
    if (fatPct < 14) {
      return {
        zone: 'essential_risk',
        label: 'Riesgo Hormonal Crítico',
        warning: 'Grasa esencial comprometida. Alto riesgo de amenorrea y pérdida de densidad ósea.',
        recommendedRange,
        color: 'rose',
      };
    }
    if (fatPct < 18) {
      return {
        zone: 'competition',
        label: 'Competición Extrema',
        warning: 'Nivel de tarima culturista. Difícil de sostener sin afectación hormonal o metabólica.',
        recommendedRange,
        color: 'amber',
      };
    }
    if (fatPct <= 23) {
      return {
        zone: 'athletic',
        label: 'Atlético Óptimo',
        recommendedRange,
        color: 'emerald',
      };
    }
    if (fatPct <= 28) {
      return {
        zone: 'fitness',
        label: 'Salud / Fitness',
        recommendedRange,
        color: 'zinc',
      };
    }
    return {
      zone: 'high',
      label: 'Elevado',
      recommendedRange,
      color: 'amber',
    };
  }

  // Sexo: male
  const recommendedRange = { min: 10, max: 15 };
  if (fatPct < 6) {
    return {
      zone: 'essential_risk',
      label: 'Riesgo Crítico',
      warning: 'Límite de grasa esencial. Hipogonadismo y letargo severo.',
      recommendedRange,
      color: 'rose',
    };
  }
  if (fatPct < 9) {
    return {
      zone: 'competition',
      label: 'Competición Extrema',
      warning: 'Tarima culturismo. Insostenible para rendimiento atlético BIIO continuado.',
      recommendedRange,
      color: 'amber',
    };
  }
  if (fatPct <= 15) {
    return {
      zone: 'athletic',
      label: 'Atlético Óptimo',
      recommendedRange,
      color: 'emerald',
    };
  }
  if (fatPct <= 20) {
    return {
      zone: 'fitness',
      label: 'Salud / Fitness',
      recommendedRange,
      color: 'zinc',
    };
  }
  return {
    zone: 'high',
    label: 'Elevado',
    recommendedRange,
    color: 'amber',
  };
}


