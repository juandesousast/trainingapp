import { create } from "zustand";
import { Profile, ProfileSlug } from "@/lib/types";

interface ProfileState {
  activeProfile: Profile;
  profiles: Record<ProfileSlug, Profile>;
  setActiveProfile: (slug: ProfileSlug) => void;
}

const defaultProfiles: Record<ProfileSlug, Profile> = {
  hoplita: {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "hoplita",
    displayName: "Él · Hoplita",
    gender: "male",
    themeAccent: "#CCFF00",
    targetBodyFatPct: 16.0,
    streakDays: 14,
    weeklyCompleted: 3,
    weeklyTarget: 4,
  },
  hoplita_girl: {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "hoplita_girl",
    displayName: "Ella · Hoplita Girl",
    gender: "female",
    themeAccent: "#F43F5E",
    targetBodyFatPct: 20.0,
    streakDays: 11,
    weeklyCompleted: 2,
    weeklyTarget: 3,
  },
};

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: defaultProfiles.hoplita,
  profiles: defaultProfiles,
  setActiveProfile: (slug: ProfileSlug) => {
    set((state) => {
      const nextProfile = state.profiles[slug] || state.profiles.hoplita;
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", slug);
      }
      return { activeProfile: nextProfile };
    });
  },
}));
