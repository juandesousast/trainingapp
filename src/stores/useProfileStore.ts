import { create } from "zustand";
import { Profile, ProfileSlug } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";
import { supabase } from "@/lib/supabase";

interface ProfileState {
  activeProfile: Profile;
  profiles: Record<ProfileSlug, Profile>;
  isLoadingStats: boolean;
  setActiveProfile: (slug: ProfileSlug) => void;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
  updateProfileGoals: (targetBodyFatPct: number, targetWeightKg?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const defaultProfiles: Record<ProfileSlug, Profile> = {
  hoplita: {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "hoplita",
    displayName: "Él · Hoplita",
    gender: "male",
    themeAccent: "#CCFF00",
    targetBodyFatPct: 16.0,
    targetWeightKg: 78.0,
    streakDays: 0,
    weeklyCompleted: 0,
    weeklyTarget: 3,
  },
  hoplita_girl: {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "hoplita_girl",
    displayName: "Ella · Hoplita Girl",
    gender: "female",
    themeAccent: "#F43F5E",
    targetBodyFatPct: 21.0,
    targetWeightKg: 60.0,
    streakDays: 0,
    weeklyCompleted: 0,
    weeklyTarget: 3,
  },
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  activeProfile: defaultProfiles.hoplita,
  profiles: defaultProfiles,
  isLoadingStats: false,

  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => {
    set((state) => {
      const activeSlug = state.activeProfile.slug;
      const updatedActive = {
        ...state.activeProfile,
        streakDays,
        weeklyCompleted,
        weeklyTarget,
      };

      return {
        activeProfile: updatedActive,
        profiles: {
          ...state.profiles,
          [activeSlug]: updatedActive,
        },
      };
    });
  },

  updateProfileGoals: async (targetBodyFatPct: number, targetWeightKg?: number) => {
    const { activeProfile } = get();
    const activeSlug = activeProfile.slug;

    // Actualización optimista local
    const updatedActive = {
      ...activeProfile,
      targetBodyFatPct,
      targetWeightKg,
    };

    set((state) => ({
      activeProfile: updatedActive,
      profiles: {
        ...state.profiles,
        [activeSlug]: updatedActive,
      },
    }));

    // Persistir en Supabase
    try {
      await supabase
        .from("profiles")
        .update({
          target_body_fat_pct: targetBodyFatPct,
          target_weight_kg: targetWeightKg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeProfile.id);
    } catch (err) {
      console.error("Error al actualizar meta en Supabase:", err);
    }
  },

  refreshStats: async () => {
    const { activeProfile } = get();
    set({ isLoadingStats: true });
    try {
      // 1. Consultar metas actualizadas del perfil en Supabase
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("target_body_fat_pct, target_weight_kg")
        .eq("id", activeProfile.id)
        .maybeSingle();

      if (dbProfile) {
        set((state) => {
          const updated = {
            ...state.activeProfile,
            targetBodyFatPct: dbProfile.target_body_fat_pct ? Number(dbProfile.target_body_fat_pct) : state.activeProfile.targetBodyFatPct,
            targetWeightKg: dbProfile.target_weight_kg ? Number(dbProfile.target_weight_kg) : state.activeProfile.targetWeightKg,
          };
          return {
            activeProfile: updated,
            profiles: {
              ...state.profiles,
              [state.activeProfile.slug]: updated,
            },
          };
        });
      }

      // 2. Consultar actividad y racha
      const stats = await fetchUserActivityStats(activeProfile.id, activeProfile.weeklyTarget);
      get().updateActivityStats(stats.streakDays, stats.weeklyCompleted, stats.weeklyTarget);
    } catch (err) {
      console.error("Error al refrescar estadísticas de perfil:", err);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  setActiveProfile: (slug: ProfileSlug) => {
    set((state) => {
      const nextProfile = state.profiles[slug] || state.profiles.hoplita;
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", slug);
      }
      return { activeProfile: nextProfile };
    });

    // Cargar inmediatamente estadísticas reales de Supabase para el perfil seleccionado
    setTimeout(() => {
      get().refreshStats();
    }, 0);
  },
}));
