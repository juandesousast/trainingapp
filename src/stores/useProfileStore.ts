import { create } from "zustand";
import { Profile, ProfileSlug } from "@/lib/types";
import { fetchUserActivityStats } from "@/lib/activityStats";
import { supabase } from "@/lib/supabase";

interface ProfileState {
  authUserId: string | null;
  authUserEmail: string | null;
  myProfileSlug: ProfileSlug;
  isConsultationMode: boolean;
  activeProfile: Profile;
  profiles: Record<ProfileSlug, Profile>;
  isLoadingStats: boolean;
  initAuthSession: () => Promise<void>;
  setActiveProfile: (slug: ProfileSlug) => void;
  toggleConsultationProfile: (slug: ProfileSlug) => void;
  updateActivityStats: (streakDays: number, weeklyCompleted: number, weeklyTarget: number) => void;
  updateProfileGoals: (targetBodyFatPct: number, targetWeightKg?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  signOut: () => Promise<void>;
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
  authUserId: null,
  authUserEmail: null,
  myProfileSlug: "hoplita",
  isConsultationMode: false,
  activeProfile: defaultProfiles.hoplita,
  profiles: defaultProfiles,
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
        const updatedProfiles = { ...get().profiles };

        dbProfiles.forEach((p: any) => {
          const slug = p.slug as ProfileSlug;
          if (updatedProfiles[slug]) {
            updatedProfiles[slug] = {
              ...updatedProfiles[slug],
              id: p.id,
              userId: p.user_id,
              targetBodyFatPct: p.target_body_fat_pct ? Number(p.target_body_fat_pct) : updatedProfiles[slug].targetBodyFatPct,
              targetWeightKg: p.target_weight_kg ? Number(p.target_weight_kg) : updatedProfiles[slug].targetWeightKg,
            };
          }
        });

        // 2. Identificar el perfil que pertenece al usuario logueado
        const myDbProfile = dbProfiles.find((p: any) => p.user_id === user.id);
        const mySlug: ProfileSlug = myDbProfile
          ? (myDbProfile.slug as ProfileSlug)
          : user.email?.includes("girl")
          ? "hoplita_girl"
          : "hoplita";

        const myProfile = updatedProfiles[mySlug];

        set({
          profiles: updatedProfiles,
          myProfileSlug: mySlug,
          activeProfile: myProfile,
          isConsultationMode: false,
        });

        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", mySlug);
        }

        // 3. Cargar estadísticas para ambos perfiles (para el widget de pareja)
        for (const slug of ["hoplita", "hoplita_girl"] as ProfileSlug[]) {
          const profileItem = updatedProfiles[slug];
          if (profileItem) {
            try {
              const stats = await fetchUserActivityStats(profileItem.id, profileItem.weeklyTarget);
              set((state) => {
                const nextP = {
                  ...state.profiles[slug],
                  streakDays: stats.streakDays,
                  weeklyCompleted: stats.weeklyCompleted,
                  weeklyTarget: stats.weeklyTarget,
                };
                return {
                  profiles: {
                    ...state.profiles,
                    [slug]: nextP,
                  },
                  activeProfile: state.activeProfile.slug === slug ? nextP : state.activeProfile,
                };
              });
            } catch (err) {
              console.error(`Error loading stats for ${slug}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error al inicializar sesión de autenticación:", err);
    }
  },

  toggleConsultationProfile: (targetSlug: ProfileSlug) => {
    const { myProfileSlug, profiles } = get();
    const isConsultation = targetSlug !== myProfileSlug;
    const targetProfile = profiles[targetSlug] || profiles[myProfileSlug];

    set({
      isConsultationMode: isConsultation,
      activeProfile: targetProfile,
    });

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", targetSlug);
    }
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
        activeProfile: defaultProfiles.hoplita,
        myProfileSlug: "hoplita",
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
