import { create } from "zustand";
import { Profile } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";
import { supabase } from "@/lib/supabase";
import { useBiometricsStore } from "@/stores/useBiometricsStore";

interface ProfileState {
  authUserId: string | null;
  authUserEmail: string | null;
  activeProfile: Profile;
  isLoadingStats: boolean;
  initAuthSession: () => Promise<void>;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
  updateProfileGoals: (targetBodyFatPct: number, targetWeightKg?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultProfile: Profile = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "juan",
  displayName: "Juan",
  role: "hoplita",
  gender: "male",
  themeAccent: "#CCFF00",
  targetBodyFatPct: 16.0,
  targetWeightKg: 72.8,
  heightCm: 180,
  streakDays: 0,
  weeklyCompleted: 0,
  weeklyTarget: 3,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  authUserId: null,
  authUserEmail: null,
  activeProfile: defaultProfile,
  isLoadingStats: false,

  initAuthSession: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ authUserId: null, authUserEmail: null });
        return;
      }

      set({ authUserId: user.id, authUserEmail: user.email || null });

      // Consultar ÚNICAMENTE el perfil del usuario autenticado con filtro estricto por user_id
      const { data: dbProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("Aviso al consultar perfil en Supabase:", profileError.message);
      }

      if (dbProfile) {
        const isGirl = dbProfile.role === "hoplita_girl" || dbProfile.gender === "female";
        const currentProfile: Profile = {
          id: dbProfile.id,
          userId: dbProfile.user_id,
          slug: dbProfile.slug,
          displayName: dbProfile.display_name,
          role: dbProfile.role || (isGirl ? "hoplita_girl" : "hoplita"),
          gender: dbProfile.gender,
          themeAccent: dbProfile.theme_accent || (isGirl ? "#F43F5E" : "#CCFF00"),
          targetBodyFatPct: dbProfile.target_body_fat_pct ? Number(dbProfile.target_body_fat_pct) : 16.0,
          targetWeightKg: dbProfile.target_weight_kg ? Number(dbProfile.target_weight_kg) : 75.0,
          heightCm: dbProfile.height_cm ? Number(dbProfile.height_cm) : null,
          streakDays: dbProfile.streak_days || 0,
          weeklyCompleted: dbProfile.weekly_completed || 0,
          weeklyTarget: dbProfile.weekly_target || 3,
          avatarUrl: dbProfile.avatar_url,
        };

        if (typeof document !== "undefined") {
          document.documentElement.setAttribute(
            "data-theme",
            isGirl ? "hoplita_girl" : "hoplita"
          );
        }

        set({
          activeProfile: currentProfile,
        });

        // Cargar estadísticas y datos biométricos reales del usuario autenticado
        try {
          const stats = await fetchUserActivityStats(user.id, currentProfile.weeklyTarget);
          set((state) => ({
            activeProfile: {
              ...state.activeProfile,
              streakDays: stats.streakDays,
              weeklyCompleted: stats.weeklyCompleted,
              weeklyTarget: stats.weeklyTarget,
            },
          }));
        } catch (err) {
          console.error("Error al cargar stats de actividad:", err);
        }

        // Sincronizar store de biometría del usuario activo
        await useBiometricsStore.getState().fetchUserData();
      }
    } catch (err) {
      console.error("Error al inicializar sesión de autenticación:", err);
    }
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

  updateProfileGoals: async (targetBodyFatPct: number, targetWeightKg?: number) => {
    const { authUserId, activeProfile } = get();

    // Actualización optimista local
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        targetBodyFatPct,
        targetWeightKg,
      },
    }));

    // Persistir en Supabase con filtro estricto por user_id
    try {
      if (authUserId) {
        await supabase
          .from("profiles")
          .update({
            target_body_fat_pct: targetBodyFatPct,
            target_weight_kg: targetWeightKg,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", authUserId);
      }
    } catch (err) {
      console.error("Error al actualizar meta en Supabase:", err);
    }
  },

  refreshStats: async () => {
    const { authUserId, activeProfile } = get();
    if (!authUserId) return;

    set({ isLoadingStats: true });
    try {
      // 1. Consultar metas actualizadas del perfil en Supabase
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("target_body_fat_pct, target_weight_kg")
        .eq("user_id", authUserId)
        .maybeSingle();

      if (dbProfile) {
        set((state) => ({
          activeProfile: {
            ...state.activeProfile,
            targetBodyFatPct: dbProfile.target_body_fat_pct
              ? Number(dbProfile.target_body_fat_pct)
              : state.activeProfile.targetBodyFatPct,
            targetWeightKg: dbProfile.target_weight_kg
              ? Number(dbProfile.target_weight_kg)
              : state.activeProfile.targetWeightKg,
          },
        }));
      }

      // 2. Consultar actividad y racha
      const stats = await fetchUserActivityStats(authUserId, activeProfile.weeklyTarget);
      get().updateActivityStats(stats.streakDays, stats.weeklyCompleted, stats.weeklyTarget);
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
