"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useProfileStore } from "@/stores/useProfileStore";
import { Disc, Flame, X, Dumbbell, Check } from "lucide-react";
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
  1.25: { bg: "bg-zinc-400", text: "text-black", border: "border-zinc-300" },
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

  // Lista plana de discos por lado ordenados de mayor a menor (desde el interior hacia el exterior)
  const plateListInsideOut: number[] = [];
  plateCounts.forEach(({ plate, count }) => {
    for (let i = 0; i < count; i++) {
      plateListInsideOut.push(plate);
    }
  });

  // Para el manguito izquierdo (vista frontal):
  // El exterior queda a la izquierda (menor peso) y el tope interior queda a la derecha (mayor peso)
  const leftSleevePlates = [...plateListInsideOut].reverse();
  // Para el manguito derecho (vista frontal):
  // El tope interior queda a la izquierda (mayor peso) y el exterior queda a la derecha (menor peso)
  const rightSleevePlates = [...plateListInsideOut];

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
        <Drawer.Content className="max-h-[90dvh] flex flex-col bg-zinc-950 border-t border-zinc-800 rounded-t-[28px] overflow-hidden fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none">
          {/* Handle superior visible */}
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto my-3 shrink-0" />

          {/* Cabecera Fija */}
          <div className="px-5 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5" style={{ color: accentColor }} />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Calculadora de Discos & Aproximación
                </h2>
              </div>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Distribución simétrica de discos para <strong className="text-zinc-200">{exerciseName}</strong> y protocolo de calentamiento neural BIIO.
            </p>
          </div>

          {/* Cuerpo desplazable */}
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8 overscroll-contain touch-pan-y space-y-5">
            {/* Ajuste de Carga y Barra */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Carga Total Objetivo
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono tabular-nums font-black text-white">
                    {weightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
                  </span>
                </div>

                {/* Botones rápidos de ajuste */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWeightKg((w) => Math.max(barWeight, w - 5))}
                    className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => setWeightKg((w) => Math.max(barWeight, w - 2.5))}
                    className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                  >
                    -2.5
                  </button>
                  <button
                    onClick={() => setWeightKg((w) => w + 2.5)}
                    className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
                  >
                    +2.5
                  </button>
                  <button
                    onClick={() => setWeightKg((w) => w + 5)}
                    className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-mono tabular-nums"
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
                        "min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums font-bold transition-all duration-200 active:scale-95",
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

            {/* VISUALIZADOR SIMÉTRICO DE LA BARRA OLÍMPICA */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Distribución Simétrica en Barra</span>
                </span>
                {remainder > 0 && (
                  <span className="text-[10px] font-mono text-amber-400">
                    Dif: {remainder * 2}kg
                  </span>
                )}
              </div>

              {/* Gráfico Centrado en 3 Partes: Manguito Izq + Barra Central + Manguito Der */}
              <div className="w-full flex items-center justify-center py-6 px-2 overflow-x-auto select-none min-h-[96px]">
                <div className="flex items-center justify-center shrink-0">
                  {/* 1. Manguito Izquierdo (Manga + Discos exteriores a interiores) */}
                  <div className="flex items-center justify-end">
                    {/* Punta de la manga izquierda */}
                    <div className="w-4 h-2 bg-zinc-600 rounded-l-sm" />

                    {/* Discos lado izquierdo */}
                    {leftSleevePlates.map((plate, idx) => {
                      const color = PLATE_COLORS[plate] || {
                        bg: "bg-zinc-500",
                        text: "text-white",
                        border: "border-zinc-400",
                      };
                      const heightClass =
                        plate >= 20 ? "h-14 w-3.5" : plate >= 10 ? "h-12 w-3" : plate >= 5 ? "h-9 w-2.5" : "h-7 w-2";
                      return (
                        <div
                          key={`left-${idx}`}
                          className={cn(
                            "rounded-sm flex items-center justify-center font-mono font-black text-[8px] shadow-lg border shrink-0 -mr-[1px]",
                            color.bg,
                            color.text,
                            color.border,
                            heightClass
                          )}
                          title={`${plate} kg`}
                        >
                          <span className="rotate-90 select-none leading-none scale-90">{plate}</span>
                        </div>
                      );
                    })}

                    {/* Tope / Collarín interior izquierdo */}
                    <div className="w-2 h-7 bg-zinc-300 rounded-sm shadow-md shrink-0" />
                  </div>

                  {/* 2. Cuerpo Central de la Barra (Moleteado) */}
                  <div className="w-24 sm:w-32 h-2.5 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 rounded-sm relative shrink-0 border-y border-zinc-500/50 flex items-center justify-center">
                    {/* Anillos de agarre moleteado */}
                    <div className="w-8 h-full bg-zinc-500/40 border-x border-zinc-400/30" />
                  </div>

                  {/* 3. Manguito Derecho (Tope interior + Discos interiores a exteriores + Punta) */}
                  <div className="flex items-center justify-start">
                    {/* Tope / Collarín interior derecho */}
                    <div className="w-2 h-7 bg-zinc-300 rounded-sm shadow-md shrink-0" />

                    {/* Discos lado derecho */}
                    {rightSleevePlates.map((plate, idx) => {
                      const color = PLATE_COLORS[plate] || {
                        bg: "bg-zinc-500",
                        text: "text-white",
                        border: "border-zinc-400",
                      };
                      const heightClass =
                        plate >= 20 ? "h-14 w-3.5" : plate >= 10 ? "h-12 w-3" : plate >= 5 ? "h-9 w-2.5" : "h-7 w-2";
                      return (
                        <div
                          key={`right-${idx}`}
                          className={cn(
                            "rounded-sm flex items-center justify-center font-mono font-black text-[8px] shadow-lg border shrink-0 -ml-[1px]",
                            color.bg,
                            color.text,
                            color.border,
                            heightClass
                          )}
                          title={`${plate} kg`}
                        >
                          <span className="rotate-90 select-none leading-none scale-90">{plate}</span>
                        </div>
                      );
                    })}

                    {/* Punta de la manga derecha */}
                    <div className="w-4 h-2 bg-zinc-600 rounded-r-sm" />
                  </div>
                </div>
              </div>

              {/* Leyenda de resumen compacta */}
              <div className="mt-2 pt-2 border-t border-zinc-800 text-center font-mono text-xs text-zinc-300">
                <span>Total: <strong className="text-white font-black">{weightKg} kg</strong></span>
                <span className="text-zinc-600 mx-2">|</span>
                <span>Por lado: <strong style={{ color: accentColor }}>{weightPerSide} kg</strong></span>
                <span className="text-zinc-600 mx-2">|</span>
                <span>Barra: <strong className="text-zinc-300">{barWeight} kg</strong></span>
              </div>

              {/* Listado de discos necesarios */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
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
                  <span>3 Series de Aproximación Previas (Calentamiento Neural)</span>
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
          </div>

          {/* Barra Inferior Fija de Acción (Sticky Bottom) */}
          <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-md px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] border-t border-zinc-900 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] rounded-2xl font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Entendido · Carga Lista</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
