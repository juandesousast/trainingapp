import { create } from "zustand";
import { Profile, BiologicalSex, NutritionGoal } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";
import { supabase } from "@/lib/supabase";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useMesocyclesStore } from "@/stores/useMesocyclesStore";

interface ProfileState {
  authUserId: string | null;
  authUserEmail: string | null;
  activeProfile: Profile;
  profiles: Profile[];
  isLoadingStats: boolean;
  initAuthSession: () => Promise<void>;
  loadAllProfiles: () => Promise<Profile[]>;
  switchProfile: (profileId: string) => Promise<void>;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
  updateProfileGoals: (
    targetBodyFatPct: number,
    targetWeightKg?: number,
    heightCm?: number | null,
    nutritionGoal?: NutritionGoal,
    sex?: BiologicalSex
  ) => Promise<void>;
  updateProfileSex: (newSex: BiologicalSex) => Promise<void>;
  createProfile: (profileData: {
    displayName: string;
    sex: BiologicalSex;
    targetWeightKg?: number;
    targetBodyFatPct?: number;
    heightCm?: number;
  }) => Promise<Profile | null>;
  refreshStats: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultProfile: Profile = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "juan",
  displayName: "Juan",
  role: "hoplita",
  sex: "male",
  gender: "male",
  themeAccent: "#CCFF00",
  targetBodyFatPct: 16.0,
  targetWeightKg: 72.8,
  heightCm: 180,
  nutritionGoal: "fat_loss",
  streakDays: 0,
  weeklyCompleted: 0,
  weeklyTarget: 3,
};

function mapDbProfileToProfile(dbProfile: any): Profile {
  const isFemale =
    dbProfile.sex === "female" ||
    dbProfile.gender === "female" ||
    dbProfile.role === "hoplita_girl";
  const sex: BiologicalSex = isFemale ? "female" : "male";

  return {
    id: dbProfile.id,
    userId: dbProfile.user_id,
    slug: dbProfile.slug || `user-${dbProfile.id.slice(0, 8)}`,
    displayName: dbProfile.display_name || "Atleta",
    role: dbProfile.role || (isFemale ? "hoplita_girl" : "hoplita"),
    sex,
    gender: sex,
    themeAccent: dbProfile.theme_accent || (isFemale ? "#F43F5E" : "#CCFF00"),
    targetBodyFatPct: dbProfile.target_body_fat_pct
      ? Number(dbProfile.target_body_fat_pct)
      : isFemale
      ? 21.0
      : 16.0,
    targetWeightKg: dbProfile.target_weight_kg
      ? Number(dbProfile.target_weight_kg)
      : isFemale
      ? 60.0
      : 75.0,
    heightCm: dbProfile.height_cm ? Number(dbProfile.height_cm) : null,
    nutritionGoal: dbProfile.nutrition_goal || "fat_loss",
    streakDays: dbProfile.streak_days || 0,
    weeklyCompleted: dbProfile.weekly_completed || 0,
    weeklyTarget: dbProfile.weekly_target || 3,
    avatarUrl: dbProfile.avatar_url,
  };
}

