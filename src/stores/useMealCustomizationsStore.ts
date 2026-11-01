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
  // Key format: `${profileId}_${mealId}` (UUID de perfil y comida)
  customizations: Record<string, MealCustomization>;
  getCustomization: (profileId: string, mealId: string) => MealCustomization;
  setSwap: (
    profileId: string,
    mealId: string,
    category: MacroCategory,
    foodId: string
  ) => void;
  resetCustomizations: (profileId: string) => void;
}

export const useMealCustomizationsStore = create<MealCustomizationsState>()(
  persist(
    (set, get) => ({
      customizations: {},

      getCustomization: (profileId: string, mealId: string) => {
        const key = `${profileId}_${mealId}`;
        const existing = get().customizations[key];
        if (existing) return existing;
        return DEFAULT_MEAL_FOODS[mealId] || DEFAULT_MEAL_FOODS["meal_2"];
      },

      setSwap: (
        profileId: string,
        mealId: string,
        category: MacroCategory,
        foodId: string
      ) => {
        const key = `${profileId}_${mealId}`;
        const current = get().getCustomization(profileId, mealId);

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

      resetCustomizations: (profileId: string) => {
        set((state) => {
          const filtered = { ...state.customizations };
          Object.keys(filtered).forEach((k) => {
            if (k.startsWith(`${profileId}_`)) {
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
