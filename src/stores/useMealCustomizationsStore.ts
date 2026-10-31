import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MacroCategory } from "@/lib/food-database";

export interface MealCustomization {
  proteinFoodId: string;
  carbFoodId: string;
  fatFoodId: string;
}

export const DEFAULT_MEAL_FOODS: Record<string, MealCustomization> = {
  meal_1: {
    proteinFoodId: "huevos_enteros",
    carbFoodId: "avena_integral",
    fatFoodId: "nueces",
  },
  meal_2: {
    proteinFoodId: "pechuga_pollo",
    carbFoodId: "arroz_basmati",
    fatFoodId: "aove",
  },
  meal_3: {
    proteinFoodId: "whey_isolate",
    carbFoodId: "tortitas_arroz",
    fatFoodId: "almendras",
  },
  meal_4: {
    proteinFoodId: "merluza_bacalao",
    carbFoodId: "patata",
    fatFoodId: "aove",
  },
};

interface MealCustomizationsState {
  // Key format: `${profileSlug}_${mealId}` (ej. "juan_meal_1", "wendy_meal_2")
  customizations: Record<string, MealCustomization>;
  getCustomization: (profileSlug: string, mealId: string) => MealCustomization;
  setSwap: (
    profileSlug: string,
    mealId: string,
    category: MacroCategory,
    foodId: string
  ) => void;
  resetCustomizations: (profileSlug: string) => void;
}

export const useMealCustomizationsStore = create<MealCustomizationsState>()(
  persist(
    (set, get) => ({
      customizations: {},

      getCustomization: (profileSlug: string, mealId: string) => {
        const key = `${profileSlug}_${mealId}`;
        const existing = get().customizations[key];
        if (existing) return existing;
        return DEFAULT_MEAL_FOODS[mealId] || DEFAULT_MEAL_FOODS["meal_2"];
      },

      setSwap: (
        profileSlug: string,
        mealId: string,
        category: MacroCategory,
        foodId: string
      ) => {
        const key = `${profileSlug}_${mealId}`;
        const current = get().getCustomization(profileSlug, mealId);

        const updated: MealCustomization = {
          ...current,
          ...(category === "protein" ? { proteinFoodId: foodId } : {}),
          ...(category === "carbs" ? { carbFoodId: foodId } : {}),
          ...(category === "fats" ? { fatFoodId: foodId } : {}),
        };

        set((state) => ({
          customizations: {
            ...state.customizations,
            [key]: updated,
          },
        }));
      },

      resetCustomizations: (profileSlug: string) => {
        set((state) => {
          const filtered = { ...state.customizations };
          Object.keys(filtered).forEach((k) => {
            if (k.startsWith(`${profileSlug}_`)) {
              delete filtered[k];
            }
          });
          return { customizations: filtered };
        });
      },
    }),
    {
      name: "hoplita-meal-customizations-storage",
    }
  )
);