async function ensureUserMesocyclesInitialized(profileId: string, userId?: string | null) {
  try {
    const { data: existing } = await supabase
      .from("user_mesocycles")
      .select("id")
      .eq("profile_id", profileId)
      .eq("mesocycle_number", 1)
      .maybeSingle();

    if (!existing) {
      await supabase.from("user_mesocycles").insert({
        profile_id: profileId,
        user_id: userId || null,
        mesocycle_number: 1,
        is_active: true,
        current_exposure: 1,
        total_exposures: 12,
        status: "active",
      });
    }
  } catch (err) {
    console.warn("Aviso al asegurar user_mesocycles:", err);
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  authUserId: null,
  authUserEmail: null,
  activeProfile: defaultProfile,
  profiles: [],
  isLoadingStats: false,

  loadAllProfiles: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (error) {
        console.warn("Aviso al consultar profiles en Supabase:", error.message);
        return [];
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapDbProfileToProfile);
        set({ profiles: mapped });
        return mapped;
      }
    } catch (err) {
      console.error("Error al cargar perfil de usuario autenticado:", err);
    }
    return [];
  },

  initAuthSession: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({
          authUserId: null,
          authUserEmail: null,
          activeProfile: defaultProfile,
          profiles: [],
        });
        return;
      }

      set({ authUserId: user.id, authUserEmail: user.email || null });

      // Consultar única y exclusivamente el registro de profiles donde id = user.id (o user_id = user.id)
      const { data: dbProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (error) {
        console.warn("Aviso al consultar profile autenticado:", error.message);
        return;
      }

      if (dbProfile) {
        const mapped = mapDbProfileToProfile(dbProfile);
        const isFemale = mapped.sex === "female";

        // Actualizar tema cinético en DOM
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute(
            "data-theme",
            isFemale ? "hoplita_girl" : "hoplita"
          );
        }

        set({ activeProfile: mapped, profiles: [mapped] });

        // 1. Asegurar mesociclo M1 en Supabase
        await ensureUserMesocyclesInitialized(mapped.id, user.id);

        // 2. Aislar y cargar 1RM individual del perfil
        await useWorkoutSessionStore.getState().loadUserMaxes(mapped.id);

        // 3. Aislar y cargar registros biométricos del perfil
        await useBiometricsStore.getState().fetchUserData(mapped.id);

        // 4. Cargar estadísticas de actividad
        try {
          const stats = await fetchUserActivityStats(user.id, mapped.weeklyTarget);
          set((state) => ({
            activeProfile: {
              ...state.activeProfile,
              streakDays: stats.streakDays,
              weeklyCompleted: stats.weeklyCompleted,
              weeklyTarget: stats.weeklyTarget,
            },
          }));
        } catch (err) {
          console.error("Error al refrescar stats de actividad:", err);
        }
      }
    } catch (err) {
      console.error("Error al inicializar sesión de autenticación:", err);
    }
  },

  switchProfile: async (profileId: string) => {
    const { activeProfile } = get();
    if (!activeProfile || activeProfile.id !== profileId) {
      await get().initAuthSession();
      return;
    }

    const isFemale = activeProfile.sex === "female";

    // Actualizar tema cinético en DOM
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        isFemale ? "hoplita_girl" : "hoplita"
      );
    }

    // 1. Asegurar mesociclo M1 en Supabase
    await ensureUserMesocyclesInitialized(activeProfile.id, activeProfile.userId);

    // 2. Aislar y cargar 1RM individual del perfil
    await useWorkoutSessionStore.getState().loadUserMaxes(activeProfile.id);

    // 3. Aislar y cargar registros biométricos del perfil
    await useBiometricsStore.getState().fetchUserData(activeProfile.id);
  },

  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => {
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        streakDays,
        weeklyCompleted,
        weeklyTarget,
      },
    }));
  },

  updateProfileGoals: async (
    targetBodyFatPct: number,
    targetWeightKg?: number,
    heightCm?: number | null,
    nutritionGoal?: NutritionGoal,
    sex?: BiologicalSex
  ) => {
    const { activeProfile } = get();
    const newSex = sex || activeProfile.sex;
    const isFemale = newSex === "female";
    const themeAccent = isFemale ? "#F43F5E" : "#CCFF00";
    const role = isFemale ? "hoplita_girl" : "hoplita";

    // Actualización optimista local
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        sex: newSex,
        gender: newSex,
        role,
        themeAccent,
        targetBodyFatPct,
        targetWeightKg: targetWeightKg ?? state.activeProfile.targetWeightKg,
        heightCm: heightCm !== undefined ? heightCm : state.activeProfile.heightCm,
        nutritionGoal: nutritionGoal !== undefined ? nutritionGoal : state.activeProfile.nutritionGoal,
      },
      profiles: state.profiles.map((p) =>
        p.id === activeProfile.id
          ? {
              ...p,
              sex: newSex,
              gender: newSex,
              role,
              themeAccent,
              targetBodyFatPct,
              targetWeightKg: targetWeightKg ?? p.targetWeightKg,
              heightCm: heightCm !== undefined ? heightCm : p.heightCm,
              nutritionGoal: nutritionGoal !== undefined ? nutritionGoal : p.nutritionGoal,
            }
          : p
      ),
    }));

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", isFemale ? "hoplita_girl" : "hoplita");
    }

    // Persistir en Supabase con filtro estricto por id de perfil
    try {
      const updatePayload: Record<string, any> = {
        sex: newSex,
        gender: newSex,
        role,
        theme_accent: themeAccent,
        target_body_fat_pct: targetBodyFatPct,
        target_weight_kg: targetWeightKg,
        updated_at: new Date().toISOString(),
      };
      if (heightCm !== undefined) {
        updatePayload.height_cm = heightCm;
      }
      if (nutritionGoal !== undefined) {
        updatePayload.nutrition_goal = nutritionGoal;
      }
      await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", activeProfile.id);
    } catch (err) {
      console.error("Error al actualizar perfil en Supabase:", err);
    }
  },

  updateProfileSex: async (newSex: BiologicalSex) => {
    const { activeProfile, updateProfileGoals } = get();
    const defaultFat = newSex === "female" ? 21.0 : 16.0;
    await updateProfileGoals(
      activeProfile.targetBodyFatPct || defaultFat,
      activeProfile.targetWeightKg,
      activeProfile.heightCm,
      activeProfile.nutritionGoal,
      newSex
    );
  },

  createProfile: async (data) => {
    try {
      const { authUserId } = get();
      const isFemale = data.sex === "female";
      const newProfileRow = {
        user_id: authUserId,
        display_name: data.displayName,
        sex: data.sex,
        gender: data.sex,
        role: isFemale ? "hoplita_girl" : "hoplita",
        theme_accent: isFemale ? "#F43F5E" : "#CCFF00",
        target_weight_kg: data.targetWeightKg || (isFemale ? 60 : 75),
        target_body_fat_pct: data.targetBodyFatPct || (isFemale ? 21.0 : 16.0),
        height_cm: data.heightCm || (isFemale ? 165 : 180),
        slug: data.displayName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      };

      const { data: inserted, error } = await supabase
        .from("profiles")
        .insert(newProfileRow)
        .select()
        .single();

      if (error) {
        console.error("Error insertando perfil en Supabase:", error);
        return null;
      }

      const created = mapDbProfileToProfile(inserted);
      set({ activeProfile: created, profiles: [created] });
      await ensureUserMesocyclesInitialized(created.id, authUserId);
      await get().switchProfile(created.id);
      return created;
    } catch (err) {
      console.error("Error creating profile:", err);
      return null;
    }
  },

  refreshStats: async () => {
    const { activeProfile } = get();
    if (!activeProfile.id) return;

    set({ isLoadingStats: true });
    try {
      // 1. Consultar metas actualizadas del perfil en Supabase
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeProfile.id)
        .maybeSingle();

      if (dbProfile) {
        const mapped = mapDbProfileToProfile(dbProfile);
        set((state) => ({
          activeProfile: {
            ...state.activeProfile,
            ...mapped,
          },
        }));
      }

      // 2. Consultar actividad y racha
      if (activeProfile.userId) {
        const stats = await fetchUserActivityStats(activeProfile.userId, activeProfile.weeklyTarget);
        get().updateActivityStats(stats.streakDays, stats.weeklyCompleted, stats.weeklyTarget);
      }
    } catch (err) {
      console.error("Error al refrescar estadísticas de perfil:", err);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hoplita_active_profile_id");
      }
      set({
        authUserId: null,
        authUserEmail: null,
        activeProfile: defaultProfile,
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
