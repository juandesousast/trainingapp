export interface ExerciseTechnicalGuide {
  id: string;
  name: string;
  category?: string;
  level?: string;
  mechanic?: string;
  force?: string;
  equipment?: string;
  overview?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  exerciseTips?: string[];
  commonMistakes?: string[];
  safetyInfo?: string;
  variations?: string[];
  images?: string[];
  videos?: Array<{
    url: string;
    format: string;
    resolution?: string;
    durationSeconds?: number;
  }>;
}

interface CacheItem {
  data: ExerciseTechnicalGuide;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Horas
const CACHE_PREFIX = "hoplita_tech_guide_v1_";

export interface ExerciseApiMapEntry {
  term: string;
  exactId?: string;
}

export const EXERCISE_API_MAPPING: Record<string, ExerciseApiMapEntry> = {
  "BOX SQUAT": { term: "box squat", exactId: "Box_Squat" },
  "SQUAT": { term: "barbell squat", exactId: "Barbell_Squat" },
  "PRESS BANCA": { term: "barbell bench press", exactId: "Barbell_Bench_Press_-_Medium_Grip" },
  "PRESS MILITAR": { term: "overhead press", exactId: "Standing_Military_Press" },
  "PRESS MILITAR SENTADA": { term: "seated overhead press", exactId: "Seated_Barbell_Military_Press" },
  "PESO MUERTO": { term: "barbell deadlift", exactId: "Barbell_Deadlift" },
  "HIP THRUST": { term: "hip thrust", exactId: "Barbell_Hip_Thrust" },
  "DOMINADAS": { term: "pull up", exactId: "Pull-Up" },
  "DOMINADAS SUPINAS": { term: "chin-up", exactId: "Chin-Up" },
  "REMO o SEAL ROW": { term: "barbell row", exactId: "Bent_Over_Two-Arm_Long_Bar_Row" },
  "REMO LANDMINE o SEAL ROW": { term: "landmine row", exactId: "Bent_Over_Two-Arm_Long_Bar_Row" },
  "PRESS ESTRECHO": { term: "close grip bench press", exactId: "Close-Grip_Barbell_Bench_Press" },
  "CURL con BARRA": { term: "barbell curl", exactId: "Barbell_Curl" },
  "DEAD CURL": { term: "barbell curl", exactId: "Barbell_Curl" },
  "FONDOS TRICEPS": { term: "chest dips", exactId: "Dips_-_Chest_Version" },
  "PRESS FRANCES": { term: "skullcrusher", exactId: "Lying_Triceps_Press" },
  "PRENSA 45º": { term: "leg press", exactId: "Leg_Press" },
  "LEG EXTENSION": { term: "leg extension", exactId: "Leg_Extensions" },
  "LEG CURL": { term: "leg curl", exactId: "Lying_Leg_Curls" },
  "HIPEREXTENSION": { term: "hyperextension", exactId: "Hyperextensions_Back_Extensions" },
  "CALF MACHINE": { term: "standing calf raise", exactId: "Standing_Calf_Raises" },
  "CALF en PRENSA": { term: "calf press", exactId: "Calf_Press_On_The_Leg_Press_Machine" },
  "CRUNCH INVERSO": { term: "reverse crunch", exactId: "Reverse_Crunch" },
  "ELEVACIONES LATERALES": { term: "lateral raise", exactId: "Side_Lateral_Raise" },
  "PRESS con MANCUERNAS": { term: "dumbbell shoulder press", exactId: "Dumbbell_Shoulder_Press" },
  "GLUTE HAM RAISE": { term: "hyperextension", exactId: "Hyperextensions_Back_Extensions" }
};

function normalizeKey(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * Mapea el nombre del ejercicio o slug a los términos de búsqueda de ExerciseAPI.dev
 */
export function getSearchTermForExercise(
  name: string,
  slug?: string
): ExerciseApiMapEntry {
  const normName = normalizeKey(name || "");

  // 1. Coincidencia directa
  if (EXERCISE_API_MAPPING[normName]) {
    return EXERCISE_API_MAPPING[normName];
  }

  // 2. Coincidencias semánticas
  if (normName.includes("BOX SQUAT")) return EXERCISE_API_MAPPING["BOX SQUAT"];
  if (normName.includes("HIP THRUST")) return EXERCISE_API_MAPPING["HIP THRUST"];
  if (normName.includes("SQUAT") || normName.includes("SENTADILLA")) return EXERCISE_API_MAPPING["SQUAT"];
  if (normName.includes("BANCA AGARRE ESTRECHO") || normName.includes("PRESS ESTRECHO")) return EXERCISE_API_MAPPING["PRESS ESTRECHO"];
  if (normName.includes("BANCA") || normName.includes("BENCH")) return EXERCISE_API_MAPPING["PRESS BANCA"];
  if (normName.includes("MILITAR SENTAD")) return EXERCISE_API_MAPPING["PRESS MILITAR SENTADA"];
  if (normName.includes("MILITAR")) return EXERCISE_API_MAPPING["PRESS MILITAR"];
  if (normName.includes("PESO MUERTO") || normName.includes("DEADLIFT")) return EXERCISE_API_MAPPING["PESO MUERTO"];
  if (normName.includes("CHIN") || normName.includes("SUPINA")) return EXERCISE_API_MAPPING["DOMINADAS SUPINAS"];
  if (normName.includes("DOMINADA") || normName.includes("PULL UP") || normName.includes("JALON")) return EXERCISE_API_MAPPING["DOMINADAS"];
  if (normName.includes("LANDMINE")) return EXERCISE_API_MAPPING["REMO LANDMINE o SEAL ROW"];
  if (normName.includes("REMO") || normName.includes("SEAL ROW")) return EXERCISE_API_MAPPING["REMO o SEAL ROW"];
  if (normName.includes("DEAD CURL")) return EXERCISE_API_MAPPING["DEAD CURL"];
  if (normName.includes("CURL")) return EXERCISE_API_MAPPING["CURL con BARRA"];
  if (normName.includes("FONDOS") || normName.includes("PARALELAS") || normName.includes("DIP")) return EXERCISE_API_MAPPING["FONDOS TRICEPS"];
  if (normName.includes("FRANCES") || normName.includes("SKULLCRUSHER")) return EXERCISE_API_MAPPING["PRESS FRANCES"];
  if (normName.includes("PRENSA")) return EXERCISE_API_MAPPING["PRENSA 45º"];
  if (normName.includes("EXTENSION")) return EXERCISE_API_MAPPING["LEG EXTENSION"];
  if (normName.includes("LEG CURL") || normName.includes("FEMORAL")) return EXERCISE_API_MAPPING["LEG CURL"];
  if (normName.includes("HIPEREXTENSION") || normName.includes("LUMBAR")) return EXERCISE_API_MAPPING["HIPEREXTENSION"];
  if (normName.includes("CALF EN PRENSA")) return EXERCISE_API_MAPPING["CALF en PRENSA"];
  if (normName.includes("CALF") || normName.includes("GEMELO") || normName.includes("SOLEO")) return EXERCISE_API_MAPPING["CALF MACHINE"];
  if (normName.includes("CRUNCH")) return EXERCISE_API_MAPPING["CRUNCH INVERSO"];
  if (normName.includes("LATERAL")) return EXERCISE_API_MAPPING["ELEVACIONES LATERALES"];
  if (normName.includes("MANCUERNA")) return EXERCISE_API_MAPPING["PRESS con MANCUERNAS"];

  // 3. Fallback al slug o nombre en minúsculas
  const fallbackTerm = (slug ? slug.replace(/_/g, " ") : name.toLowerCase()).trim();
  return { term: fallbackTerm };
}

/**
 * Recupera la guía biomecánica con política de caché de 24h
 */
export async function fetchExerciseGuide(
  exerciseName: string,
  exerciseSlug?: string
): Promise<ExerciseTechnicalGuide | null> {
  const mapping = getSearchTermForExercise(exerciseName, exerciseSlug);
  const cacheKey = `${CACHE_PREFIX}${mapping.exactId || mapping.term.replace(/\s+/g, "_")}`;

  // 1. Revisar caché de localStorage (TTL 24 horas)
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: CacheItem = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_TTL_MS && parsed.data) {
          return parsed.data;
        }
      }
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }

  // 2. Consulta a los route handlers proxy de Next.js
  let guide: ExerciseTechnicalGuide | null = null;

  try {
    // Si tenemos exactId, pedir directamente por ID
    if (mapping.exactId) {
      const res = await fetch(`/api/exercises/${encodeURIComponent(mapping.exactId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) guide = json.data;
      }
    }

    // Si falló o no había exactId, buscar por query
    if (!guide && mapping.term) {
      const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(mapping.term)}`);
      if (res.ok) {
        const json = await res.json();
        const firstMatch = json.data && json.data[0];
        if (firstMatch) {
          // Si el resultado de search ya trae instrucciones o campos completos
          if (firstMatch.instructions && firstMatch.overview) {
            guide = firstMatch;
          } else if (firstMatch.id) {
            // Traer detalle completo
            const detailRes = await fetch(`/api/exercises/${encodeURIComponent(firstMatch.id)}`);
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.data) guide = detailJson.data;
            }
          }
        }
      }
    }

    // 3. Guardar en caché si se obtuvo con éxito
    if (guide && typeof window !== "undefined") {
      try {
        const item: CacheItem = {
          data: guide,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(item));
      } catch (e) {
        // En caso de cuota excedida de localStorage, ignorar silenciosamente
      }
    }

    return guide;
  } catch (err) {
    console.warn(`[fetchExerciseGuide] Error obteniendo guía para ${exerciseName}:`, err);
    return null;
  }
}
