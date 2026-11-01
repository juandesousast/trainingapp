import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface BiometricEntry {
  id: string;
  profileId: string;
  date: string;
  weightKg: number;
  bmi: number;
  bodyFatPct: number;
  subcutaneousFatPct: number;
  visceralFatRating: number;
  fatFreeMassKg: number;
  muscleMassKg: number;
  boneMassKg: number;
  skeletalMusclePct: number;
  bodyWaterPct: number;
  proteinPct: number;
  bmrKcal: number;
  metabolicAge: number;
  waistCircumferenceCm?: number;
  neckCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  hipCm?: number;
  isFasting?: boolean;
  createdAt?: string;
}

export interface DailyHabitEntry {
  id: string;
  profileId: string;
  date: string;
  sleepHours: string; // '6 o menos', '7', '8', '9', '10+'
  psychologicalCondition: number; // 1 a 5
  sessionRpe: number; // 1 a 10
  workoutQuality: number; // 1 a 10
  notes?: string;
}

export interface RecoveryCheckinEntry {
  id: string;
  profileId: string;
  date: string;
  sleepQuality: "Muy profundo" | "Reparador" | "Normal" | "Ligero" | "Imposible";
  domsLevel: "Sin dolor" | "Leve" | "Moderado" | "Intenso" | "Incapacitante";
  waterIntake: "1L" | "2L" | "3L" | "4L" | "+5L";
  motivation: "Máximas" | "Altas" | "Normal" | "Pocas" | "Nulas";
  dailySteps: "+10k" | "8k-10k" | "6k-8k" | "4k-6k" | "-4k";
  recordedAt: number;
}

interface BiometricsState {
  entries: BiometricEntry[];
  history: BiometricEntry[];
  latestLog: BiometricEntry | null;
  dailyHabits: DailyHabitEntry[];
  recoveryCheckins: RecoveryCheckinEntry[];
  fetchUserData: (profileId?: string) => Promise<void>;
  fetchBiometrics: (profileId?: string) => Promise<void>;
  addBiometricEntry: (entry: Omit<BiometricEntry, "id">) => Promise<BiometricEntry>;
  addDailyHabit: (habit: Omit<DailyHabitEntry, "id">) => Promise<void>;
  addRecoveryCheckin: (checkin: Omit<RecoveryCheckinEntry, "id" | "recordedAt">) => void;
}

