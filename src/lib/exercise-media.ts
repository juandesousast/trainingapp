export interface ExerciseVisual {
  name: string;
  slug: string;
  target: string;
  mediaUrl: string;
  secondaryMediaUrl?: string;
  videoUrl?: string;
}

export const EXERCISE_MEDIA: Record<string, ExerciseVisual> = {
  "BOX SQUAT": {
    name: "Box Squat",
    slug: "barbell-box-squat",
    target: "Cuádriceps / Glúteos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Box_Squat.mp4"
  },
  "SQUAT": {
    name: "Barbell Squat",
    slug: "barbell-full-squat",
    target: "Cuádriceps / Glúteos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg"
  },
  "PRESS BANCA": {
    name: "Bench Press",
    slug: "barbell-bench-press",
    target: "Pecho / Tríceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg"
  },
  "PRESS MILITAR": {
    name: "Overhead Press",
    slug: "barbell-standing-overhead-press",
    target: "Hombros",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Standing_Military_Press.mp4"
  },
  "PRESS MILITAR SENTADA": {
    name: "Seated Overhead Press",
    slug: "barbell-seated-overhead-press",
    target: "Hombros",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/1.jpg"
  },
  "PESO MUERTO": {
    name: "Deadlift",
    slug: "barbell-deadlift",
    target: "Cadena Posterior / Espalda",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Barbell_Deadlift.mp4"
  },
  "HIP THRUST": {
    name: "Hip Thrust",
    slug: "barbell-hip-thrust",
    target: "Glúteos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Barbell_Glute_Bridge.mp4"
  },
  "DOMINADAS": {
    name: "Pull Up",
    slug: "pull-up",
    target: "Dorsales",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Pull-Up.mp4"
  },
  "DOMINADAS SUPINAS": {
    name: "Chin Up",
    slug: "chin-up",
    target: "Dorsales / Bíceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/1.jpg"
  },
  "REMO o SEAL ROW": {
    name: "Seal Row",
    slug: "barbell-seal-row",
    target: "Espalda Media",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/1.jpg"
  },
  "REMO LANDMINE o SEAL ROW": {
    name: "Landmine Row",
    slug: "landmine-row",
    target: "Espalda Media",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/1.jpg"
  },
  "LAT MACHINE": {
    name: "Cable Pulldown",
    slug: "cable-pulldown",
    target: "Dorsales",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
  },
  "CURL con BARRA": {
    name: "Barbell Curl",
    slug: "barbell-curl",
    target: "Bíceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Barbell_Curl.mp4"
  },
  "DEAD CURL": {
    name: "Dead Curl",
    slug: "dead-curl",
    target: "Bíceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Barbell_Curl.mp4"
  },
  "FONDOS TRICEPS": {
    name: "Chest Dips",
    slug: "chest-dips",
    target: "Tríceps / Pecho",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/1.jpg"
  },
  "PRESS ESTRECHO": {
    name: "Close Grip Bench Press",
    slug: "close-grip-bench-press",
    target: "Tríceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/1.jpg"
  },
  "PRESS FRANCES": {
    name: "Skullcrusher",
    slug: "skullcrusher",
    target: "Tríceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/1.jpg"
  },
  "PRENSA 45º": {
    name: "Leg Press",
    slug: "leg-press-45",
    target: "Cuádriceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Leg_Press.mp4"
  },
  "LEG EXTENSION": {
    name: "Leg Extension",
    slug: "leg-extension",
    target: "Cuádriceps",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Leg_Extensions.mp4"
  },
  "LEG CURL": {
    name: "Leg Curl",
    slug: "leg-curl",
    target: "Isquiosurales",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Lying_Leg_Curls.mp4"
  },
  "HIPEREXTENSION": {
    name: "Hyperextension",
    slug: "hyperextension",
    target: "Lumbares / Glúteos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/1.jpg"
  },
  "CALF MACHINE": {
    name: "Standing Calf Raise",
    slug: "standing-calf-raise",
    target: "Gemelos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
  },
  "CALF en PRENSA": {
    name: "Calf Press",
    slug: "calf-press",
    target: "Gemelos",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/1.jpg"
  },
  "CRUNCH INVERSO": {
    name: "Reverse Crunch",
    slug: "reverse-crunch",
    target: "Abdominales",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Reverse_Crunch.mp4"
  },
  "CRUNCH INVERTIDO": {
    name: "Reverse Crunch",
    slug: "reverse-crunch",
    target: "Abdominales",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Reverse_Crunch.mp4"
  },
  "ELEVACIONES LATERALES": {
    name: "Lateral Raise",
    slug: "dumbbell-lateral-raise",
    target: "Deltoides Lateral",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Side_Lateral_Raise.mp4"
  },
  "PRESS con MANCUERNAS": {
    name: "Dumbbell Shoulder Press",
    slug: "dumbbell-shoulder-press",
    target: "Hombros",
    mediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
    secondaryMediaUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg",
    videoUrl: "https://cdn.exerciseapi.dev/v1/Dumbbell_Shoulder_Press.mp4"
  }
};

