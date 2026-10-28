import { create } from "zustand";
import { Profile, ProfileSlug } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";

interface ProfileState {
  activeProfile: Profile;
  profiles: Record<ProfileSlug, Profile>;
  isLoadingStats: boolean;
  setActiveProfile: (slug: ProfileSlug) => void;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
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
    targetBodyFatPct: 20.0,
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

  refreshStats: async () => {
    const { activeProfile } = get();
    set({ isLoadingStats: true });
    try {
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
