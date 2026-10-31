import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { toLocalDateString } from "@/lib/activityStats";
import { soundEngine } from "@/lib/audio";

export interface SupplementItem {
  id: string;
  name: string;
  timing: "morning" | "afternoon" | "night";
  baseDose: string;
  getDynamicDose?: (weightKg: number, isTrainingDay: boolean) => string;
  notes: string;
  iconName: string;
}

export const SUPPLEMENT_CATALOG: SupplementItem[] = [
  // 1. Mañana / Desayuno
  {
    id: "d3_k2",
    name: "Vitamina D3 + K2",
    timing: "morning",
    baseDose: "1 cápsula",
    getDynamicDose: () => "1 cápsula (con fuente de grasa)",
    notes: "Tomar con el desayuno junto a grasas saludables (huevos, AOVE o aguacate).",
    iconName: "Sun",
  },
  {
    id: "citrulline",
    name: "Citrulina Malato",
    timing: "morning",
    baseDose: "3 g",
    getDynamicDose: (_w, isTrainingDay) =>
      isTrainingDay ? "6 - 8 g (Pre-entreno)" : "3 g (con agua)",
    notes: "Vasodilatación, flujo sanguíneo y recuperación endotelial.",
    iconName: "Flame",
  },

  // 2. Comida o Merienda
  {
    id: "creatine",
    name: "Creatina Monohidrato",
    timing: "afternoon",
    baseDose: "4.0 g",
    getDynamicDose: (weightKg) => {
      const grams = Math.round(weightKg * 0.05 * 10) / 10;
      return `${grams.toFixed(1)} g`;
    },
    notes: "0.05g/kg de peso. Saturación de fosfocreatina y potencia neuromuscular.",
    iconName: "Zap",
  },
  {
    id: "whey",
    name: "Proteína Whey",
    timing: "afternoon",
    baseDose: "1 scoop",
    getDynamicDose: () => "1 scoop (~25-30 g proteína)",
    notes: "Opcional según requerimiento proteico diario de la dieta.",
    iconName: "Utensils",
  },

  // 3. Noche / Antes de Dormir
  {
    id: "magnesium",
    name: "Bisglicinato de Magnesio",
    timing: "night",
    baseDose: "1 dosis",
    getDynamicDose: () => "1 dosis (~200-400 mg magnesio elemental)",
    notes: "Tomar 30-45 min antes de acostarse con medio vaso de agua.",
    iconName: "Moon",
  },
];

interface SupplementStoreState {
  // Mapa de estado de suplementos para la fecha actual: key = item_id, value = boolean
  dailyLogs: Record<string, boolean>;
  waterIntakeLiters: number;
  selectedDate: string;
  isTrainingDayOverride: boolean | null; // null = auto según calendario / sesiones
  isExpanded: boolean;
  isLoading: boolean;

  // Acciones
  toggleExpanded: () => void;
  setTrainingDayOverride: (isTraining: boolean | null) => void;
  fetchTodayLogs: (userId: string) => Promise<void>;
  toggleSupplementTaken: (userId: string, itemId: string) => Promise<void>;
  addWater: (userId: string, litersDelta: number, targetLiters: number) => Promise<void>;
  resetWater: (userId: string) => Promise<void>;
}

export const useSupplementStore = create<SupplementStoreState>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      waterIntakeLiters: 0,
      selectedDate: toLocalDateString(new Date()),
      isTrainingDayOverride: null,
      isExpanded: true,
      isLoading: false,

      toggleExpanded: () => {
        set((state) => ({ isExpanded: !state.isExpanded }));
      },

      setTrainingDayOverride: (isTraining) => {
        soundEngine.playTap();
        set({ isTrainingDayOverride: isTraining });
      },

      fetchTodayLogs: async (userId: string) => {
        const todayStr = toLocalDateString(new Date());
        set({ isLoading: true, selectedDate: todayStr });

        try {
          const { data, error } = await supabase
            .from("daily_supplement_logs")
            .select("item_id, taken, value_numeric")
            .eq("user_id", userId)
            .eq("date", todayStr);

          if (error) {
            console.warn("Aviso al consultar daily_supplement_logs:", error.message);
            return;
          }

          const logsMap: Record<string, boolean> = {};
          let waterValue = get().waterIntakeLiters;

          if (data && data.length > 0) {
            data.forEach((row: any) => {
              if (row.item_id === "water_liters") {
                waterValue = Number(row.value_numeric || 0);
              } else {
                logsMap[row.item_id] = Boolean(row.taken);
              }
            });
          }

          set({
            dailyLogs: logsMap,
            waterIntakeLiters: waterValue,
            selectedDate: todayStr,
          });
        } catch (err) {
          console.error("Error al cargar registros de suplementación:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleSupplementTaken: async (userId: string, itemId: string) => {
        soundEngine.playTap();
        const todayStr = toLocalDateString(new Date());
        const currentVal = Boolean(get().dailyLogs[itemId]);
        const newVal = !currentVal;

        // Actualización optimista local
        set((state) => ({
          dailyLogs: {
            ...state.dailyLogs,
            [itemId]: newVal,
          },
          selectedDate: todayStr,
        }));

        if (!userId) return;

        try {
          await supabase.from("daily_supplement_logs").upsert(
            {
              user_id: userId,
              date: todayStr,
              item_id: itemId,
              taken: newVal,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,date,item_id" }
          );
        } catch (err) {
          console.error("Error al persistir suplemento en Supabase:", err);
        }
      },

      addWater: async (userId: string, litersDelta: number, targetLiters: number) => {
        soundEngine.playTap();
        const todayStr = toLocalDateString(new Date());
        const currentWater = get().waterIntakeLiters || 0;
        const newWater = Math.max(0, Math.round((currentWater + litersDelta) * 100) / 100);

        set({ waterIntakeLiters: newWater, selectedDate: todayStr });

        if (!userId) return;

        try {
          await supabase.from("daily_supplement_logs").upsert(
            {
              user_id: userId,
              date: todayStr,
              item_id: "water_liters",
              taken: newWater >= targetLiters,
              value_numeric: newWater,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,date,item_id" }
          );
        } catch (err) {
          console.error("Error al persistir agua en Supabase:", err);
        }
      },

      resetWater: async (userId: string) => {
        soundEngine.playTap();
        const todayStr = toLocalDateString(new Date());
        set({ waterIntakeLiters: 0, selectedDate: todayStr });

        if (!userId) return;

        try {
          await supabase.from("daily_supplement_logs").upsert(
            {
              user_id: userId,
              date: todayStr,
              item_id: "water_liters",
              taken: false,
              value_numeric: 0,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,date,item_id" }
          );
        } catch (err) {
          console.error("Error al resetear agua en Supabase:", err);
        }
      },
    }),
    {
      name: "hoplita-supplement-storage",
      partialize: (state) => ({
        dailyLogs: state.dailyLogs,
        waterIntakeLiters: state.waterIntakeLiters,
        selectedDate: state.selectedDate,
        isTrainingDayOverride: state.isTrainingDayOverride,
        isExpanded: state.isExpanded,
      }),
    }
  )
);
