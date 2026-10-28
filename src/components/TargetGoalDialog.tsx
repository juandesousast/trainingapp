"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { useProfileStore } from "@/stores/useProfileStore";
import { Target, Check, X, Percent, Scale } from "lucide-react";

interface TargetGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TargetGoalDialog: React.FC<TargetGoalDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeProfile, updateProfileGoals } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [targetFat, setTargetFat] = useState<number>(
    activeProfile.targetBodyFatPct || (activeProfile.slug === "hoplita" ? 16.0 : 21.0)
  );
  const [targetWeight, setTargetWeight] = useState<number>(
    activeProfile.targetWeightKg || (activeProfile.slug === "hoplita" ? 78.0 : 60.0)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      setTargetFat(
        activeProfile.targetBodyFatPct || (activeProfile.slug === "hoplita" ? 16.0 : 21.0)
      );
      setTargetWeight(
        activeProfile.targetWeightKg || (activeProfile.slug === "hoplita" ? 78.0 : 60.0)
      );
    }
  }, [activeProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileGoals(targetFat, targetWeight);
      onClose();
    } catch (err) {
      console.error("Error al guardar meta:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] px-6 pt-5 pb-6 max-w-md mx-auto outline-none max-h-[85vh] overflow-y-auto">
          {/* Manija */}
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Meta de Recomposición
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-5">
            Configura tus objetivos corporales para <strong className="text-zinc-200">{activeProfile.displayName}</strong>.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Meta de % Grasa Corporal */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
                  <Percent className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>% Grasa Corporal Deseado</span>
                </span>
                <span
                  className="text-xs font-mono font-black px-2 py-0.5 rounded-full text-black"
                  style={{ backgroundColor: accentColor }}
                >
                  {targetFat}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetFat((v) => Math.max(8, Math.round((v - 1) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-base active:scale-95"
                  >
                    -1%
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetFat((v) => Math.max(8, Math.round((v - 0.5) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-xs active:scale-95"
                  >
                    -0.5
                  </button>
                </div>

                <div className="text-center font-mono font-black text-2xl text-white">
                  {targetFat} <span className="text-xs font-normal text-zinc-400">%</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetFat((v) => Math.min(35, Math.round((v + 0.5) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-xs active:scale-95"
                  >
                    +0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetFat((v) => Math.min(35, Math.round((v + 1) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-base active:scale-95"
                  >
                    +1%
                  </button>
                </div>
              </div>
            </div>

            {/* Meta de Peso Corporal (kg) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
                  <Scale className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Peso Objetivo en Báscula (kg)</span>
                </span>
                <span
                  className="text-xs font-mono font-black px-2 py-0.5 rounded-full text-black"
                  style={{ backgroundColor: accentColor }}
                >
                  {targetWeight} kg
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetWeight((w) => Math.max(40, Math.round((w - 1) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-base active:scale-95"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetWeight((w) => Math.max(40, Math.round((w - 0.5) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-xs active:scale-95"
                  >
                    -0.5
                  </button>
                </div>

                <div className="text-center font-mono font-black text-2xl text-white">
                  {targetWeight} <span className="text-xs font-normal text-zinc-400">kg</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetWeight((w) => Math.min(130, Math.round((w + 0.5) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-xs active:scale-95"
                  >
                    +0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetWeight((w) => Math.min(130, Math.round((w + 1) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 font-bold text-white text-base active:scale-95"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de Guardado */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isSaving ? "Guardando en Supabase..." : "Guardar Meta Personalizada"}</span>
            </button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
