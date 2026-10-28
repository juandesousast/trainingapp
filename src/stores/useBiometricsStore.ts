import { create } from "zustand";

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

interface BiometricsState {
  entries: BiometricEntry[];
  dailyHabits: DailyHabitEntry[];
  addBiometricEntry: (entry: Omit<BiometricEntry, "id">) => void;
  addDailyHabit: (habit: Omit<DailyHabitEntry, "id">) => void;
}

// Registro histórico inicial Día 1 en ayunas para Hoplita
const initialHoplitaEntries: BiometricEntry[] = [
  {
    id: "bio-init-1",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Semana 1 (Día 1)",
    weightKg: 82.15,
    bmi: 25.4,
    bodyFatPct: 25.6,
    subcutaneousFatPct: 22.8,
    visceralFatRating: 8,
    muscleMassKg: 58.08,
    skeletalMusclePct: 47.9,
    fatFreeMassKg: 61.12,
    boneMassKg: 3.04,
    bmrKcal: 1683,
    bodyWaterPct: 53.7,
    proteinPct: 17.0,
    metabolicAge: 37,
    waistCircumferenceCm: 89,
  },
  {
    id: "bio-init-2",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Semana 2",
    weightKg: 81.7,
    bmi: 25.2,
    bodyFatPct: 24.8,
    subcutaneousFatPct: 22.1,
    visceralFatRating: 8,
    muscleMassKg: 58.2,
    skeletalMusclePct: 48.1,
    fatFreeMassKg: 61.4,
    boneMassKg: 3.05,
    bmrKcal: 1690,
    bodyWaterPct: 54.1,
    proteinPct: 17.2,
    metabolicAge: 36,
    waistCircumferenceCm: 88,
  },
  {
    id: "bio-init-3",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Semana 3",
    weightKg: 81.3,
    bmi: 25.0,
    bodyFatPct: 23.9,
    subcutaneousFatPct: 21.4,
    visceralFatRating: 7,
    muscleMassKg: 58.5,
    skeletalMusclePct: 48.5,
    fatFreeMassKg: 61.8,
    boneMassKg: 3.05,
    bmrKcal: 1702,
    bodyWaterPct: 54.6,
    proteinPct: 17.4,
    metabolicAge: 35,
    waistCircumferenceCm: 87,
  },
  {
    id: "bio-init-4",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Semana 4",
    weightKg: 80.8,
    bmi: 24.8,
    bodyFatPct: 22.9,
    subcutaneousFatPct: 20.6,
    visceralFatRating: 7,
    muscleMassKg: 58.8,
    skeletalMusclePct: 49.0,
    fatFreeMassKg: 62.1,
    boneMassKg: 3.06,
    bmrKcal: 1715,
    bodyWaterPct: 55.2,
    proteinPct: 17.6,
    metabolicAge: 34,
    waistCircumferenceCm: 86,
  },
];

const initialHabits: DailyHabitEntry[] = [
  {
    id: "habit-1",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Hoy",
    sleepHours: "8",
    psychologicalCondition: 1, // 1 Óptima
    sessionRpe: 8,
    workoutQuality: 9,
    notes: "Sesión sólida de Box Squat y Banca. RPE en el target.",
  },
];

export const useBiometricsStore = create<BiometricsState>((set) => ({
  entries: initialHoplitaEntries,
  dailyHabits: initialHabits,

  addBiometricEntry: (entry) => {
    set((state) => ({
      entries: [
        ...state.entries,
        {
          ...entry,
          id: `bio-${Date.now()}`,
        },
      ],
    }));
  },

  addDailyHabit: (habit) => {
    set((state) => ({
      dailyHabits: [
        {
          ...habit,
          id: `habit-${Date.now()}`,
        },
        ...state.dailyHabits,
      ],
    }));
  },
}));
