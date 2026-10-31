import { create } from "zustand";
import { Workout, Mesocycle, LoggedSet } from "@/lib/types";
import { soundEngine } from "@/lib/audio";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/stores/useProfileStore";
import { useMesocyclesStore } from "@/stores/useMesocyclesStore";

export interface LiftProgression {
  slug: string;
  name: string;
  muscleGroup: string;
  startWeightKg: number;
  startReps: number;
  endWeightKg: number;
  endReps: number;
  deltaKg: number;
  deltaPercent: number;
  previous1RM: number;
  proposed1RM: number;
}

export interface MesocycleCompletionData {
  mesocycleNumber: number;
  mesocycleName: string;
  totalExposures: number;
  completedAt: string;
  progressions: LiftProgression[];
  nextMesocycleNumber?: number;
  nextMesocycleName?: string;
  nextMesocycleTotalExposures?: number;
  isMacrocyleComplete?: boolean;
}

interface WorkoutSessionState {
  activeMesocycle: Mesocycle | null;
  activeWorkout: Workout | null;
  isLiveSession: boolean;
  currentExerciseIndex: number;
  sessionStartTime: number | null;

  // Series por cada ejercicio del entreno: key = workoutExerciseId
  setsByExercise: Record<string, LoggedSet[]>;

  // Maximales (1RM en kg) del usuario: key = exercise_slug
  userMaxes: Record<string, number>;

  // Modal de Graduación / Finalización de Mesociclo
  showMesocycleCompletionModal: boolean;
  mesocycleCompletionData: MesocycleCompletionData | null;
  closeMesocycleCompletionModal: () => void;
  activateNextMesocycle: () => Promise<void>;
  activateMesocycle2: () => Promise<void>; // Alias de compatibilidad retroactiva

  // Isla flotante de descanso
  isResting: boolean;
  restTimeRemaining: number;
  restTotalSeconds: number;
  restTimerInterval: any | null;

  // Temporizador Cluster Set (Mesociclo 5)
  isClusterActive: boolean;
  clusterCurrentRep: number; // 1 a 8
  clusterTotalReps: number;  // 8
  clusterIntervalSecs: number; // 15, 20 o 25
  clusterSecsRemaining: number;
  clusterIntervalTimer: any | null;

  // Acciones
  startWorkout: (mesocycle: Mesocycle, workout: Workout) => void;
  finishWorkout: (cooldownInfo?: { cooldownType: string; durationMinutes: number }) => Promise<void>;
  cancelWorkout: () => void;
  setCurrentExerciseIndex: (index: number) => void;

  // Cero-teclado
  adjustWeight: (exerciseId: string, setIndex: number, deltaKg: number) => void;
  adjustReps: (exerciseId: string, setIndex: number, deltaReps: number) => void;
  toggleSetCompleted: (exerciseId: string, setIndex: number, restSeconds: number, isCluster?: boolean, clusterInterval?: number) => void;

  // Temporizador Rest
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  skipRestTimer: () => void;

  // Temporizador Cluster
  startClusterTimer: (intervalSecs: number) => void;
  stopClusterTimer: () => void;
  nextClusterRepManual: () => void;

  // 1RM
  update1RM: (exerciseSlug: string, new1RM: number) => void;
  loadUserMaxes: (profileId: string) => Promise<void>;
  setUserMaxes: (newMaxes: Record<string, number>) => void;
}

export const MESOCYCLE_METADATA: Record<
  number,
  {
    name: string;
    code: string;
    totalExposures: number;
    splitDesc: string;
    schemeDesc: string;
  }
