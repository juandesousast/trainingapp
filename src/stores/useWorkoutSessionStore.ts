import { create } from "zustand";
import { Workout, Mesocycle, LoggedSet } from "@/lib/types";
import { soundEngine } from "@/lib/audio";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/stores/useProfileStore";

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
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  activeMesocycle: null,
  activeWorkout: null,
  isLiveSession: false,
  currentExerciseIndex: 0,
  sessionStartTime: null,
  setsByExercise: {},
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

  startWorkout: (mesocycle: Mesocycle, workout: Workout) => {
    // Generar las series pre-pobladas para cada ejercicio con datos históricos
    const initialSets: Record<string, LoggedSet[]> = {};

    workout.exercises.forEach((item) => {
      // 3 series por defecto o según bloque
      const numSets = item.blockType === "main_progression" ? 3 : item.blockType === "tri_set" ? 3 : 3;
      const sets: LoggedSet[] = [];

      for (let i = 1; i <= numSets; i++) {
        // Cálculo si tiene % de 1RM (ej. 75% o 80%)
        let defaultWeight = 70;
        let defaultReps = 10;

        const max = get().userMaxes[item.exercise.slug] || 80;

        if (mesocycle.number === 1) {
          // Pirámide inversa: 15, 12, 10
          defaultReps = i === 1 ? 15 : i === 2 ? 12 : 10;
          defaultWeight = i === 1 ? Math.round(max * 0.6) : i === 2 ? Math.round(max * 0.65) : Math.round(max * 0.7);
        } else if (mesocycle.number === 3) {
          // 75% de 1RM
          defaultWeight = Math.round(max * 0.75);
          defaultReps = 3;
        } else if (mesocycle.number === 4) {
          // 80% de 1RM en 4x4
          defaultWeight = Math.round(max * 0.80);
          defaultReps = 4;
        } else if (mesocycle.number === 5) {
          // 87.5% de 1RM Cluster
          defaultWeight = Math.round(max * 0.875);
          defaultReps = 1;
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
          session_rpe: 8.0,
          notes: cooldownInfo
            ? `Enfriamiento: ${cooldownInfo.cooldownType} (${cooldownInfo.durationMinutes} min)`
            : "Entrenamiento finalizado",
        });

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
}));
