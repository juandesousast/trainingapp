"use client";

import React, { useState, useMemo } from "react";
import { Drawer } from "vaul";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { Calculator, Check, X, ArrowRightLeft, Dumbbell, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MRCalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseSlug: string;
  exerciseName: string;
  muscleGroup?: string;
  initialWeight?: number;
}

// Tablas oficiales Maurice & Rydin BIIO (% de 1RM según repeticiones)
const MR_TABLE_UPPER: Record<number, number> = {
  1: 100.0,
  2: 95.0,
  3: 92.5,
  4: 90.0,
  5: 87.5,
  6: 85.0,
  7: 82.5,
  8: 80.0,
  9: 77.5,
  10: 75.0,
  11: 72.5,
  12: 70.0,
};

const MR_TABLE_LOWER: Record<number, number> = {
  1: 100.0,
  2: 96.0,
  3: 93.5,
  4: 91.0,
  5: 88.5,
  6: 86.5,
  7: 84.0,
  8: 82.0,
  9: 79.5,
  10: 77.5,
  11: 75.0,
  12: 72.5,
};

export const MRCalculatorDrawer: React.FC<MRCalculatorDrawerProps> = ({
  isOpen,
  onClose,
  exerciseSlug,
  exerciseName,
  muscleGroup,
  initialWeight,
}) => {
  const { userMaxes, update1RM } = useWorkoutSessionStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  // Detectar automáticamente Tren Inferior vs Tren Superior según nombre o grupo muscular
  const isLowerBody = useMemo(() => {
    const text = `${exerciseName} ${muscleGroup || ""}`.toLowerCase();
    return (
      text.includes("pierna") ||
      text.includes("sentadilla") ||
      text.includes("squat") ||
      text.includes("muerto") ||
      text.includes("deadlift") ||
      text.includes("prensa") ||
      text.includes("isquio") ||
      text.includes("femoral") ||
      text.includes("cuádriceps") ||
      text.includes("glúteo") ||
      text.includes("thrust") ||
      text.includes("gemelo")
    );
  }, [exerciseName, muscleGroup]);

  const [bodyPart, setBodyPart] = useState<"upper" | "lower">(
    isLowerBody ? "lower" : "upper"
  );

  const currentProfile1RM = userMaxes[exerciseSlug] || 80;

  // Reps y Peso actual realizado
  const [currentWeight, setCurrentWeight] = useState<number>(
    initialWeight && initialWeight > 0 ? initialWeight : Math.round(currentProfile1RM * 0.8)
  );
  const [currentReps, setCurrentReps] = useState<number>(6);

  // Reps deseadas / objetivo
  const [targetReps, setTargetReps] = useState<number>(8);

  const activeTable = bodyPart === "upper" ? MR_TABLE_UPPER : MR_TABLE_LOWER;

  // Cálculos Maurice & Rydin
  const currentPct = activeTable[currentReps] || 85.0;
  const targetPct = activeTable[targetReps] || 80.0;

  // 1RM estimado = Peso Actual / (Porcentaje Actual / 100)
  const estimated1RM = Math.round((currentWeight / (currentPct / 100)) * 10) / 10;

  // Peso objetivo para las repeticiones deseadas
  // Peso Deseado = Peso Actual * (Porcentaje Objetivo / Porcentaje Actual)
  const targetWeight = Math.round(((currentWeight * targetPct) / currentPct) * 2) / 2; // redondeado a múltiplos de 0.5 kg

  const handleApply1RM = () => {
    update1RM(exerciseSlug, Math.round(estimated1RM));
    onClose();
  };

  const repList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-6 max-w-md mx-auto outline-none max-h-[92vh] overflow-y-auto">
          {/* Manija de arrastre */}
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-5" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Calculadora Maurice & Rydin (M&R)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Conversión oficial BIIO para <strong className="text-zinc-200">{exerciseName}</strong> calculando la equivalencia de carga entre repeticiones.
          </p>

          {/* Selector de Pestañas: Tren Superior vs Tren Inferior */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 mb-5">
            <button
              type="button"
              onClick={() => setBodyPart("upper")}
              className={cn(
                "min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5",
                bodyPart === "upper"
                  ? "text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              )}
              style={{
                backgroundColor: bodyPart === "upper" ? accentColor : "transparent",
              }}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Tren Superior</span>
            </button>

            <button
              type="button"
              onClick={() => setBodyPart("lower")}
              className={cn(
                "min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5",
                bodyPart === "lower"
                  ? "text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              )}
              style={{
                backgroundColor: bodyPart === "lower" ? accentColor : "transparent",
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tren Inferior</span>
            </button>
          </div>

          {/* Parámetros de Entrada: Rendimiento Actual vs Repeticiones Deseadas */}
          <div className="space-y-3 mb-5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
                1. Rendimiento Actual (Hecho en Sesión)
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Kilos actuales */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                    Carga
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentWeight((w) => Math.max(2.5, w - 2.5))}
                      className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums font-black text-sm text-zinc-100">
                      {currentWeight} <span className="text-[10px] text-zinc-400">kg</span>
                    </span>
                    <button
                      onClick={() => setCurrentWeight((w) => w + 2.5)}
                      className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps actuales */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                    Repeticiones ({currentPct}%)
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentReps((r) => Math.max(1, r - 1))}
                      className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums font-black text-sm text-zinc-100">
                      {currentReps} <span className="text-[10px] text-zinc-400">reps</span>
                    </span>
                    <button
                      onClick={() => setCurrentReps((r) => Math.min(12, r + 1))}
                      className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
                2. Objetivo M&R (Repeticiones que buscas)
              </span>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
                    Repeticiones Deseadas
                  </span>
                  <span className="text-xs font-mono tabular-nums text-zinc-400">
                    Equivale al {targetPct}% de 1RM
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTargetReps((r) => Math.max(1, r - 1))}
                    className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono tabular-nums font-black text-base text-zinc-100">
                    {targetReps} r
                  </span>
                  <button
                    onClick={() => setTargetReps((r) => Math.min(12, r + 1))}
                    className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Resultado Calculado */}
          <div
            className="rounded-2xl p-4 mb-5 border backdrop-blur-sm shadow-xl flex items-center justify-between"
            style={{
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}55`,
            }}
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-300 block">
                Carga Sugerida para {targetReps} Repeticiones
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className="text-3xl font-mono font-black tracking-tight"
                  style={{ color: accentColor }}
                >
                  {targetWeight} kg
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  (1RM estimado: {estimated1RM} kg)
                </span>
              </div>
            </div>

            <button
              onClick={handleApply1RM}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black uppercase text-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar 1RM</span>
            </button>
          </div>

          {/* Tabla Completa de Conversión Maurice & Rydin */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                Escala Completa M&R ({bodyPart === "upper" ? "Tren Superior" : "Tren Inferior"}):
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Basado en 1RM: {estimated1RM} kg
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {repList.map((reps) => {
                const pct = activeTable[reps];
                const calculatedKg = Math.round(((estimated1RM * pct) / 100) * 2) / 2;
                const isSelected = reps === targetReps;

                return (
                  <button
                    key={reps}
                    type="button"
                    onClick={() => setTargetReps(reps)}
                    className={cn(
                      "p-2 rounded-xl text-center border transition-all text-left",
                      isSelected
                        ? "border-white bg-zinc-900 shadow-md"
                        : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                    )}
                    style={{
                      borderColor: isSelected ? accentColor : undefined,
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold block text-zinc-400">
                      {reps} {reps === 1 ? "rep" : "reps"} ({pct}%)
                    </span>
                    <span
                      className="text-xs font-mono font-black block mt-0.5"
                      style={{ color: isSelected ? accentColor : "#FFFFFF" }}
                    >
                      {calculatedKg} kg
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
