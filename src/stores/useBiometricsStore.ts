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
  dailyHabits: DailyHabitEntry[];
  recoveryCheckins: RecoveryCheckinEntry[];
  addBiometricEntry: (entry: Omit<BiometricEntry, "id">) => void;
  addDailyHabit: (habit: Omit<DailyHabitEntry, "id">) => void;
  addRecoveryCheckin: (checkin: Omit<RecoveryCheckinEntry, "id" | "recordedAt">) => void;
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
    psychologicalCondition: 1,
    sessionRpe: 8,
    workoutQuality: 9,
    notes: "Sesión sólida de Box Squat y Banca. RPE en el target.",
  },
];

const initialRecoveryCheckin: RecoveryCheckinEntry[] = [
  {
    id: "rec-1",
    profileId: "11111111-1111-1111-1111-111111111111",
    date: "Hoy",
    sleepQuality: "Reparador",
    domsLevel: "Leve",
    waterIntake: "3L",
    motivation: "Altas",
    dailySteps: "+10k",
    recordedAt: Date.now(),
  },
];

export const useBiometricsStore = create<BiometricsState>((set) => ({
  entries: initialHoplitaEntries,
  dailyHabits: initialHabits,
  recoveryCheckins: initialRecoveryCheckin,

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
