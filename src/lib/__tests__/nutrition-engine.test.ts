import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCreatineDose,
  calculateRecommendedTargetWeight,
} from "../nutrition-engine.ts";

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
});
