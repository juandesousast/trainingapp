import { create } from "zustand";
import { Profile, ProfileSlug } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";
import { supabase } from "@/lib/supabase";

interface ProfileState {
  authUserId: string | null;
  authUserEmail: string | null;
  myProfileSlug: string;
  isConsultationMode: boolean;
  activeProfile: Profile;
  profiles: Record<string, Profile>;
  allProfiles: Profile[];
  isLoadingStats: boolean;
  initAuthSession: () => Promise<void>;
  setActiveProfile: (slug: string) => void;
  toggleConsultationProfile: (slug: string) => void;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
  updateProfileGoals: (targetBodyFatPct: number, targetWeightKg?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultProfiles: Record<string, Profile> = {
  juan: {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "juan",
    displayName: "Juan",
    role: "hoplita",
    gender: "male",
    themeAccent: "#CCFF00",
    targetBodyFatPct: 16.0,
    targetWeightKg: 72.8,
    streakDays: 1,
    weeklyCompleted: 1,
    weeklyTarget: 3,
  },
  wendy: {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "wendy",
    displayName: "Wendy",
    role: "hoplita_girl",
    gender: "female",
    themeAccent: "#F43F5E",
    targetBodyFatPct: 21.0,
    targetWeightKg: 60.0,
    streakDays: 1,
    weeklyCompleted: 0,
    weeklyTarget: 3,
  },
  nato: {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "nato",
    displayName: "Nato",
    role: "hoplita",
    gender: "male",
    themeAccent: "#CCFF00",
    targetBodyFatPct: 15.0,
    targetWeightKg: 75.0,
    streakDays: 0,
    weeklyCompleted: 0,
    weeklyTarget: 3,
  },
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  authUserId: null,
  authUserEmail: null,
  myProfileSlug: "juan",
  isConsultationMode: false,
  activeProfile: defaultProfiles.juan,
  profiles: defaultProfiles,
  allProfiles: Object.values(defaultProfiles),
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

      // 1. Obtener todos los perfiles de la base de datos (permitido por RLS para authenticated)
      const { data: dbProfiles } = await supabase.from("profiles").select("*");

      if (dbProfiles && dbProfiles.length > 0) {
        const updatedProfiles: Record<string, Profile> = { ...get().profiles };

        dbProfiles.forEach((p: any) => {
          const slug = p.slug;
          updatedProfiles[slug] = {
            id: p.id,
            userId: p.user_id,
            slug: p.slug,
            displayName: p.display_name,
            role: p.role || (p.gender === "female" ? "hoplita_girl" : "hoplita"),
            gender: p.gender,
            themeAccent: p.theme_accent || (p.gender === "female" ? "#F43F5E" : "#CCFF00"),
            targetBodyFatPct: p.target_body_fat_pct ? Number(p.target_body_fat_pct) : 16.0,
            targetWeightKg: p.target_weight_kg ? Number(p.target_weight_kg) : 75.0,
            streakDays: p.streak_days || 0,
            weeklyCompleted: p.weekly_completed || 0,
            weeklyTarget: p.weekly_target || 3,
            avatarUrl: p.avatar_url,
          };
        });

        // 2. Identificar el perfil que pertenece al usuario logueado
        const myDbProfile = dbProfiles.find((p: any) => p.user_id === user.id);
        const mySlug = myDbProfile ? myDbProfile.slug : "juan";
        const myProfile = updatedProfiles[mySlug] || Object.values(updatedProfiles)[0];

        const themeAttribute =
          myProfile.role === "hoplita_girl" || myProfile.gender === "female"
            ? "hoplita_girl"
            : "hoplita";

        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", themeAttribute);
        }

        set({
          profiles: updatedProfiles,
          allProfiles: Object.values(updatedProfiles),
          myProfileSlug: mySlug,
          activeProfile: myProfile,
          isConsultationMode: false,
        });

        // 3. Cargar estadísticas para cada perfil
        for (const p of Object.values(updatedProfiles)) {
          try {
            const stats = await fetchUserActivityStats(p.id, p.weeklyTarget);
            set((state) => {
              const nextP = {
                ...state.profiles[p.slug],
                streakDays: stats.streakDays,
                weeklyCompleted: stats.weeklyCompleted,
                weeklyTarget: stats.weeklyTarget,
              };
              const newProfiles = {
                ...state.profiles,
                [p.slug]: nextP,
              };
              return {
                profiles: newProfiles,
                allProfiles: Object.values(newProfiles),
                activeProfile: state.activeProfile.slug === p.slug ? nextP : state.activeProfile,
              };
            });
          } catch (err) {
            console.error(`Error loading stats for ${p.slug}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Error al inicializar sesión de autenticación:", err);
    }
  },

  toggleConsultationProfile: (targetSlug: string) => {
    const { myProfileSlug, profiles } = get();
    const isConsultation = targetSlug !== myProfileSlug;
    const targetProfile = profiles[targetSlug] || profiles[myProfileSlug];

    const themeAttribute =
      targetProfile.role === "hoplita_girl" || targetProfile.gender === "female"
        ? "hoplita_girl"
        : "hoplita";

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeAttribute);
    }

    set({
      isConsultationMode: isConsultation,
      activeProfile: targetProfile,
    });
  },

  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => {
    set((state) => {
      const activeSlug = state.activeProfile.slug;
      const updatedActive = {
        ...state.activeProfile,
        streakDays,
        weeklyCompleted,
        weeklyTarget,
      };

      const newProfiles = {
        ...state.profiles,
        [activeSlug]: updatedActive,
      };

      return {
        activeProfile: updatedActive,
        profiles: newProfiles,
        allProfiles: Object.values(newProfiles),
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

    set((state) => {
      const newProfiles = {
        ...state.profiles,
        [activeSlug]: updatedActive,
      };
      return {
        activeProfile: updatedActive,
        profiles: newProfiles,
        allProfiles: Object.values(newProfiles),
      };
    });

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
          const newProfiles = {
            ...state.profiles,
            [state.activeProfile.slug]: updated,
          };
          return {
            activeProfile: updated,
            profiles: newProfiles,
            allProfiles: Object.values(newProfiles),
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

  setActiveProfile: (slug: string) => {
    get().toggleConsultationProfile(slug);
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
        isConsultationMode: false,
        activeProfile: defaultProfiles.juan,
        myProfileSlug: "juan",
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
