"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useProfileStore } from "@/stores/useProfileStore";
import { Disc, Layers, Flame, X, Dumbbell, ShieldAlert, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlateCalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  initialWeightKg: number;
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

const PLATE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  25: { bg: "bg-red-600", text: "text-white", border: "border-red-500" },
  20: { bg: "bg-blue-600", text: "text-white", border: "border-blue-500" },
  15: { bg: "bg-amber-500", text: "text-black", border: "border-amber-400" },
  10: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-500" },
  5: { bg: "bg-zinc-200", text: "text-black", border: "border-white" },
  2.5: { bg: "bg-zinc-700", text: "text-white", border: "border-zinc-500" },
  1.25: { bg: "bg-zinc-500", text: "text-white", border: "border-zinc-400" },
};

export const PlateCalculatorDrawer: React.FC<PlateCalculatorDrawerProps> = ({
  isOpen,
  onClose,
  exerciseName,
  initialWeightKg,
}) => {
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [weightKg, setWeightKg] = useState<number>(initialWeightKg || 60);
  const [barWeight, setBarWeight] = useState<number>(20); // 20kg barra olímpica estándar

  // Calcular discos por lado
  const weightToDistribute = Math.max(0, weightKg - barWeight);
  const weightPerSide = weightToDistribute / 2;

  const calculatePlates = (targetPerSide: number) => {
    let remainder = targetPerSide;
    const plateCounts: { plate: number; count: number }[] = [];

    for (const plate of AVAILABLE_PLATES) {
      if (remainder >= plate) {
        const count = Math.floor(remainder / plate);
        plateCounts.push({ plate, count });
        remainder = Math.round((remainder - count * plate) * 100) / 100;
      }
    }

    return { plateCounts, remainder };
  };

  const { plateCounts, remainder } = calculatePlates(weightPerSide);

  // Series de aproximación BIIO previas a la primera serie efectiva
  const warmUpSets = [
    {
      step: 1,
      name: "Activación Articular",
      pct: 0.50,
      reps: "5 reps",
      rest: "60s",
      weight: Math.round((weightKg * 0.50) / 2.5) * 2.5,
      goal: "Lubricación y patrón motor",
    },
    {
      step: 2,
      name: "Aproximación Media",
      pct: 0.70,
      reps: "3 reps",
      rest: "90s",
      weight: Math.round((weightKg * 0.70) / 2.5) * 2.5,
      goal: "Reclutamiento de unidades motoras",
    },
    {
      step: 3,
      name: "Potenciación (PAP)",
      pct: 0.85,
      reps: "1-2 reps",
      rest: "120s",
      weight: Math.round((weightKg * 0.85) / 2.5) * 2.5,
      goal: "Sin fatiga, aclimatación a la carga",
    },
  ];

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-6 max-w-md mx-auto outline-none max-h-[92vh] overflow-y-auto">
          {/* Manija */}
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-5" />

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Calculadora de Discos & Aproximación
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
            Distribución exacta de discos por lado para <strong className="text-zinc-200">{exerciseName}</strong> y protocolo de calentamiento neural BIIO.
          </p>

          {/* Ajuste de Carga y Barra */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Carga Total Objetivo
                </span>
                <span className="text-3xl font-mono tabular-nums font-black text-white">
                  {weightKg} <span className="text-sm font-normal text-zinc-400">kg</span>
                </span>
              </div>

              {/* Botones rápidos de ajuste */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWeightKg((w) => Math.max(barWeight, w - 5))}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                >
                  -5
                </button>
                <button
                  onClick={() => setWeightKg((w) => Math.max(barWeight, w - 2.5))}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                >
                  -2.5
                </button>
                <button
                  onClick={() => setWeightKg((w) => w + 2.5)}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                >
                  +2.5
                </button>
                <button
                  onClick={() => setWeightKg((w) => w + 5)}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Selector de barra */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400">Tipo de Barra:</span>
              <div className="flex gap-1.5">
                {[
                  { label: "Olímpica 20kg", weight: 20 },
                  { label: "Chica 15kg", weight: 15 },
                  { label: "EZ 10kg", weight: 10 },
                ].map((bar) => (
                  <button
                    key={bar.weight}
                    onClick={() => setBarWeight(bar.weight)}
                    className={cn(
                      "min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums font-bold transition-all duration-200 active:scale-95",
                      barWeight === bar.weight
                        ? "text-black font-extrabold shadow-sm"
                        : "bg-zinc-800 text-zinc-300 hover:text-white"
                    )}
                    style={{
                      backgroundColor: barWeight === bar.weight ? accentColor : undefined,
                    }}
                  >
                    {bar.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visualizador de Discos en la Barra */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-zinc-300" />
                Cargar en cada lado de la barra ({weightPerSide} kg / lado):
              </span>
              {remainder > 0 && (
                <span className="text-[10px] font-mono text-amber-400">
                  Dif: {remainder * 2}kg
                </span>
              )}
            </div>

            {/* Representación gráfica de la manga de la barra */}
            <div className="relative py-4 px-2 flex items-center justify-center">
              {/* Barra sleeve */}
              <div className="w-full h-3 bg-zinc-700 rounded-full flex items-center justify-start gap-1 px-3 shadow-inner">
                {/* Collarín central */}
                <div className="w-2.5 h-8 bg-zinc-400 rounded-sm shadow-md" />

                {plateCounts.length === 0 ? (
                  <span className="text-xs font-mono text-zinc-400 ml-3 italic">
                    Solo la barra sin discos adicionales ({barWeight} kg)
                  </span>
                ) : (
                  plateCounts.map(({ plate, count }) =>
                    Array.from({ length: count }).map((_, i) => {
                      const color = PLATE_COLORS[plate] || {
                        bg: "bg-zinc-500",
                        text: "text-white",
                        border: "border-zinc-400",
                      };
                      const heightClass =
                        plate >= 20 ? "h-14 w-4" : plate >= 10 ? "h-12 w-3.5" : "h-9 w-3";
                      return (
                        <div
                          key={`${plate}-${i}`}
                          className={cn(
                            "rounded-sm flex items-center justify-center font-mono font-black text-[9px] shadow-lg border",
                            color.bg,
                            color.text,
                            color.border,
                            heightClass
                          )}
                          title={`${plate} kg`}
                        >
                          <span className="rotate-90 select-none">{plate}</span>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>

            {/* Listado de discos necesarios */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800">
              {plateCounts.length > 0 ? (
                plateCounts.map(({ plate, count }) => (
                  <div
                    key={plate}
                    className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full border",
                          PLATE_COLORS[plate]?.bg || "bg-zinc-500"
                        )}
                      />
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {plate} kg
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono font-black px-2 py-0.5 rounded-md text-black"
                      style={{ backgroundColor: accentColor }}
                    >
                      {count} por lado ({count * 2} tot)
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-zinc-400 py-1">
                  Carga igual al peso de la barra vacía ({barWeight} kg).
                </div>
              )}
            </div>
          </div>

          {/* 3 Series de Aproximación BIIO */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                3 Series de Aproximación Previas (Calentamiento Neural)
              </span>
            </div>

            <div className="space-y-2">
              {warmUpSets.map((set) => {
                const sideKg = Math.max(0, (set.weight - barWeight) / 2);
                return (
                  <div
                    key={set.step}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg bg-zinc-800 font-mono font-black text-xs flex items-center justify-center"
                        style={{ color: accentColor }}
                      >
                        A{set.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-white">
                            {set.weight} kg
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            ({Math.round(set.pct * 100)}% · {set.reps})
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block">
                          {set.goal} · Descanso {set.rest}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        Por lado:
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {sideKg > 0 ? `${sideKg} kg` : "Barra sola"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