export const useBiometricsStore = create<BiometricsState>((set, get) => ({
  entries: [],
  history: [],
  latestLog: null,
  dailyHabits: [],
  recoveryCheckins: [],

  fetchUserData: async (profileId?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!profileId && !user) {
        set({ entries: [], dailyHabits: [] });
        return;
      }

      // 1. Consultar registros biométricos del perfil con filtro estricto
      let bioQuery = supabase
        .from("biometric_logs")
        .select("*")
        .order("measured_at", { ascending: true })
        .order("created_at", { ascending: true });

      if (profileId) {
        bioQuery = bioQuery.eq("profile_id", profileId);
      } else if (user) {
        bioQuery = bioQuery.eq("user_id", user.id);
      }

      const { data: bioData } = await bioQuery;

      if (bioData && bioData.length > 0) {
        const mappedEntries: BiometricEntry[] = bioData.map((b: any) => ({
          id: b.id,
          profileId: b.profile_id,
          date: b.measured_at,
          weightKg: Number(b.weight_kg),
          bmi: Number(b.bmi || 25),
          bodyFatPct: Number(b.body_fat_pct || 20),
          subcutaneousFatPct: Number(b.subcutaneous_fat_pct || 18),
          visceralFatRating: Number(b.visceral_fat_rating || 5),
          fatFreeMassKg: Number(b.fat_free_mass_kg || 60),
          muscleMassKg: Number(b.muscle_mass_kg || 55),
          boneMassKg: Number(b.bone_mass_kg || 3),
          skeletalMusclePct: Number(b.skeletal_muscle_pct || 45),
          bodyWaterPct: Number(b.body_water_pct || 55),
          proteinPct: Number(b.protein_pct || 17),
          bmrKcal: Number(b.bmr_kcal || 1650),
          metabolicAge: Number(b.metabolic_age || 30),
          waistCircumferenceCm: b.waist_cm ? Number(b.waist_cm) : undefined,
          neckCm: b.neck_cm ? Number(b.neck_cm) : undefined,
          chestCm: b.chest_cm ? Number(b.chest_cm) : undefined,
          armCm: b.arm_cm ? Number(b.arm_cm) : undefined,
          thighCm: b.thigh_cm ? Number(b.thigh_cm) : undefined,
          hipCm: b.hip_cm ? Number(b.hip_cm) : undefined,
          isFasting: b.is_fasting ?? true,
          createdAt: b.created_at,
        }));

        set({
          entries: mappedEntries,
          history: mappedEntries,
          latestLog: mappedEntries[mappedEntries.length - 1],
        });
      } else {
        set({ entries: [], history: [], latestLog: null });
      }

      // 2. Consultar hábitos diarios del perfil con filtro estricto
      let habitsQuery = supabase
        .from("daily_habits")
        .select("*")
        .order("log_date", { ascending: false });

      if (profileId) {
        habitsQuery = habitsQuery.eq("profile_id", profileId);
      } else if (user) {
        habitsQuery = habitsQuery.eq("user_id", user.id);
      }

      const { data: habitsData } = await habitsQuery;

      if (habitsData && habitsData.length > 0) {
        set({
          dailyHabits: habitsData.map((h: any) => ({
            id: h.id,
            profileId: h.profile_id,
            date: h.log_date,
            sleepHours: String(h.sleep_hours || "8"),
            psychologicalCondition: h.psychological_condition || 1,
            sessionRpe: h.session_rpe || 8,
            workoutQuality: h.workout_quality || 8,
            notes: h.notes,
          })),
        });
      } else {
        set({ dailyHabits: [] });
      }
    } catch (err) {
      console.error("Error al cargar datos de biometría del usuario:", err);
    }
  },

  fetchBiometrics: async (profileId?: string) => {
    await get().fetchUserData(profileId);
  },

  addBiometricEntry: async (entry) => {
    // Normalizar fecha a formato estándar YYYY-MM-DD
    const todayStr =
      entry.date && !entry.date.startsWith("Medición")
        ? entry.date
        : new Date().toISOString().split("T")[0];

    const newEntry: BiometricEntry = {
      ...entry,
      id: `bio-${Date.now()}`,
      date: todayStr,
      isFasting: entry.isFasting ?? true,
      createdAt: new Date().toISOString(),
    };

    // 1. Actualización optimista e inmediata del estado global en memoria
    set((state) => {
      const updated = [...state.entries, newEntry];
      return {
        entries: updated,
        history: updated,
        latestLog: newEntry,
      };
    });

    // 2. Persistencia en Supabase
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("biometric_logs").insert({
        user_id: user?.id,
        profile_id: entry.profileId,
        measured_at: todayStr,
        is_fasting: entry.isFasting ?? true,
        weight_kg: entry.weightKg,
        bmi: entry.bmi,
        body_fat_pct: entry.bodyFatPct,
        subcutaneous_fat_pct: entry.subcutaneousFatPct,
        visceral_fat_rating: entry.visceralFatRating,
        fat_free_mass_kg: entry.fatFreeMassKg,
        muscle_mass_kg: entry.muscleMassKg,
        bone_mass_kg: entry.boneMassKg,
        skeletal_muscle_pct: entry.skeletalMusclePct,
        body_water_pct: entry.bodyWaterPct,
        protein_pct: entry.proteinPct,
        bmr_kcal: entry.bmrKcal,
        metabolic_age: entry.metabolicAge,
        waist_cm: entry.waistCircumferenceCm,
        neck_cm: entry.neckCm,
        chest_cm: entry.chestCm,
        arm_cm: entry.armCm,
        thigh_cm: entry.thighCm,
        hip_cm: entry.hipCm,
      });

      // 3. Refetch en background para sincronizar con la base de datos
      if (entry.profileId) {
        get().fetchUserData(entry.profileId);
      }
    } catch (err) {
      console.warn("Aviso al guardar biometric_logs en Supabase:", err);
    }

    return newEntry;
  },

  addDailyHabit: async (habit) => {
    const newHabit: DailyHabitEntry = {
      ...habit,
      id: `habit-${Date.now()}`,
    };

    set((state) => ({
      dailyHabits: [newHabit, ...state.dailyHabits],
    }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("daily_habits").insert({
        user_id: user?.id,
        profile_id: habit.profileId,
        log_date: new Date().toISOString().split("T")[0],
        sleep_hours: parseFloat(habit.sleepHours) || 8,
        psychological_condition: habit.psychologicalCondition,
        session_rpe: habit.sessionRpe,
        workout_quality: habit.workoutQuality,
        notes: habit.notes,
      });
    } catch (err) {
      console.warn("Aviso al guardar daily_habits en Supabase:", err);
    }
  },

  addRecoveryCheckin: (checkin) => {
    set((state) => ({
      recoveryCheckins: [
        {
          ...checkin,
          id: `rec-${Date.now()}`,
          recordedAt: Date.now(),
        },
        ...state.recoveryCheckins,
      ],
    }));
  },
}));
