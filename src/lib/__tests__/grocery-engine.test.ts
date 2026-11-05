import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSmartGroceryList,
  generateGroceryWhatsAppText,
  getGroceryCategoryForFood,
} from "../grocery-engine.ts";
import { DEFAULT_MEAL_FOODS } from "../../stores/useMealCustomizationsStore.ts";

describe("Motor de Lista de la Compra Inteligente - VECTOR OS", () => {
  const mockGetCustomization = (_profileId: string, mealId: string) => {
    return DEFAULT_MEAL_FOODS[mealId] || DEFAULT_MEAL_FOODS.meal_2;
  };

  test("Atleta Juan (82 kg, 20% grasa, 7 días): ponderación 3 entreno / 4 descanso", () => {
    const list = generateSmartGroceryList({
      weightKg: 82,
      bodyFatPct: 20,
      targetBodyFatPct: 12,
      nutritionGoal: "fat_loss",
      sex: "male",
      profileId: "juan-uuid",
      athleteName: "Juan",
      horizonDays: 7,
      getCustomization: mockGetCustomization,
    });

    assert.equal(list.horizonDays, 7);
    assert.equal(list.trainingDays, 3);
    assert.equal(list.restDays, 4);
    assert.equal(list.athleteName, "Juan");
    assert.ok(list.totalItemsCount > 0, "Debe contener artículos en la lista");

    // Verificar suplementación (Creatina 8g * 7 = 56g)
    const suppSection = list.sections.find((s) => s.category === "supplements");
    assert.ok(suppSection, "Debe existir la sección de suplementación");
    const creatine = suppSection?.items.find((i) => i.foodId === "creatina_monohidrato");
    assert.ok(creatine, "Debe existir creatina monohidrato");
    assert.equal(creatine?.totalGrams, 56, "8g/día * 7 días = 56g");
    assert.equal(creatine?.commercialNote, "8g/día");

    // Verificar carnes y pescados (debe estar en kg)
    const meatSection = list.sections.find((s) => s.category === "meat_fish");
    assert.ok(meatSection, "Debe existir sección carnes y pescados");
    const chicken = meatSection?.items.find((i) => i.foodId === "pechuga_pollo");
    assert.ok(chicken, "Debe existir pechuga de pollo");
    assert.ok(chicken!.totalGrams > 1000, "En 7 días debe superar 1000g");
    assert.ok(chicken!.formattedAmount.includes("kg"), "Debe mostrarse en kg");

    // Verificar huevos (Huevos clase M con unidades y docenas)
    const dairySection = list.sections.find((s) => s.category === "dairy_eggs");
    assert.ok(dairySection, "Debe existir sección huevos y lácteos");
    const eggs = dairySection?.items.find((i) => i.foodId === "huevos_enteros");
    assert.ok(eggs, "Deben existir huevos enteros");
    assert.ok(eggs!.formattedAmount.includes("unidades"), "Debe mostrarse en unidades");
    assert.ok(eggs!.detailText.includes("docenas"), "Debe incluir estimación en docenas");
  });

  test("Atleta Wendy (50 kg, 26% grasa, 3 días): ponderación 2 entreno / 1 descanso", () => {
    const list = generateSmartGroceryList({
      weightKg: 50,
      bodyFatPct: 26,
      targetBodyFatPct: 21,
      nutritionGoal: "fat_loss",
      sex: "female",
      profileId: "wendy-uuid",
      athleteName: "Wendy",
      horizonDays: 3,
      getCustomization: mockGetCustomization,
    });

    assert.equal(list.horizonDays, 3);
    assert.equal(list.trainingDays, 2);
    assert.equal(list.restDays, 1);
    assert.equal(list.athleteName, "Wendy");

    // Creatina 5g * 3 = 15g
    const suppSection = list.sections.find((s) => s.category === "supplements");
    const creatine = suppSection?.items.find((i) => i.foodId === "creatina_monohidrato");
    assert.equal(creatine?.totalGrams, 15, "5g/día * 3 días = 15g");
  });

  test("Horizonte 5 días: ponderación 2 entreno / 3 descanso", () => {
    const list = generateSmartGroceryList({
      weightKg: 82,
      bodyFatPct: 20,
      targetBodyFatPct: 12,
      nutritionGoal: "fat_loss",
      sex: "male",
      profileId: "juan-uuid",
      athleteName: "Juan",
      horizonDays: 5,
      getCustomization: mockGetCustomization,
    });

    assert.equal(list.horizonDays, 5);
    assert.equal(list.trainingDays, 2);
    assert.equal(list.restDays, 3);

    // Creatina 8g * 5 = 40g
    const suppSection = list.sections.find((s) => s.category === "supplements");
    const creatine = suppSection?.items.find((i) => i.foodId === "creatina_monohidrato");
    assert.equal(creatine?.totalGrams, 40, "8g/día * 5 días = 40g");
  });

  test("Categorización correcta de alimentos comerciales", () => {
    assert.equal(getGroceryCategoryForFood("pechuga_pollo"), "meat_fish");
    assert.equal(getGroceryCategoryForFood("salmon_fresco"), "meat_fish");
    assert.equal(getGroceryCategoryForFood("huevos_enteros"), "dairy_eggs");
    assert.equal(getGroceryCategoryForFood("claras_huevo"), "dairy_eggs");
    assert.equal(getGroceryCategoryForFood("arroz_basmati"), "pantry_carbs");
    assert.equal(getGroceryCategoryForFood("avena_integral"), "pantry_carbs");
    assert.equal(getGroceryCategoryForFood("patata"), "produce");
    assert.equal(getGroceryCategoryForFood("boniato"), "produce");
    assert.equal(getGroceryCategoryForFood("brocoli_vapor"), "produce");
    assert.equal(getGroceryCategoryForFood("arandanos_frutos_rojos"), "produce");
    assert.equal(getGroceryCategoryForFood("aove"), "healthy_fats");
    assert.equal(getGroceryCategoryForFood("nueces"), "healthy_fats");
    assert.equal(getGroceryCategoryForFood("whey_isolate"), "supplements");
    assert.equal(getGroceryCategoryForFood("creatina_monohidrato"), "supplements");
  });

  test("Generación de texto para WhatsApp", () => {
    const list = generateSmartGroceryList({
      weightKg: 82,
      bodyFatPct: 20,
      targetBodyFatPct: 12,
      nutritionGoal: "fat_loss",
      sex: "male",
      profileId: "juan-uuid",
      athleteName: "Juan",
      horizonDays: 7,
      getCustomization: mockGetCustomization,
    });

    const text = generateGroceryWhatsAppText(list);
    assert.ok(text.includes("🛒 LISTA DE LA COMPRA - VECTOR OS (7 Días)"));
    assert.ok(text.includes("Atleta: Juan"));
    assert.ok(text.includes("CARNES Y PESCADOS"));
    assert.ok(text.includes("FRUTAS, VERDURAS Y TUBÉRCULOS"));
    assert.ok(text.includes("HUEVOS Y LÁCTEOS"));
    assert.ok(text.includes("DESPENSA Y CARBOHIDRATOS"));
    assert.ok(text.includes("GRASAS SALUDABLES Y FRUTOS SECOS"));
    assert.ok(text.includes("SUPLEMENTACIÓN Y RENDIMIENTO"));
    assert.ok(text.includes("Creatina Monohidrato: 56g (8g/día)"));
  });
});
