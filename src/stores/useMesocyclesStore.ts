import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MesocyclesState {
  activeMesoNumberByProfile: Record<string, number>;
  setActiveMesoNumber: (slug: string, mesoNumber: number) => void;
  exposuresByProfileAndMeso: Record<string, Record<number, number>>;
  advanceExposure: (slug: string, mesoNumber: number, maxExposures?: number) => void;
  setExposure: (slug: string, mesoNumber: number, exposure: number) => void;
  getExposure: (slug: string, mesoNumber: number, fallback?: number) => number;
}

export const useMesocyclesStore = create<MesocyclesState>()(
  persist(
    (set, get) => ({
      activeMesoNumberByProfile: {
        juan: 1,
        wendy: 1,
        nato: 1,
        hoplita: 1,
        hoplita_girl: 1,
      },
      exposuresByProfileAndMeso: {
        juan: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        wendy: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        nato: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        hoplita: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        hoplita_girl: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      },
      setActiveMesoNumber: (slug: string, mesoNumber: number) => {
        set((state) => ({
          activeMesoNumberByProfile: {
            ...state.activeMesoNumberByProfile,
            [slug]: mesoNumber,
          },
        }));
      },
      getExposure: (slug: string, mesoNumber: number, fallback = 1) => {
        const profileExposures = get().exposuresByProfileAndMeso?.[slug];
        if (profileExposures && profileExposures[mesoNumber] !== undefined) {
          return profileExposures[mesoNumber];
        }
        return fallback;
      },
      setExposure: (slug: string, mesoNumber: number, exposure: number) => {
        set((state) => ({
          exposuresByProfileAndMeso: {
            ...state.exposuresByProfileAndMeso,
            [slug]: {
              ...(state.exposuresByProfileAndMeso?.[slug] || {}),
              [mesoNumber]: exposure,
            },
          },
        }));
      },
      advanceExposure: (slug: string, mesoNumber: number, maxExposures = 12) => {
        set((state) => {
          const currentExp =
            state.exposuresByProfileAndMeso?.[slug]?.[mesoNumber] ?? 1;
          const nextExp = Math.min(maxExposures, currentExp + 1);
          return {
            exposuresByProfileAndMeso: {
              ...state.exposuresByProfileAndMeso,
              [slug]: {
                ...(state.exposuresByProfileAndMeso?.[slug] || {}),
                [mesoNumber]: nextExp,
              },
            },
          };
        });
      },
    }),
    {
      name: "hoplita-mesocycles-storage",
    }
  )
);
