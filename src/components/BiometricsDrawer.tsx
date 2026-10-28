"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { getBMIBadge, getBodyFatBadge, getVisceralFatBadge } from "@/lib/healthBadges";
import { Scale, Check, X, Ruler, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isFemale = activeProfile.gender === "female";

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

  // Perímetros corporales (antropometría)
  const [showPerimeters, setShowPerimeters] = useState(false);
  const [waistCm, setWaistCm] = useState("89");
  const [neckCm, setNeckCm] = useState("39");
  const [chestCm, setChestCm] = useState("104");
  const [armCm, setArmCm] = useState("37");
  const [thighCm, setThighCm] = useState("59");
  const [hipCm, setHipCm] = useState(isFemale ? "98" : "101");

  // Badges clínicos de salud en tiempo real
  const bmiBadge = getBMIBadge(parseFloat(bmi) || 0);
  const fatBadge = getBodyFatBadge(parseFloat(bodyFatPct) || 0, activeProfile.gender);
  const visceralBadge = getVisceralFatBadge(parseFloat(visceralFatRating) || 0);

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
      waistCircumferenceCm: parseFloat(waistCm) || undefined,
      neckCm: parseFloat(neckCm) || undefined,
      chestCm: parseFloat(chestCm) || undefined,
      armCm: parseFloat(armCm) || undefined,
      thighCm: parseFloat(thighCm) || undefined,
      hipCm: parseFloat(hipCm) || undefined,
    });

    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] px-6 pt-5 pb-6 max-w-md mx-auto outline-none max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-2">
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

          <p className="text-xs text-zinc-400 mb-5">
            Registra los parámetros de la báscula y perímetros corporales para <strong className="text-zinc-200">{activeProfile.displayName}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* BLOQUE PRINCIPAL: Parámetros Clave con Badges de Salud */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Peso Total */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Peso Total (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-white font-mono font-black text-lg focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* IMC con Badge Clínico */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                    IMC
                  </label>
                  <span
                    className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border",
                      bmiBadge.bgClass,
                      bmiBadge.textClass,
                      bmiBadge.borderClass
                    )}
                  >
                    {bmiBadge.label}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-white font-mono font-black text-lg focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Grasas: Total, Subcutánea, Visceral con Badges */}
            <div className="grid grid-cols-3 gap-2">
              {/* % Grasa Total */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                    % Grasa
                  </label>
                  <span
                    className={cn(
                      "text-[7px] font-mono font-bold px-1 py-0.2 rounded border",
                      fatBadge.bgClass,
                      fatBadge.textClass,
                      fatBadge.borderClass
                    )}
                  >
                    {fatBadge.label}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-amber-400 font-mono font-black text-base focus:outline-none"
                />
              </div>

              {/* % Subcutánea */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Subcutánea
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={subcutaneousFatPct}
                  onChange={(e) => setSubcutaneousFatPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-zinc-200 font-mono font-black text-base focus:outline-none"
                />
              </div>

              {/* Grasa Visceral */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                    Visceral
                  </label>
                  <span
                    className={cn(
                      "text-[7px] font-mono font-bold px-1 py-0.2 rounded border",
                      visceralBadge.bgClass,
                      visceralBadge.textClass,
                      visceralBadge.borderClass
                    )}
                  >
                    {visceralBadge.label}
                  </span>
                </div>
                <input
                  type="number"
                  step="1"
                  value={visceralFatRating}
                  onChange={(e) => setVisceralFatRating(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-zinc-200 font-mono font-black text-base focus:outline-none"
                />
              </div>
            </div>

            {/* Masa Muscular y Músculo Esquelético */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  Masa Muscular (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={muscleMassKg}
                  onChange={(e) => setMuscleMassKg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1 font-mono font-black text-base focus:outline-none"
                  style={{ color: accentColor }}
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Músculo Esquelético
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={skeletalMusclePct}
                  onChange={(e) => setSkeletalMusclePct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1 text-white font-mono font-black text-base focus:outline-none"
                />
              </div>
            </div>

            {/* Masa Libre de Grasa, TMB y Masa Ósea */}
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Agua y Proteína */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                  % Agua Corporal
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyWaterPct}
                  onChange={(e) => setBodyWaterPct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-zinc-200 font-mono font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* SECCIÓN DESPLEGABLE: Perímetros Corporales (Opcional) */}
            <div className="border border-zinc-800 rounded-2xl bg-zinc-900/60 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowPerimeters(!showPerimeters)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-black text-zinc-200 block uppercase">
                      Perímetros Corporales (Opcional)
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Cintura, cadera, cuello, pecho, brazo y muslo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                  <span className="text-[10px] font-mono">{showPerimeters ? "Cerrar" : "Expandir"}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      showPerimeters && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {showPerimeters && (
                <div className="p-3 pt-1 border-t border-zinc-800/80 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {/* Cintura (waist_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                        Cintura (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={waistCm}
                        onChange={(e) => setWaistCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Cadera (hip_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          Cadera (cm)
                        </label>
                        {isFemale && (
                          <span
                            className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full text-black"
                            style={{ backgroundColor: accentColor }}
                          >
                            Clave
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        value={hipCm}
                        onChange={(e) => setHipCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Cuello (neck_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                        Cuello (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={neckCm}
                        onChange={(e) => setNeckCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Pecho (chest_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                        Pecho (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={chestCm}
                        onChange={(e) => setChestCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Brazo / Bíceps (arm_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                        Brazo / Bíceps (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={armCm}
                        onChange={(e) => setArmCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Muslo (thigh_cm) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                        Muslo (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={thighCm}
                        onChange={(e) => setThighCm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 pt-2 pb-1 bg-zinc-950/95 backdrop-blur-md">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Guardar Medición Matutina</span>
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