> = {
  1: {
    name: "Reacondicionamiento",
    code: "M1",
    totalExposures: 12,
    splitDesc: "Split A + B (12 Sesiones)",
    schemeDesc: "Pirámide 15-12-10 (60%, 65%, 70%) · Pausa 1'30\"",
  },
  2: {
    name: "Preparación Fuerza",
    code: "M2",
    totalExposures: 9,
    splitDesc: "Split A + B + C (9 Sesiones)",
    schemeDesc: "Sobrecarga 8-6-4 a RIR 0 + Descarga 8x3 · Pausa 2'00\"-2'30\"",
  },
  3: {
    name: "Especialización Técnica",
    code: "M3",
    totalExposures: 9,
    splitDesc: "Split A + B + C (9 Sesiones)",
    schemeDesc: "Tensión continua 6-6-6 + Descarga Técnica · Pausa 2'15\"",
  },
  4: {
    name: "Fuerza 1",
    code: "M4",
    totalExposures: 9,
    splitDesc: "Split A + B + C (9 Sesiones)",
    schemeDesc: "Pirámide pesada 5-4-3-2 + Descarga 2:1 · Pausa 2'30\"-3'00\"",
  },
  5: {
    name: "Fuerza 2 + Maximales",
    code: "M5",
    totalExposures: 9,
    splitDesc: "Split A + B + C (9 Sesiones)",
    schemeDesc: "Cluster sets 1 rep / 15\"-25\" + Test 1RM Real",
  },
};

export const EXERCISE_ID_BY_SLUG: Record<string, string> = {
  box_squat: "b722e036-ec24-4de0-8d9a-ceb263c8433b",
  bench_press: "d4aa5b02-6743-4d3d-9fc9-9e5c11fe0bf1",
  barbell_row: "e1e31e4b-89a8-4ab0-857e-770c252e3403",
  deadlift: "f5216b32-5241-425a-bdcd-1d7a83bb289f",
  military_press: "1cfd9b80-77f4-4c71-a35b-609e84ca7806",
  seated_military_press: "3b1a2a9d-447e-41f0-9533-a43683e606b5",
  landmine_row: "3d5c7bcd-e48e-421a-805b-59bb8a33c040",
  hip_thrust: "8c2ae95f-5710-444c-ac6e-ecc51847cf51",
  squat: "1a0caf5e-b9e8-4fe2-90b8-6805636d33ef",
};

