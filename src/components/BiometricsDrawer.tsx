"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { Scale, Check, X, Sparkles } from "lucide-react";

interface BiometricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricsDrawer: React.FC<BiometricsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { addBiometricEntry } = useBiometricsStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  // Valores iniciales basados en la medición en ayunas
  const [weightKg, setWeightKg] = useState("82.15");
  const [bmi, setBmi] = useState("25.4");
  const [bodyFatPct, setBodyFatPct] = useState("25.6");
  const [subcutaneousFatPct, setSubcutaneousFatPct] = useState("22.8");
  const [visceralFatRating, setVisceralFatRating] = useState("8");
  const [muscleMassKg, setMuscleMassKg] = useState("58.08");
  const [skeletalMusclePct, setSkeletalMusclePct] = useState("47.9");
  const [fatFreeMassKg, setFatFreeMassKg] = useState("61.12");
  const [boneMassKg, setBoneMassKg] = useState("3.04");
  const [bmrKcal, setBmrKcal] = useState("1683");
  const [bodyWaterPct, setBodyWaterPct] = useState("53.7");
  const [proteinPct, setProteinPct] = useState("17.0");
  const [waistCircumferenceCm, setWaistCircumferenceCm] = useState("89");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addBiometricEntry({
      profileId: activeProfile.id,
      date: `Medición ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`,
      weightKg: parseFloat(weightKg) || 82,
      bmi: parseFloat(bmi) || 25,
      bodyFatPct: parseFloat(bodyFatPct) || 25,
      subcutaneousFatPct: parseFloat(subcutaneousFatPct) || 22,
      visceralFatRating: parseFloat(visceralFatRating) || 8,
      muscleMassKg: parseFloat(muscleMassKg) || 58,
      skeletalMusclePct: parseFloat(skeletalMusclePct) || 47,
      fatFreeMassKg: parseFloat(fatFreeMassKg) || 61,
      boneMassKg: parseFloat(boneMassKg) || 3,
      bmrKcal: parseInt(bmrKcal) || 1680,
      bodyWaterPct: parseFloat(bodyWaterPct) || 53,
      proteinPct: parseFloat(proteinPct) || 17,
      metabolicAge: 35,
      waistCircumferenceCm: parseFloat(waistCircumferenceCm) || 88,
    });

    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] px-6 pt-5 pb-6 max-w-md mx-auto outline-none max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Pesaje Matutino en Ayunas
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
            Registra los 12 parámetros de la báscula inteligente para monitorear la recomposición corporal hacia el 16% de grasa.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Peso e IMC */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Peso Total (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-black text-lg focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  IMC
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-black text-lg focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Grasas: Total, Subcutánea, Visceral */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Grasa Total
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-black text-base focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Subcutánea
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={subcutaneousFatPct}
                  onChange={(e) => setSubcutaneousFatPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-black text-base focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Grasa Visceral
                </label>
                <input
                  type="number"
                  step="1"
                  value={visceralFatRating}
                  onChange={(e) => setVisceralFatRating(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-black text-base focus:outline-none"
                />
              </div>
            </div>

            {/* Masa Muscular y Músculo Esquelético */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Masa Muscular (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={muscleMassKg}
                  onChange={(e) => setMuscleMassKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono font-black text-lg focus:outline-none"
                  style={{ color: accentColor }}
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Músculo Esq.
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={skeletalMusclePct}
                  onChange={(e) => setSkeletalMusclePct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-black text-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Masa Libre de Grasa, TMB y Ósea */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Sin Grasa (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={fatFreeMassKg}
                  onChange={(e) => setFatFreeMassKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  TMB (kcal)
                </label>
                <input
                  type="number"
                  step="1"
                  value={bmrKcal}
                  onChange={(e) => setBmrKcal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Masa Ósea (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={boneMassKg}
                  onChange={(e) => setBoneMassKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Agua, Proteína y Cintura */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Agua
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyWaterPct}
                  onChange={(e) => setBodyWaterPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Proteína
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinPct}
                  onChange={(e) => setProteinPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCircumferenceCm}
                  onChange={(e) => setWaistCircumferenceCm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Guardar Medición Matutina</span>
            </button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
