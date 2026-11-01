import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MesocyclesState {
  activeMesoNumberByProfile: Record<string, number>;
  setActiveMesoNumber: (profileId: string, mesoNumber: number) => void;
  exposuresByProfileAndMeso: Record<string, Record<number, number>>;
  advanceExposure: (profileId: string, mesoNumber: number, maxExposures?: number) => void;
  setExposure: (profileId: string, mesoNumber: number, exposure: number) => void;
  getExposure: (profileId: string, mesoNumber: number, fallback?: number) => number;
}

export const useMesocyclesStore = create<MesocyclesState>()(
  persist(
    (set, get) => ({
      activeMesoNumberByProfile: {},
      exposuresByProfileAndMeso: {},
      setActiveMesoNumber: (profileId: string, mesoNumber: number) => {
        set((state) => ({
          activeMesoNumberByProfile: {
            ...state.activeMesoNumberByProfile,
            [profileId]: mesoNumber,
          },
        }));
      },
      getExposure: (profileId: string, mesoNumber: number, fallback = 1) => {
        const profileExposures = get().exposuresByProfileAndMeso?.[profileId];
        if (profileExposures && profileExposures[mesoNumber] !== undefined) {
          return profileExposures[mesoNumber];
        }
        return fallback;
      },
      setExposure: (profileId: string, mesoNumber: number, exposure: number) => {
        set((state) => ({
          exposuresByProfileAndMeso: {
            ...state.exposuresByProfileAndMeso,
            [profileId]: {
              ...(state.exposuresByProfileAndMeso?.[profileId] || {}),
              [mesoNumber]: exposure,
            },
          },
        }));
      },
      advanceExposure: (profileId: string, mesoNumber: number, maxExposures = 12) => {
        set((state) => {
          const currentExp =
            state.exposuresByProfileAndMeso?.[profileId]?.[mesoNumber] ?? 1;
          const nextExp = Math.min(maxExposures, currentExp + 1);
          return {
            exposuresByProfileAndMeso: {
              ...state.exposuresByProfileAndMeso,
              [profileId]: {
                ...(state.exposuresByProfileAndMeso?.[profileId] || {}),
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
