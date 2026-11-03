import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCreatineDose,
  calculateRecommendedTargetWeight,
  evaluateBodyFatGoal,
  calculateNutritionPlan,
} from "../nutrition-engine.ts";
import {
  CLEAN_FOODS,
  calculateFoodPortion,
} from "../food-database.ts";

describe("Motor Nutricional y Biofísica - VECTOR OS", () => {
  test("Atleta Wendy: 50 kg, 26% grasa actual -> meta 21%", () => {
    const projection = calculateRecommendedTargetWeight({
      currentWeightKg: 50,
      currentBodyFatPct: 26,
      targetBodyFatPct: 21,
    });

    assert.equal(projection.lbmKg, 37.0, "La masa magra (LBM) debe ser 37.0 kg");
    assert.equal(projection.recommendedWeightKg, 46.8, "El peso recomendado debe ser 46.8 kg");
    assert.equal(projection.isDeficit, true, "Debe clasificarse como fase de déficit");
    assert.ok(projection.optimalWeeks > 0, "Las semanas estimadas deben ser positivas");

    const creatine = calculateCreatineDose(50);
    assert.equal(creatine, 5.0, "La dosis de creatina para Wendy debe ser 5.0 g/día");
  });

  test("Atleta Juan: 82 kg, 20% grasa actual -> meta 12%", () => {
    const projection = calculateRecommendedTargetWeight({
      currentWeightKg: 82,
      currentBodyFatPct: 20,
      targetBodyFatPct: 12,
    });

    assert.equal(projection.lbmKg, 65.6, "La masa magra (LBM) debe ser 65.6 kg");
    assert.equal(projection.recommendedWeightKg, 74.5, "El peso recomendado debe ser 74.5 kg");
    assert.equal(projection.isDeficit, true, "Debe clasificarse como fase de déficit");
    assert.ok(projection.optimalWeeks > 0, "Las semanas estimadas deben ser positivas");

    const creatine = calculateCreatineDose(82);
    assert.equal(creatine, 8.0, "La dosis de creatina para Juan debe ser 8.0 g/día");
  });

  test("Límites fisiológicos de Creatina", () => {
    // Muy bajo peso: no debe bajar de 3g
    assert.equal(calculateCreatineDose(20), 3.0);
    // Cero o negativo: fallback seguro a 5g
    assert.equal(calculateCreatineDose(0), 5.0);
    assert.equal(calculateCreatineDose(-10), 5.0);
    // Muy alto peso: clamp máximo a 10g
    assert.equal(calculateCreatineDose(120), 10.0);
    // Intervalos de 0.5g
    assert.equal(calculateCreatineDose(85), 8.5);
  });

  test("Evaluador fisiológico de % Grasa Corporal (evaluateBodyFatGoal)", () => {
    // Wendy (female) con 15% de grasa: Competición extrema y advertencia
    const wendyEval = evaluateBodyFatGoal("female", 15);
    assert.equal(wendyEval.zone, "competition");
    assert.equal(wendyEval.color, "amber");
    assert.ok(wendyEval.warning, "Debe incluir advertencia de nivel tarima / hormonal");
    assert.deepEqual(wendyEval.recommendedRange, { min: 20, max: 24 });

    // Juan (male) con 15% de grasa: Atlético Óptimo sin advertencia
    const juanEval = evaluateBodyFatGoal("male", 15);
    assert.equal(juanEval.zone, "athletic");
    assert.equal(juanEval.color, "emerald");
    assert.equal(juanEval.warning, undefined);
    assert.deepEqual(juanEval.recommendedRange, { min: 10, max: 15 });

    // Riesgo crítico esencial femenino (<14%)
    const femaleRisk = evaluateBodyFatGoal("female", 12);
    assert.equal(femaleRisk.zone, "essential_risk");
    assert.equal(femaleRisk.color, "rose");

    // Riesgo crítico esencial masculino (<6%)
    const maleRisk = evaluateBodyFatGoal("male", 5);
    assert.equal(maleRisk.zone, "essential_risk");
    assert.equal(maleRisk.color, "rose");
  });

  test("Reconciliación matemática exacta de las 4 comidas con el presupuesto diario", () => {
    const testCases = [
      { weightKg: 50, bodyFatPct: 26, isTrainingDay: true, sex: "female" as const },
      { weightKg: 82, bodyFatPct: 20, isTrainingDay: true, sex: "male" as const },
      { weightKg: 70, bodyFatPct: 15, isTrainingDay: false, sex: "male" as const },
      { weightKg: 55, bodyFatPct: 22, isTrainingDay: false, sex: "female" as const },
    ];

    for (const tc of testCases) {
      const plan = calculateNutritionPlan(tc);

      assert.equal(plan.meals.length, 4, "Debe generar exactamente 4 comidas");

      const sumCalories = plan.meals.reduce((acc, m) => acc + m.calories, 0);
      const sumProtein = plan.meals.reduce((acc, m) => acc + m.proteinGrams, 0);
      const sumCarbs = plan.meals.reduce((acc, m) => acc + m.carbGrams, 0);
      const sumFats = plan.meals.reduce((acc, m) => acc + m.fatGrams, 0);

      assert.equal(sumCalories, plan.targetCalories, `Calorías sumadas (${sumCalories}) deben ser idénticas al target (${plan.targetCalories})`);
      assert.equal(sumProtein, plan.proteinGrams, `Proteína sumada (${sumProtein}) debe ser idéntica al target (${plan.proteinGrams})`);
      assert.equal(sumCarbs, plan.carbGrams, `Carbohidratos sumados (${sumCarbs}) deben ser idénticos al target (${plan.carbGrams})`);
      assert.equal(sumFats, plan.fatGrams, `Grasas sumadas (${sumFats}) deben ser idénticas al target (${plan.fatGrams})`);
    }
  });

  test("Catálogo y cálculo de porciones de Micronutrientes y Salmón", () => {
    // 100g de arándanos (Desayuno)
    const arandanos = CLEAN_FOODS.arandanos_frutos_rojos;
    assert.ok(arandanos, "Debe existir arandanos_frutos_rojos en CLEAN_FOODS");
    const portionArandanos = calculateFoodPortion(100, "micros", arandanos);
    assert.equal(portionArandanos.grams, 100);
    assert.equal(portionArandanos.carbContribution, 14.5);
    assert.equal(portionArandanos.calories, 57);

    // 200g de brócoli al vapor (Almuerzo)
    const brocoli = CLEAN_FOODS.brocoli_vapor;
    assert.ok(brocoli, "Debe existir brocoli_vapor en CLEAN_FOODS");
    const portionBrocoli = calculateFoodPortion(200, "micros", brocoli);
    assert.equal(portionBrocoli.grams, 200);
    assert.equal(portionBrocoli.carbContribution, 8);
    assert.equal(portionBrocoli.calories, 56);

    // Salmón fresco y aporte lipídico
    const salmon = CLEAN_FOODS.salmon_fresco;
    assert.ok(salmon, "Debe existir salmon_fresco en CLEAN_FOODS");
    assert.equal(salmon.fatsPer100g, 13);
    assert.equal(salmon.proteinPer100g, 20);
    const portionSalmon = calculateFoodPortion(40, "protein", salmon);
    // Para 40g de proteína se requieren 200g de salmón
    assert.equal(portionSalmon.grams, 200);
    assert.equal(portionSalmon.fatContribution, 26); // 200g * 13g/100g = 26g de grasa
  });
});