/**
 * Normaliza una cadena quitando tildes, signos y convirtiendo a mayúsculas
 */
function normalizeKey(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * Busca de forma tolerante el asset visual de un ejercicio
 */
export function getExerciseVisual(
  name: string,
  slug?: string
): ExerciseVisual | null {
  if (!name && !slug) return null;

  // 1. Coincidencia directa por clave
  const normName = normalizeKey(name || "");
  if (EXERCISE_MEDIA[normName]) {
    return EXERCISE_MEDIA[normName];
  }

  // 2. Mapeo por slug directo o normalizado
  if (slug) {
    const normSlug = slug.toLowerCase().replace(/_/g, "-");
    for (const visual of Object.values(EXERCISE_MEDIA)) {
      if (
        visual.slug.toLowerCase() === normSlug ||
        visual.slug.toLowerCase().replace(/-/g, "_") === slug.toLowerCase()
      ) {
        return visual;
      }
    }
  }

  // 3. Reglas semánticas para los 26 ejercicios del sistema Hoplita
  if (normName.includes("BOX SQUAT")) return EXERCISE_MEDIA["BOX SQUAT"];
  if (normName.includes("HIP THRUST")) return EXERCISE_MEDIA["HIP THRUST"];
  if (normName.includes("SQUAT") || normName.includes("SENTADILLA")) return EXERCISE_MEDIA["SQUAT"];
  if (normName.includes("BANCA AGARRE ESTRECHO") || normName.includes("PRESS ESTRECHO")) return EXERCISE_MEDIA["PRESS ESTRECHO"];
  if (normName.includes("BANCA") || normName.includes("BENCH")) return EXERCISE_MEDIA["PRESS BANCA"];
  if (normName.includes("MILITAR SENTAD")) return EXERCISE_MEDIA["PRESS MILITAR SENTADA"];
  if (normName.includes("MILITAR")) return EXERCISE_MEDIA["PRESS MILITAR"];
  if (normName.includes("PESO MUERTO") || normName.includes("DEADLIFT")) return EXERCISE_MEDIA["PESO MUERTO"];
  if (normName.includes("CHIN") || normName.includes("SUPINA")) return EXERCISE_MEDIA["DOMINADAS SUPINAS"];
  if (normName.includes("DOMINADA") || normName.includes("PULL UP") || normName.includes("JALON")) return EXERCISE_MEDIA["DOMINADAS"];
  if (normName.includes("LANDMINE")) return EXERCISE_MEDIA["REMO LANDMINE o SEAL ROW"];
  if (normName.includes("REMO") || normName.includes("SEAL ROW")) return EXERCISE_MEDIA["REMO o SEAL ROW"];
  if (normName.includes("LAT") || normName.includes("PULLDOWN")) return EXERCISE_MEDIA["LAT MACHINE"];
  if (normName.includes("DEAD CURL")) return EXERCISE_MEDIA["DEAD CURL"];
  if (normName.includes("CURL")) return EXERCISE_MEDIA["CURL con BARRA"];
  if (normName.includes("FONDOS") || normName.includes("PARALELAS") || normName.includes("DIP")) return EXERCISE_MEDIA["FONDOS TRICEPS"];
  if (normName.includes("FRANCES") || normName.includes("SKULLCRUSHER")) return EXERCISE_MEDIA["PRESS FRANCES"];
  if (normName.includes("PRENSA")) return EXERCISE_MEDIA["PRENSA 45º"];
  if (normName.includes("EXTENSION")) return EXERCISE_MEDIA["LEG EXTENSION"];
  if (normName.includes("LEG CURL") || normName.includes("FEMORAL")) return EXERCISE_MEDIA["LEG CURL"];
  if (normName.includes("HIPEREXTENSION") || normName.includes("LUMBAR")) return EXERCISE_MEDIA["HIPEREXTENSION"];
  if (normName.includes("CALF EN PRENSA")) return EXERCISE_MEDIA["CALF en PRENSA"];
  if (normName.includes("CALF") || normName.includes("GEMELO") || normName.includes("SOLEO")) return EXERCISE_MEDIA["CALF MACHINE"];
  if (normName.includes("CRUNCH")) return EXERCISE_MEDIA["CRUNCH INVERSO"];
  if (normName.includes("LATERAL")) return EXERCISE_MEDIA["ELEVACIONES LATERALES"];
  if (normName.includes("MANCUERNA")) return EXERCISE_MEDIA["PRESS con MANCUERNAS"];
  if (normName.includes("GLUTE HAM")) return EXERCISE_MEDIA["HIPEREXTENSION"];

  return null;
}
