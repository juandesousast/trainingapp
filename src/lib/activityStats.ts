import { supabase } from "@/lib/supabase";

/**
 * Convierte un objeto Date a string YYYY-MM-DD en la zona horaria local.
 */
export function toLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el rango de la semana actual (desde Lunes 00:00:00 hasta Domingo 23:59:59.999).
 */
export function getStartAndEndOfWeek(): { startOfWeek: Date; endOfWeek: Date } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  // Si es domingo (0), la distancia al lunes previo es -6 días; si no, 1 - currentDay
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

/**
 * Calcula los días consecutivos con actividad real (entrenamientos o check-in diario).
 * - Si no hay historial previo: 0
 * - Si se completó una acción hoy: 1 (o más si viene encadenada de días previos)
 * - Si hoy aún no se ha entrenado pero ayer sí: la racha sigue viva (cuenta los días consecutivos hasta ayer)
 * - Si ni hoy ni ayer hubo actividad: 0
 */
export function calculateStreak(activeDatesSet: Set<string>): number {
  if (activeDatesSet.size === 0) return 0;

  const today = new Date();
  const todayStr = toLocalDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  let checkDate: Date;
  let streak = 0;

  if (activeDatesSet.has(todayStr)) {
    streak = 1;
    checkDate = yesterday;
  } else if (activeDatesSet.has(yesterdayStr)) {
    // La racha se mantiene vigente desde ayer
    streak = 1;
    checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Sin actividad hoy ni ayer -> racha 0
    return 0;
  }

  // Contar días consecutivos hacia atrás
  while (true) {
    const dateStr = toLocalDateString(checkDate);
    if (activeDatesSet.has(dateStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export interface ActivityStatsResult {
  streakDays: number;
  weeklyCompleted: number;
  weeklyTarget: number;
}

/**
 * Consulta Supabase para obtener la racha y el progreso semanal real del usuario autenticado.
 */
export async function fetchUserActivityStats(
  userId: string,
  weeklyTarget: number = 3
): Promise<ActivityStatsResult> {
  try {
    const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();
    const activeDates = new Set<string>();

    // 1. Consultar sesiones completadas en Supabase con filtro estricto por user_id
    const { data: workoutsData, error: workoutsError } = await supabase
      .from("workout_sessions")
      .select("id, completed_at, started_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    if (workoutsError) {
      console.warn("Aviso al consultar workout_sessions:", workoutsError.message);
    }

    let weeklyCompleted = 0;

    if (workoutsData && workoutsData.length > 0) {
      for (const w of workoutsData) {
        if (w.completed_at) {
          const compDate = new Date(w.completed_at);
          activeDates.add(toLocalDateString(compDate));

          // Verificar si cae dentro de la semana en curso (Lunes a Domingo)
          if (compDate >= startOfWeek && compDate <= endOfWeek) {
            weeklyCompleted += 1;
          }
        }
      }
    }

    // 2. Consultar registros del diario (daily_habits) con filtro estricto por user_id
    const { data: habitsData, error: habitsError } = await supabase
      .from("daily_habits")
      .select("id, log_date, created_at")
      .eq("user_id", userId);

    if (habitsError) {
      console.warn("Aviso al consultar daily_habits:", habitsError.message);
    }

    if (habitsData && habitsData.length > 0) {
      for (const h of habitsData) {
        if (h.log_date) {
          activeDates.add(h.log_date);
        } else if (h.created_at) {
          activeDates.add(toLocalDateString(new Date(h.created_at)));
        }
      }
    }

    const streakDays = calculateStreak(activeDates);

    return {
      streakDays,
      weeklyCompleted,
      weeklyTarget,
    };
  } catch (err) {
    console.error("Error al calcular estadísticas de actividad:", err);
    return {
      streakDays: 0,
      weeklyCompleted: 0,
      weeklyTarget,
    };
  }
}
