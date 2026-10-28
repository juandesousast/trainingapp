export type ProfileSlug = "hoplita" | "hoplita_girl";

export interface Profile {
  id: string;
  slug: ProfileSlug;
  displayName: string;
  gender: "male" | "female";
  themeAccent: string; // '#CCFF00' o '#F43F5E'
  targetBodyFatPct: number;
  streakDays: number;
  weeklyCompleted: number;
  weeklyTarget: number;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  videoPath?: string;
  thumbnailPath?: string;
  defaultTempo?: string;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exercise: Exercise;
  orderIndex: number;
  blockType: "main_progression" | "jump_set" | "tri_set" | "cluster_set" | "accessory";
  groupTag?: string; // e.g. "JS1", "TRI1"
  technicalNotes?: string;
  tempo?: string;
  restSeconds: number;
  schemeConfig: Record<string, any>;
}

export interface Workout {
  id: string;
  mesocycleId: string;
  letter: "A" | "B" | "C";
  name: string;
  orderIndex: number;
  exercises: WorkoutExercise[];
}

export interface Mesocycle {
  id: string;
  profileId: string;
  number: number;
  name: string;
  code: string;
  splitStructure: string;
  targetGoal: string;
  totalExposures: number;
  currentExposure: number;
  isUnlocked: boolean;
  isActive: boolean;
  workouts: Workout[];
}

export interface LoggedSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  actualReps: number;
  actualWeightKg: number;
  historicalReps?: number;
  historicalWeightKg?: number;
  rpe?: number;
  isCompleted: boolean;
}

export interface MRCoeff {
  reps: number;
  percentage: number;
  coeffMayhew: number;
  coeffBrzycki: number;
}
