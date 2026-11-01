export type ProfileSlug = "vector" | "vector_girl" | "hoplita" | "hoplita_girl" | "juan" | "wendy" | "nato" | string;

export type BiologicalSex = "male" | "female";

export type NutritionGoal = "fat_loss" | "recomp" | "maintenance" | "hypertrophy";

export interface Profile {
  id: string;
  userId?: string;
  slug?: string;
  displayName: string;
  role?: "vector" | "vector_girl" | "hoplita" | "hoplita_girl" | string;
  sex: BiologicalSex;
  gender?: "male" | "female"; // compatibilidad hacia atrás
  themeAccent: string; // '#CCFF00' o '#F43F5E'
  targetBodyFatPct: number;
  targetWeightKg?: number;
  heightCm?: number | null;
  nutritionGoal?: NutritionGoal;
  streakDays: number;
  weeklyCompleted: number;
  weeklyTarget: number;
  avatarUrl?: string;
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
  weeklyTarget?: number;
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
