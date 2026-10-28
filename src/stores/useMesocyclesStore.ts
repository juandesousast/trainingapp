import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProfileSlug } from "@/lib/types";

interface MesocyclesState {
  activeMesoNumberByProfile: Record<string, number>;
  setActiveMesoNumber: (slug: string, mesoNumber: number) => void;
}

export const useMesocyclesStore = create<MesocyclesState>()(
  persist(
    (set) => ({
      activeMesoNumberByProfile: {
        juan: 1,
        wendy: 1,
        nato: 1,
        hoplita: 1,
        hoplita_girl: 1,
      },
      setActiveMesoNumber: (slug: string, mesoNumber: number) => {
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
