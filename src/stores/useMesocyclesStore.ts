import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProfileSlug } from "@/lib/types";

interface MesocyclesState {
  activeMesoNumberByProfile: Record<ProfileSlug, number>;
  setActiveMesoNumber: (slug: ProfileSlug, mesoNumber: number) => void;
}

export const useMesocyclesStore = create<MesocyclesState>()(
  persist(
    (set) => ({
      activeMesoNumberByProfile: {
        hoplita: 1,
        hoplita_girl: 1,
      },
      setActiveMesoNumber: (slug: ProfileSlug, mesoNumber: number) => {
        set((state) => ({
          activeMesoNumberByProfile: {
            ...state.activeMesoNumberByProfile,
            [slug]: mesoNumber,
          },
        }));
      },
    }),
    {
      name: "hoplita-mesocycles-storage",
    }
  )
);
