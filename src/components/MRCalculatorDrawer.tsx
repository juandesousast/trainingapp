"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { Calculator, Check, ArrowRight, X } from "lucide-react";

interface MRCalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseSlug: string;
  exerciseName: string;
}

export const MRCalculatorDrawer: React.FC<MRCalculatorDrawerProps> = ({
  isOpen,
  onClose,
  exerciseSlug,
  exerciseName,
}) => {
  const { userMaxes, update1RM } = useWorkoutSessionStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const current1RM = userMaxes[exerciseSlug] || 80;

  // Calculadora interactiva
  const [testWeight, setTestWeight] = useState<number>(current1RM * 0.8);
  const [testReps, setTestReps] = useState<number>(6);

  // Estimación Mayhew & Robbins: 100 * peso / (52.2 + 41.9 * exp(-0.055 * reps))
  const estimatedMayhew = Math.round(
    (100 * testWeight) / (52.2 + 41.9 * Math.exp(-0.055 * testReps))
  );

  const applyCalculated1RM = () => {
    update1RM(exerciseSlug, estimatedMayhew);
    onClose();
  };

  const percentages = [
    { pct: 0.75, label: "75%", reps: "10 reps / M3" },
    { pct: 0.80, label: "80%", reps: "8 reps / M4" },
    { pct: 0.85, label: "85%", reps: "6 reps / M3 Desc" },
    { pct: 0.875, label: "87.5%", reps: "5 reps / M5 Cluster 15s" },
    { pct: 0.90, label: "90%", reps: "4 reps / M5 Cluster 20s" },
    { pct: 0.925, label: "92.5%", reps: "3 reps / M5 Cluster 25s" },
  ];

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-6 max-w-md mx-auto outline-none">
          {/* Manija superior */}
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Calculadora M&R (1RM)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-6">
            Ajusta o estima el 1RM para <strong className="text-zinc-200">{exerciseName}</strong> usando los coeficientes oficiales Mayhew & Robbins.
          </p>

          {/* Valor actual de 1RM */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                1RM Guardado en Perfil
              </span>
              <span className="text-2xl font-mono font-black text-white">
                {current1RM} <span className="text-sm font-normal text-zinc-400">kg</span>
              </span>
            </div>
            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded-full text-black"
              style={{ backgroundColor: accentColor }}
            >
              100% Maximal
            </span>
          </div>

          {/* Entradas interactivas sin teclado */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                Kilos Levantados
              </span>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setTestWeight((w) => Math.max(5, w - 2.5))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg flex items-center justify-center text-white"
                >
                  -
                </button>
                <span className="font-mono font-bold text-base text-zinc-200">
                  {testWeight} kg
                </span>
                <button
                  onClick={() => setTestWeight((w) => w + 2.5)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                Repeticiones
              </span>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setTestReps((r) => Math.max(1, r - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg flex items-center justify-center text-white"
                >
                  -
                </button>
                <span className="font-mono font-bold text-base text-zinc-200">
                  {testReps} reps
                </span>
                <button
                  onClick={() => setTestReps((r) => Math.min(15, r + 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Resultado estimado y botón de aplicación */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block font-mono">
                1RM Estimado (Fórmula M&R):
              </span>
              <span className="text-xl font-mono font-black text-zinc-100">
                {estimatedMayhew} kg
              </span>
            </div>
            <button
              onClick={applyCalculated1RM}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase text-black flex items-center gap-1.5 transition-transform active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <span>Aplicar</span>
              <Check className="w-4 h-4" />
            </button>
          </div>

          {/* Tabla rápida de % de 1RM para este ejercicio */}
          <div className="mb-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
              Pesos objetivos según Mesociclo:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {percentages.map((item) => {
                const targetKg = Math.round(current1RM * item.pct * 10) / 10;
                return (
                  <div
                    key={item.label}
                    className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2 text-center"
                  >
                    <span className="text-[11px] font-mono font-black block text-zinc-300">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-mono font-black"
                      style={{ color: accentColor }}
                    >
                      {targetKg} kg
                    </span>
                    <span className="text-[9px] text-zinc-400 block truncate mt-0.5">
                      {item.reps}
                    </span>
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