export function calculateLiftProgressions(
  slug: string,
  mesoNumber: number,
  setsByExercise: Record<string, LoggedSet[]>,
  currentMaxes: Record<string, number>
): LiftProgression[] {
  const isFemale = slug === "wendy" || slug === "hoplita_girl";

  if (isFemale) {
    const boxMax = currentMaxes["box_squat"] || 60;
    const milMax = currentMaxes["seated_military_press"] || 30;
    const rowMax = currentMaxes["landmine_row"] || 35;
    const htMax = currentMaxes["hip_thrust"] || currentMaxes["deadlift"] || 90;

    const liftConfigs = [
      { slug: "box_squat", name: "Box Squat / Sentadilla", muscleGroup: "Piernas / Glúteos", base1RM: boxMax },
      { slug: "seated_military_press", name: "Press Militar Sentada", muscleGroup: "Hombros", base1RM: milMax },
      { slug: "landmine_row", name: "Remo Landmine", muscleGroup: "Espalda", base1RM: rowMax },
      { slug: "hip_thrust", name: "Hip Thrust", muscleGroup: "Glúteos / Isquios", base1RM: htMax },
    ];

    return liftConfigs.map((cfg) => {
      let startKg = 0;
      let startReps = 15;
      let endKg = 0;
      let endReps = 10;
      let proposed1RM = cfg.base1RM;

      if (mesoNumber === 1) {
        startKg = Math.round(cfg.base1RM * 0.6);
        startReps = 15;
        endKg = Math.round(cfg.base1RM * 0.725);
        endReps = 12;
        proposed1RM = Math.max(cfg.base1RM + 5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
      } else if (mesoNumber === 2) {
        startKg = Math.round((cfg.base1RM * 0.725) / 2.5) * 2.5;
        startReps = 8;
        endKg = Math.round((cfg.base1RM * 0.825) / 2.5) * 2.5;
        endReps = 4;
        proposed1RM = Math.max(cfg.base1RM + 5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
      } else if (mesoNumber === 3) {
        startKg = Math.round((cfg.base1RM * 0.75) / 2.5) * 2.5;
        startReps = 6;
        endKg = Math.round((cfg.base1RM * 0.825) / 2.5) * 2.5;
        endReps = 6;
        proposed1RM = Math.max(cfg.base1RM + 2.5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
      } else if (mesoNumber === 4) {
        startKg = Math.round((cfg.base1RM * 0.80) / 2.5) * 2.5;
        startReps = 5;
        endKg = Math.round((cfg.base1RM * 0.875) / 2.5) * 2.5;
        endReps = 2;
        proposed1RM = Math.max(cfg.base1RM + 5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
      } else {
        // M5: Macrociclo completo / Pico Real
        startKg = Math.round((cfg.base1RM * 0.875) / 2.5) * 2.5;
        startReps = 8;
        endKg = Math.round((cfg.base1RM * 1.05) / 2.5) * 2.5;
        endReps = 1;
        proposed1RM = endKg;
      }

      const deltaKg = Math.round((endKg - startKg) * 10) / 10;
      const deltaPercent = startKg > 0 ? Math.round(((endKg - startKg) / startKg) * 1000) / 10 : 0;

      return {
        slug: cfg.slug,
        name: cfg.name,
        muscleGroup: cfg.muscleGroup,
        startWeightKg: startKg,
        startReps,
        endWeightKg: endKg,
        endReps,
        deltaKg,
        deltaPercent,
        previous1RM: cfg.base1RM,
        proposed1RM,
      };
    });
  }

  // Masculino: Juan / Hoplita
  const boxMax = currentMaxes["box_squat"] || 120;
  const benchMax = currentMaxes["bench_press"] || 100;
  const rowMax = currentMaxes["barbell_row"] || 85;
  const deadliftMax = currentMaxes["deadlift"] || 160;

  const maleConfigs = [
    { slug: "box_squat", name: "Box Squat / Sentadilla", muscleGroup: "Piernas / Glúteos", base1RM: boxMax },
    { slug: "bench_press", name: "Press de Banca Plano", muscleGroup: "Pectoral / Tríceps", base1RM: benchMax },
    { slug: "barbell_row", name: "Remo con Barra / Seal Row", muscleGroup: "Espalda", base1RM: rowMax },
    { slug: "deadlift", name: "Peso Muerto Convencional", muscleGroup: "Cadena Posterior", base1RM: deadliftMax },
  ];

  return maleConfigs.map((cfg) => {
    let startKg = 0;
    let startReps = 15;
    let endKg = 0;
    let endReps = 10;
    let proposed1RM = cfg.base1RM;

    if (mesoNumber === 1) {
      startKg = Math.round(cfg.base1RM * 0.6);
      startReps = 15;
      endKg = Math.round(cfg.base1RM * 0.735); // 88kg en squat
      endReps = 15;
      proposed1RM = Math.max(cfg.base1RM + 10, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
    } else if (mesoNumber === 2) {
      startKg = Math.round((cfg.base1RM * 0.725) / 2.5) * 2.5;
      startReps = 8;
      endKg = Math.round((cfg.base1RM * 0.85) / 2.5) * 2.5;
      endReps = 4;
      proposed1RM = Math.max(cfg.base1RM + 7.5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
    } else if (mesoNumber === 3) {
      startKg = Math.round((cfg.base1RM * 0.75) / 2.5) * 2.5;
      startReps = 6;
      endKg = Math.round((cfg.base1RM * 0.825) / 2.5) * 2.5;
      endReps = 6;
      proposed1RM = Math.max(cfg.base1RM + 5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
    } else if (mesoNumber === 4) {
      startKg = Math.round((cfg.base1RM * 0.80) / 2.5) * 2.5;
      startReps = 5;
      endKg = Math.round((cfg.base1RM * 0.875) / 2.5) * 2.5;
      endReps = 2;
      proposed1RM = Math.max(cfg.base1RM + 7.5, Math.round((endKg * (1 + endReps / 30)) / 2.5) * 2.5);
    } else {
      // M5: Test maximales / Macrociclo completo
      startKg = Math.round((cfg.base1RM * 0.875) / 2.5) * 2.5;
      startReps = 8;
      endKg = Math.round((cfg.base1RM * 1.05) / 2.5) * 2.5;
      endReps = 1;
      proposed1RM = endKg;
    }

    const deltaKg = Math.round((endKg - startKg) * 10) / 10;
    const deltaPercent = startKg > 0 ? Math.round(((endKg - startKg) / startKg) * 1000) / 10 : 0;

    return {
      slug: cfg.slug,
      name: cfg.name,
      muscleGroup: cfg.muscleGroup,
      startWeightKg: startKg,
      startReps,
      endWeightKg: endKg,
      endReps,
      deltaKg,
      deltaPercent,
      previous1RM: cfg.base1RM,
      proposed1RM,
    };
  });
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  activeMesocycle: null,
  activeWorkout: null,
  isLiveSession: false,
  currentExerciseIndex: 0,
  sessionStartTime: null,
  setsByExercise: {},
  showMesocycleCompletionModal: false,
  mesocycleCompletionData: null,
  userMaxes: {
    squat: 130,
    box_squat: 120,
    bench_press: 100,
    military_press: 65,
    seated_military_press: 60,
    deadlift: 160,
    barbell_row: 85,
    hip_thrust: 140,
    pull_ups: 90, // peso corporal + lastre
    close_grip_press: 85,
  },

  isResting: false,
  restTimeRemaining: 0,
  restTotalSeconds: 0,
  restTimerInterval: null,

  isClusterActive: false,
  clusterCurrentRep: 0,
  clusterTotalReps: 8,
  clusterIntervalSecs: 15,
  clusterSecsRemaining: 15,
  clusterIntervalTimer: null,

  closeMesocycleCompletionModal: () => {
    set({ showMesocycleCompletionModal: false });
  },

  activateNextMesocycle: async () => {
    const profile = useProfileStore.getState().activeProfile;
    const { mesocycleCompletionData } = get();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!mesocycleCompletionData) return;

    const currentNumber = mesocycleCompletionData.mesocycleNumber;
    const isMacrocyleComplete =
      mesocycleCompletionData.isMacrocyleComplete || currentNumber >= 5;
    const nextNumber = isMacrocyleComplete ? 1 : currentNumber + 1;
    const nextMeta = MESOCYCLE_METADATA[nextNumber];
    const nextTotalExposures = nextMeta?.totalExposures || (nextNumber === 1 ? 12 : 9);

    // 1. Recalibrar y persistir nuevos 1RM
    const newMaxes = { ...get().userMaxes };
    const recordsToUpsert: any[] = [];
    const nowStr = new Date().toISOString();
    const dateStr = nowStr.split("T")[0];

    mesocycleCompletionData.progressions.forEach((prog) => {
      newMaxes[prog.slug] = prog.proposed1RM;
      if (prog.slug === "box_squat") {
        newMaxes["squat"] = Math.round((prog.proposed1RM * 1.08) / 2.5) * 2.5;
      }

      const exId = EXERCISE_ID_BY_SLUG[prog.slug];
      if (exId && user?.id && profile.id && profile.id !== "1") {
        recordsToUpsert.push({
          profile_id: profile.id,
          exercise_id: exId,
          user_id: user.id,
          one_rm_kg: prog.proposed1RM,
          calculation_method: isMacrocyleComplete
            ? "macrocycle_peak_1rm"
            : `m${currentNumber}_graduation`,
          tested_at: dateStr,
          updated_at: nowStr,
        });
      }
    });

    if (recordsToUpsert.length > 0) {
      try {
        await supabase.from("user_maxes").upsert(recordsToUpsert, {
          onConflict: "profile_id,exercise_id",
        });
      } catch (e) {
        console.error("Error upserting new user_maxes:", e);
      }
    }

    set({ userMaxes: newMaxes });

    // 2. Persistir en user_mesocycles: mesociclo actual finalizado y siguiente mesociclo activo
    if (user?.id && profile.id && profile.id !== "1") {
      try {
        const updates: any[] = [
          {
            user_id: user.id,
            profile_id: profile.id,
            mesocycle_number: currentNumber,
            is_active: false,
            status: "completed",
            completed_at: nowStr,
            current_exposure: mesocycleCompletionData.totalExposures,
            total_exposures: mesocycleCompletionData.totalExposures,
            updated_at: nowStr,
          },
        ];

        if (!isMacrocyleComplete) {
          updates.push({
            user_id: user.id,
            profile_id: profile.id,
            mesocycle_number: nextNumber,
            is_active: true,
            status: "active",
            current_exposure: 1,
            total_exposures: nextTotalExposures,
            updated_at: nowStr,
          });
        }

        await supabase.from("user_mesocycles").upsert(updates, {
          onConflict: "profile_id,mesocycle_number",
        });
      } catch (e) {
        console.error("Error updating user_mesocycles for next mesocycle:", e);
      }
    }

    // 3. Actualizar stores de cliente
    if (!isMacrocyleComplete) {
      useMesocyclesStore.getState().setActiveMesoNumber(profile.slug, nextNumber);
      useMesocyclesStore.getState().setExposure(profile.slug, nextNumber, 1);
    }

    // 4. Feedback y cierre
    soundEngine.playRestFinished();
    set({
      showMesocycleCompletionModal: false,
      mesocycleCompletionData: null,
    });

    await useProfileStore.getState().refreshStats();
  },

  activateMesocycle2: async () => {
    return get().activateNextMesocycle();
  },

  startWorkout: (mesocycle: Mesocycle, workout: Workout) => {
    // Generar las series pre-pobladas para cada ejercicio con datos históricos
    const initialSets: Record<string, LoggedSet[]> = {};

    workout.exercises.forEach((item) => {
      // 3 series por defecto o según bloque
      const numSets = item.blockType === "main_progression" ? 3 : item.blockType === "tri_set" ? 3 : 3;
      const sets: LoggedSet[] = [];

      for (let i = 1; i <= numSets; i++) {
        let defaultWeight = 70;
        let defaultReps = 10;

        const max = get().userMaxes[item.exercise.slug] || 80;
        const currentExp = mesocycle.currentExposure || 1;

        if (mesocycle.number === 1) {
          // M1: Pirámide inversa: 15, 12, 10
          defaultReps = i === 1 ? 15 : i === 2 ? 12 : 10;
          defaultWeight = i === 1 ? Math.round(max * 0.6) : i === 2 ? Math.round(max * 0.65) : Math.round(max * 0.7);
        } else if (mesocycle.number === 2) {
          // M2: Preparación Fuerza - Series pesadas 8, 6, 4 (Microciclos 1 y 2) o Descarga Técnica 8x3 (Microciclo 3)
          const isDeloadMicrocycle = currentExp >= 7;

          if (isDeloadMicrocycle) {
            defaultReps = 8;
            defaultWeight = Math.round((max * 0.675) / 2.5) * 2.5;
          } else {
            defaultReps = i === 1 ? 8 : i === 2 ? 6 : 4;
            defaultWeight =
              i === 1
                ? Math.round((max * 0.725) / 2.5) * 2.5
                : i === 2
                ? Math.round((max * 0.775) / 2.5) * 2.5
                : Math.round((max * 0.825) / 2.5) * 2.5;
          }
        } else if (mesocycle.number === 3) {
          // M3: Especialización Técnica - 6, 6, 6 tensión continua o Descarga Técnica 2:1
          const isDeload = currentExp >= 7;
          defaultReps = 6;
          defaultWeight = isDeload
            ? Math.round((max * 0.70) / 2.5) * 2.5
            : Math.round((max * (0.75 + (i - 1) * 0.025)) / 2.5) * 2.5;
        } else if (mesocycle.number === 4) {
          // M4: Fuerza 1 - Pirámide pesada 5, 4, 3, 2 @ 80%-87.5%
          const repsArray = [5, 4, 3, 2];
          const pctArray = [0.80, 0.825, 0.85, 0.875];
          defaultReps = repsArray[i - 1] || 4;
          defaultWeight = Math.round((max * (pctArray[i - 1] || 0.825)) / 2.5) * 2.5;
        } else if (mesocycle.number === 5) {
          // M5: Cluster Sets 8 reps o Singles hacia test 1RM (3, 2, 1)
          if (currentExp >= 7) {
            defaultReps = i === 1 ? 3 : i === 2 ? 2 : 1;
            defaultWeight =
              i === 1
                ? Math.round((max * 0.90) / 2.5) * 2.5
                : i === 2
                ? Math.round((max * 0.95) / 2.5) * 2.5
                : Math.round(max / 2.5) * 2.5;
          } else {
            defaultWeight = Math.round((max * 0.875) / 2.5) * 2.5;
            defaultReps = 1;
          }
        }

        sets.push({
          id: `${item.id}-set-${i}`,
          workoutExerciseId: item.id,
          setNumber: i,
          targetReps: defaultReps,
          targetWeightKg: defaultWeight,
          actualReps: defaultReps,
          actualWeightKg: defaultWeight,
          // Histórico de sesión anterior para referencia visual
          historicalReps: defaultReps,
          historicalWeightKg: defaultWeight > 10 ? defaultWeight - 2.5 : defaultWeight,
          rpe: 8,
          isCompleted: false,
        });
      }

      initialSets[item.id] = sets;
    });

    set({
      activeMesocycle: mesocycle,
      activeWorkout: workout,
      isLiveSession: true,
      currentExerciseIndex: 0,
      sessionStartTime: Date.now(),
      setsByExercise: initialSets,
      isResting: false,
      isClusterActive: false,
    });
  },

  finishWorkout: async (cooldownInfo?: { cooldownType: string; durationMinutes: number }) => {
    soundEngine.playRestFinished();
    get().stopRestTimer();
    get().stopClusterTimer();

    const { activeMesocycle, activeWorkout, sessionStartTime } = get();
    const profile = useProfileStore.getState().activeProfile;

    if (activeWorkout && activeMesocycle) {
      try {
        // Buscar el UUID del entrenamiento en Supabase
        const { data: dbWorkout } = await supabase
          .from("workouts")
          .select("id, mesocycles!inner(number, profile_id)")
          .eq("letter", activeWorkout.letter)
          .eq("mesocycles.number", activeMesocycle.number)
          .eq("mesocycles.profile_id", profile.id)
          .maybeSingle();

        const workoutUuid = dbWorkout?.id || "42a0fd16-5d1e-4fa9-b1fb-8b05bbe98378";
        const startedAt = sessionStartTime
          ? new Date(sessionStartTime).toISOString()
          : new Date().toISOString();
        const completedAt = new Date().toISOString();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("workout_sessions").insert({
          user_id: user?.id,
          profile_id: profile.id,
          workout_id: workoutUuid,
          exposure_number: activeMesocycle.currentExposure || 1,
          started_at: startedAt,
          completed_at: completedAt,
          completed: true,
          session_rpe: 8.0,
          notes: cooldownInfo
            ? `Enfriamiento: ${cooldownInfo.cooldownType} (${cooldownInfo.durationMinutes} min)`
            : "Entrenamiento finalizado",
        });

        const currentExp = activeMesocycle.currentExposure || 1;
        const totalExp = activeMesocycle.totalExposures || 9;
        const isLastExposure = currentExp >= totalExp;

        if (isLastExposure) {
          // Persistir en user_mesocycles el mesociclo actual como completed
          if (user?.id && profile.id && profile.id !== "1") {
            try {
              await supabase.from("user_mesocycles").upsert(
                {
                  user_id: user.id,
                  profile_id: profile.id,
                  mesocycle_number: activeMesocycle.number,
                  is_active: false,
                  status: "completed",
                  completed_at: completedAt,
                  current_exposure: totalExp,
                  total_exposures: totalExp,
                  updated_at: completedAt,
                },
                { onConflict: "profile_id,mesocycle_number" }
              );
            } catch (e) {
              console.error("Error upserting completed mesocycle:", e);
            }
          }

          const progressions = calculateLiftProgressions(
            profile.slug,
            activeMesocycle.number,
            get().setsByExercise,
            get().userMaxes
          );

          const isMacrocyleComplete = activeMesocycle.number >= 5;
          const nextNumber = isMacrocyleComplete ? 1 : activeMesocycle.number + 1;
          const nextMeta = MESOCYCLE_METADATA[nextNumber];

          set({
            isLiveSession: false,
            activeWorkout: null,
            activeMesocycle: null,
            isResting: false,
            isClusterActive: false,
            setsByExercise: {},
            showMesocycleCompletionModal: true,
            mesocycleCompletionData: {
              mesocycleNumber: activeMesocycle.number,
              mesocycleName: activeMesocycle.name,
              totalExposures: totalExp,
              completedAt,
              progressions,
              nextMesocycleNumber: nextNumber,
              nextMesocycleName: nextMeta?.name || `Mesociclo ${nextNumber}`,
              nextMesocycleTotalExposures: nextMeta?.totalExposures || 9,
              isMacrocyleComplete,
            },
          });

          await useProfileStore.getState().refreshStats();
          return;
        }

        // Si no es la última exposición:
        useMesocyclesStore
          .getState()
          .advanceExposure(
            profile.slug,
            activeMesocycle.number,
            activeMesocycle.totalExposures
          );

        if (user?.id && profile.id && profile.id !== "1") {
          try {
            await supabase.from("user_mesocycles").upsert(
              {
                user_id: user.id,
                profile_id: profile.id,
                mesocycle_number: activeMesocycle.number,
                is_active: true,
                status: "active",
                current_exposure: Math.min(totalExp, currentExp + 1),
                total_exposures: totalExp,
                updated_at: completedAt,
              },
              { onConflict: "profile_id,mesocycle_number" }
            );
          } catch (e) {
            console.error("Error updating user_mesocycles progress:", e);
          }
        }

        // Refrescar estadísticas reales en Supabase
        await useProfileStore.getState().refreshStats();
      } catch (err) {
        console.error("Error al persistir sesión en Supabase:", err);
      }
    }

    set({
      isLiveSession: false,
      activeWorkout: null,
      activeMesocycle: null,
      isResting: false,
      isClusterActive: false,
      setsByExercise: {},
    });
  },

  cancelWorkout: () => {
    get().stopRestTimer();
    get().stopClusterTimer();
    set({
      isLiveSession: false,
      activeWorkout: null,
      activeMesocycle: null,
      isResting: false,
      isClusterActive: false,
      setsByExercise: {},
    });
  },

  setCurrentExerciseIndex: (index: number) => {
    set({ currentExerciseIndex: index });
  },

  adjustWeight: (exerciseId: string, setIndex: number, deltaKg: number) => {
    soundEngine.playTap();
    set((state) => {
      const exerciseSets = [...(state.setsByExercise[exerciseId] || [])];
      if (!exerciseSets[setIndex]) return state;

      const current = exerciseSets[setIndex].actualWeightKg;
      const nextWeight = Math.max(0, Math.round((current + deltaKg) * 100) / 100);

      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        actualWeightKg: nextWeight,
      };

      return {
        setsByExercise: {
          ...state.setsByExercise,
          [exerciseId]: exerciseSets,
        },
      };
    });
  },

  adjustReps: (exerciseId: string, setIndex: number, deltaReps: number) => {
    soundEngine.playTap();
    set((state) => {
      const exerciseSets = [...(state.setsByExercise[exerciseId] || [])];
      if (!exerciseSets[setIndex]) return state;

      const current = exerciseSets[setIndex].actualReps;
      const nextReps = Math.max(0, current + deltaReps);

      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        actualReps: nextReps,
      };

      return {
        setsByExercise: {
          ...state.setsByExercise,
          [exerciseId]: exerciseSets,
        },
      };
    });
  },

  toggleSetCompleted: (exerciseId: string, setIndex: number, restSeconds: number, isCluster = false, clusterInterval = 15) => {
    const currentState = get();
    const exerciseSets = [...(currentState.setsByExercise[exerciseId] || [])];
    if (!exerciseSets[setIndex]) return;

    const willBeCompleted = !exerciseSets[setIndex].isCompleted;
    exerciseSets[setIndex] = {
      ...exerciseSets[setIndex],
      isCompleted: willBeCompleted,
    };

    set({
      setsByExercise: {
        ...currentState.setsByExercise,
        [exerciseId]: exerciseSets,
      },
    });

    if (willBeCompleted) {
      if (isCluster) {
        // Iniciar temporizador Cluster Set intra-serie (15", 20", 25")
        currentState.startClusterTimer(clusterInterval);
      } else {
        // Iniciar descanso normal
        currentState.startRestTimer(restSeconds || 90);
      }
    } else {
      currentState.stopRestTimer();
      currentState.stopClusterTimer();
    }
  },

  startRestTimer: (seconds: number) => {
    get().stopRestTimer();
    soundEngine.playTap();

    set({
      isResting: true,
      restTotalSeconds: seconds,
      restTimeRemaining: seconds,
    });

    const interval = setInterval(() => {
      const remaining = get().restTimeRemaining - 1;
      if (remaining <= 0) {
        get().stopRestTimer();
        soundEngine.playRestFinished();
      } else {
        set({ restTimeRemaining: remaining });
      }
    }, 1000);

    set({ restTimerInterval: interval });
  },

  stopRestTimer: () => {
    const currentInterval = get().restTimerInterval;
    if (currentInterval) clearInterval(currentInterval);
    set({
      isResting: false,
      restTimeRemaining: 0,
      restTimerInterval: null,
    });
  },

  skipRestTimer: () => {
    get().stopRestTimer();
  },

  startClusterTimer: (intervalSecs: number) => {
    get().stopClusterTimer();
    soundEngine.playClusterRepBeep();

    set({
      isClusterActive: true,
      clusterCurrentRep: 1,
      clusterTotalReps: 8,
      clusterIntervalSecs: intervalSecs,
      clusterSecsRemaining: intervalSecs,
    });

    const interval = setInterval(() => {
      const remaining = get().clusterSecsRemaining - 1;
      if (remaining <= 0) {
        // Pita y avanza repetición en cluster
        soundEngine.playClusterRepBeep();
        const currentRep = get().clusterCurrentRep + 1;

        if (currentRep > get().clusterTotalReps) {
          // Terminado el cluster de 8 repeticiones!
          get().stopClusterTimer();
          soundEngine.playRestFinished();
          // Iniciar descanso entre series Cluster (4 minutos = 240s)
          get().startRestTimer(240);
        } else {
          set({
            clusterCurrentRep: currentRep,
            clusterSecsRemaining: intervalSecs,
          });
        }
      } else {
        set({ clusterSecsRemaining: remaining });
      }
    }, 1000);

    set({ clusterIntervalTimer: interval });
  },

  stopClusterTimer: () => {
    const currentInterval = get().clusterIntervalTimer;
    if (currentInterval) clearInterval(currentInterval);
    set({
      isClusterActive: false,
      clusterCurrentRep: 0,
      clusterSecsRemaining: 0,
      clusterIntervalTimer: null,
    });
  },

  nextClusterRepManual: () => {
    soundEngine.playClusterRepBeep();
    const nextRep = get().clusterCurrentRep + 1;
    if (nextRep > get().clusterTotalReps) {
      get().stopClusterTimer();
      soundEngine.playRestFinished();
      get().startRestTimer(240);
    } else {
      set({
        clusterCurrentRep: nextRep,
        clusterSecsRemaining: get().clusterIntervalSecs,
      });
    }
  },

  update1RM: (exerciseSlug: string, new1RM: number) => {
    set((state) => ({
      userMaxes: {
        ...state.userMaxes,
        [exerciseSlug]: new1RM,
      },
    }));
  },

  setUserMaxes: (newMaxes: Record<string, number>) => {
    set((state) => ({
      userMaxes: {
        ...state.userMaxes,
        ...newMaxes,
      },
    }));
  },

  loadUserMaxes: async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_maxes")
        .select("one_rm_kg, exercises(slug)")
        .eq("profile_id", profileId);

      if (error) {
        console.warn("Could not load user_maxes from Supabase:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const loaded: Record<string, number> = { ...get().userMaxes };
        data.forEach((row: any) => {
          const slug = row.exercises?.slug;
          const val = Number(row.one_rm_kg);
          if (slug && !isNaN(val) && val > 0) {
            loaded[slug] = val;
          }
        });
        set({ userMaxes: loaded });
      }
    } catch (err) {
      console.warn("Error loading user maxes:", err);
    }
  },
}));
