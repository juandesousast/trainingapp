"use client";

import React, { useState, useEffect } from "react";
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
  const { entries, addBiometricEntry } = useBiometricsStore();
  const { activeProfile, updateProfileGoals } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const isFemale = activeProfile.gender === "female" || activeProfile.role === "hoplita_girl";

  const latest = entries && entries.length > 0 ? entries[entries.length - 1] : null;

  // Altura requerida si no está configurada en perfil
  const [heightCm, setHeightCm] = useState(
    activeProfile.heightCm ? String(activeProfile.heightCm) : ""
  );
  const [heightError, setHeightError] = useState(false);

  // Valores iniciales
  const [weightKg, setWeightKg] = useState(isFemale ? "60.0" : "82.15");
  const [bmi, setBmi] = useState(isFemale ? "22.0" : "25.4");
  const [bodyFatPct, setBodyFatPct] = useState(isFemale ? "22.0" : "25.6");
  const [subcutaneousFatPct, setSubcutaneousFatPct] = useState(isFemale ? "19.5" : "22.8");
  const [visceralFatRating, setVisceralFatRating] = useState(isFemale ? "4" : "8");
  const [muscleMassKg, setMuscleMassKg] = useState(isFemale ? "44.0" : "58.08");
  const [skeletalMusclePct, setSkeletalMusclePct] = useState(isFemale ? "42.0" : "47.9");
  const [fatFreeMassKg, setFatFreeMassKg] = useState(isFemale ? "46.8" : "61.12");
  const [boneMassKg, setBoneMassKg] = useState(isFemale ? "2.5" : "3.04");
  const [bmrKcal, setBmrKcal] = useState(isFemale ? "1350" : "1683");
  const [bodyWaterPct, setBodyWaterPct] = useState(isFemale ? "55.0" : "53.7");
  const [proteinPct, setProteinPct] = useState(isFemale ? "16.5" : "17.0");

  // Perímetros corporales (antropometría)
  const [showPerimeters, setShowPerimeters] = useState(false);
  const [waistCm, setWaistCm] = useState(isFemale ? "68" : "89");
  const [neckCm, setNeckCm] = useState(isFemale ? "33" : "39");
  const [chestCm, setChestCm] = useState(isFemale ? "88" : "104");
  const [armCm, setArmCm] = useState(isFemale ? "27" : "37");
  const [thighCm, setThighCm] = useState(isFemale ? "54" : "59");
  const [hipCm, setHipCm] = useState(isFemale ? "96" : "101");

  // Sincronizar con el último registro existente o baseline del usuario al abrir
  useEffect(() => {
    if (isOpen) {
      if (latest) {
        setWeightKg(String(latest.weightKg));
        setBmi(String(latest.bmi));
        setBodyFatPct(String(latest.bodyFatPct));
        setSubcutaneousFatPct(String(latest.subcutaneousFatPct));
        setVisceralFatRating(String(latest.visceralFatRating));
        setMuscleMassKg(String(latest.muscleMassKg));
        setSkeletalMusclePct(String(latest.skeletalMusclePct));
        setFatFreeMassKg(String(latest.fatFreeMassKg));
        setBoneMassKg(String(latest.boneMassKg));
        setBmrKcal(String(latest.bmrKcal));
        setBodyWaterPct(String(latest.bodyWaterPct));
        setProteinPct(String(latest.proteinPct));
        if (latest.waistCircumferenceCm) setWaistCm(String(latest.waistCircumferenceCm));
        if (latest.neckCm) setNeckCm(String(latest.neckCm));
        if (latest.chestCm) setChestCm(String(latest.chestCm));
        if (latest.armCm) setArmCm(String(latest.armCm));
        if (latest.thighCm) setThighCm(String(latest.thighCm));
        if (latest.hipCm) setHipCm(String(latest.hipCm));
      } else {
        if (isFemale) {
          setWeightKg("60.0");
          setBmi("22.0");
          setBodyFatPct("22.0");
          setSubcutaneousFatPct("19.5");
          setVisceralFatRating("4");
          setMuscleMassKg("44.0");
          setSkeletalMusclePct("42.0");
          setFatFreeMassKg("46.8");
          setBoneMassKg("2.5");
          setBmrKcal("1350");
          setBodyWaterPct("55.0");
          setProteinPct("16.5");
          setWaistCm("68");
          setNeckCm("33");
          setChestCm("88");
          setArmCm("27");
          setThighCm("54");
          setHipCm("96");
        } else {
          setWeightKg("82.15");
          setBmi("25.4");
          setBodyFatPct("25.6");
          setSubcutaneousFatPct("22.8");
          setVisceralFatRating("8");
          setMuscleMassKg("58.08");
          setSkeletalMusclePct("47.9");
          setFatFreeMassKg("61.12");
          setBoneMassKg("3.04");
          setBmrKcal("1683");
          setBodyWaterPct("53.7");
          setProteinPct("17.0");
          setWaistCm("89");
          setNeckCm("39");
          setChestCm("104");
          setArmCm("37");
          setThighCm("59");
          setHipCm("101");
        }
      }

      if (activeProfile.heightCm) {
        setHeightCm(String(activeProfile.heightCm));
      } else {
        setHeightCm("");
      }
      setHeightError(false);
    }
  }, [isOpen, latest, isFemale, activeProfile.heightCm]);

  // Badges clínicos de salud en tiempo real
  const bmiBadge = getBMIBadge(parseFloat(bmi) || 0);
  const fatBadge = getBodyFatBadge(parseFloat(bodyFatPct) || 0, activeProfile.gender);
  const visceralBadge = getVisceralFatBadge(parseFloat(visceralFatRating) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar altura obligatoria si no existe previamente
    const parsedHeight = parseFloat(heightCm);
    if (!activeProfile.heightCm && (!parsedHeight || parsedHeight < 100 || parsedHeight > 250)) {
      setHeightError(true);
      return;
    }

    // Persistir altura en perfil si se ha ingresado/modificado
    if (parsedHeight && parsedHeight !== activeProfile.heightCm) {
      await updateProfileGoals(
        activeProfile.targetBodyFatPct,
        activeProfile.targetWeightKg,
        parsedHeight
      );
    }

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
        <Drawer.Content className="max-h-[90dvh] flex flex-col rounded-t-[28px] border-t border-zinc-800 bg-zinc-950 p-0 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none overflow-hidden">
          {/* Handle superior visible */}
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto my-3 shrink-0" />

          {/* Header fijo superior */}
          <div className="px-5 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" style={{ color: accentColor }} />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Pesaje Matutino en Ayunas
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
              Registra los parámetros de la báscula y perímetros corporales para <strong className="text-zinc-200">{activeProfile.displayName}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8 overscroll-contain touch-pan-y space-y-3.5">
            {/* Si el usuario no tiene altura configurada: Input Obligatorio de Altura */}
            {!activeProfile.heightCm && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-amber-400" />
                    Altura (cm) *
                  </label>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Obligatorio
                  </span>
                </div>
                <input
                  type="number"
                  step="1"
                  min="100"
                  max="250"
                  required
                  placeholder="ej. 165"
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(e.target.value);
                    if (heightError) setHeightError(false);
                    const h = parseFloat(e.target.value);
                    const w = parseFloat(weightKg);
                    if (h > 100 && w > 30) {
                      setBmi((w / ((h / 100) ** 2)).toFixed(1));
                    }
                  }}
                  className={cn(
                    "w-full bg-zinc-950 border rounded-xl px-3 py-2 text-white font-mono font-black text-base focus:outline-none transition-colors",
                    heightError
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/50 focus:border-amber-400"
                  )}
                />
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Necesaria para calibrar tu IMC y composición corporal. Se guardará en tu perfil.
                </p>
                {heightError && (
                  <p className="text-[10px] text-red-400 font-bold font-mono">
                    Por favor introduce una altura válida (ej. 165 cm).
                  </p>
                )}
              </div>
            )}

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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
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
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 font-mono font-bold text-base focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra Inferior Fija de Acción (Sticky Bottom con Safe Area) */}
            <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-md px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] border-t border-zinc-900 shrink-0">
              <button
                type="submit"
                className="w-full min-h-[50px] py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95"
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
