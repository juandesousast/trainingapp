"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Sun,
  Flame,
  Zap,
  Utensils,
  Moon,
  Droplets,
  Check,
  Plus,
  Minus,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useSupplementStore, SUPPLEMENT_CATALOG, SupplementItem } from "@/stores/useSupplementStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { cn } from "@/lib/utils";

const ICONS_MAP: Record<string, React.ElementType> = {
  Sun,
  Flame,
  Zap,
  Utensils,
  Moon,
};

export const SupplementProtocolCard: React.FC = () => {
  const { activeProfile, authUserId } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const { entries } = useBiometricsStore();

  const {
    dailyLogs,
    waterIntakeLiters,
    isTrainingDayOverride,
    isExpanded,
    toggleExpanded,
    setTrainingDayOverride,
    fetchTodayLogs,
    toggleSupplementTaken,
    addWater,
    resetWater,
  } = useSupplementStore();

  // Cargar registros al montar o cuando cambie el usuario
  useEffect(() => {
    if (authUserId) {
      fetchTodayLogs(authUserId);
    }
  }, [authUserId, fetchTodayLogs]);

  // Obtener peso más reciente del usuario
  const latestBiometric = entries && entries.length > 0 ? entries[entries.length - 1] : null;
  const currentWeightKg = useMemo(() => {
    if (latestBiometric?.weightKg) return latestBiometric.weightKg;
    if (activeProfile.targetWeightKg) return Number(activeProfile.targetWeightKg);
    return activeProfile.role === "hoplita_girl" || activeProfile.gender === "female" ? 60 : 80;
  }, [latestBiometric, activeProfile]);

  // Determinar si hoy es día de entrenamiento
  // Por calendario BIIO: Lunes (1), Miércoles (3), Viernes (5)
  const isTrainingDay = useMemo(() => {
    if (isTrainingDayOverride !== null) return isTrainingDayOverride;
    const day = new Date().getDay();
    return day === 1 || day === 3 || day === 5;
  }, [isTrainingDayOverride]);

  // Cálculos dinámicos
  const creatineGrams = useMemo(() => {
    return Math.round(currentWeightKg * 0.05 * 10) / 10;
  }, [currentWeightKg]);

  const targetWaterLiters = useMemo(() => {
    const raw = currentWeightKg * 0.035 + (isTrainingDay ? 0.5 : 0);
    return Number(raw.toFixed(1));
  }, [currentWeightKg, isTrainingDay]);

  const waterProgressPct = Math.min(100, Math.round((waterIntakeLiters / targetWaterLiters) * 100));

  // Conteo de adherencia
  const totalSupplements = SUPPLEMENT_CATALOG.length;
  const takenSupplementsCount = SUPPLEMENT_CATALOG.filter((item) => dailyLogs[item.id]).length;
  const adherencePct = Math.round((takenSupplementsCount / totalSupplements) * 100);

  // Agrupación por momentos del día
  const morningItems = SUPPLEMENT_CATALOG.filter((item) => item.timing === "morning");
  const afternoonItems = SUPPLEMENT_CATALOG.filter((item) => item.timing === "afternoon");
  const nightItems = SUPPLEMENT_CATALOG.filter((item) => item.timing === "night");

  const renderSupplementRow = (item: SupplementItem) => {
    const isTaken = Boolean(dailyLogs[item.id]);
    const Icon = ICONS_MAP[item.iconName] || Pill;

    // Calcular dosis dinámica si aplica
    let doseText = item.baseDose;
    if (item.id === "creatine") {
      doseText = `${creatineGrams.toFixed(1)} g`;
    } else if (item.getDynamicDose) {
      doseText = item.getDynamicDose(currentWeightKg, isTrainingDay);
    }

    return (
      <div
        key={item.id}
        onClick={() => {
          if (authUserId) toggleSupplementTaken(authUserId, item.id);
        }}
        className={cn(
          "w-full min-h-[52px] px-3.5 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.98]",
          isTaken
            ? "bg-zinc-950/70 border-zinc-800"
            : "bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700"
        )}
        style={{
          borderColor: isTaken ? `${accentColor}40` : undefined,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: isTaken ? `${accentColor}20` : "#27272A",
              color: isTaken ? accentColor : "#A1A1AA",
            }}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "text-xs font-bold transition-colors leading-tight",
                  isTaken ? "text-zinc-400 line-through" : "text-zinc-100"
                )}
              >
                {item.name}
              </span>
              <span
                className="text-[11px] font-mono tabular-nums font-black px-1.5 py-0.5 rounded-md leading-none shrink-0"
                style={{
                  backgroundColor: `${accentColor}18`,
                  color: accentColor,
                }}
              >
                {doseText}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">
              {item.notes}
            </p>
          </div>
        </div>

        {/* Checkbox táctil */}
        <button
          type="button"
          aria-label={`Marcar ${item.name}`}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 active:scale-90",
            isTaken
              ? "text-black shadow-md"
              : "bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-700"
          )}
          style={{
            backgroundColor: isTaken ? accentColor : undefined,
            borderColor: isTaken ? accentColor : undefined,
          }}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    );
  };

  return (
    <div
      className="rounded-3xl border bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: `${accentColor}35`,
        boxShadow: `0 10px 30px -15px ${accentColor}18`,
      }}
    >
      {/* Cabecera de la Tarjeta */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div
            onClick={toggleExpanded}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 group"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-md"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <Pill className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-zinc-400 uppercase">
                  PROTOCOLO DE SUPLEMENTACIÓN
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                <span>{isTrainingDay ? "Día de Entrenamiento" : "Día de Descanso"}</span>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: accentColor }}
                />
              </h3>
            </div>
          </div>

          {/* Toggle manual de día (Entreno / Descanso) y adherencia */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTrainingDayOverride(!isTrainingDay)}
              title="Cambiar entre día de entreno y descanso"
              className="min-h-[36px] px-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 transition-all active:scale-95 flex items-center gap-1"
            >
              <span>{isTrainingDay ? "⚡ Entreno" : "💤 Descanso"}</span>
            </button>

            <button
              type="button"
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Colapsar protocolo" : "Expandir protocolo"}
              className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Barra de progreso de adherencia compacta */}
        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Adherencia hoy:</span>
            <span className="font-bold text-zinc-200 tabular-nums">
              {takenSupplementsCount} de {totalSupplements} tomas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${adherencePct}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <span
              className="text-[10px] font-black tabular-nums"
              style={{ color: adherencePct === 100 ? "#10B981" : accentColor }}
            >
              {adherencePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Contenido Desplegable */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 space-y-4">
              {/* 1. Mañana / Desayuno */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. Mañana · Desayuno</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    Con grasas saludables
                  </span>
                </div>
                <div className="space-y-1.5">
                  {morningItems.map(renderSupplementRow)}
                </div>
              </div>

              {/* 2. Comida o Merienda */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-blue-400" />
                    <span>2. Comida o Merienda</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 tabular-nums">
                    Base: {currentWeightKg} kg
                  </span>
                </div>
                <div className="space-y-1.5">
                  {afternoonItems.map(renderSupplementRow)}
                </div>
              </div>

              {/* 3. Noche / Antes de Dormir */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3. Noche · Antes de Dormir</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    30-45 min antes
                  </span>
                </div>
                <div className="space-y-1.5">
                  {nightItems.map(renderSupplementRow)}
                </div>
              </div>

              {/* 4. Meta de Hidratación Diaria */}
              <div className="pt-2">
                <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                      >
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-300 block">
                          4. Meta de Hidratación
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {isTrainingDay ? "35 ml/kg + 0.5L entreno" : "35 ml/kg peso corporal"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-white tabular-nums">
                        <span style={{ color: accentColor }}>{waterIntakeLiters.toFixed(2)}</span>
                        <span className="text-zinc-400 text-xs"> / {targetWaterLiters.toFixed(1)} L</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                        {waterProgressPct}% completado
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso de Agua */}
                  <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${waterProgressPct}%`,
                        backgroundColor: accentColor,
                        boxShadow: `0 0 10px ${accentColor}80`,
                      }}
                    />
                  </div>

                  {/* Controles rápidos de hidratación */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (authUserId) addWater(authUserId, 0.25, targetWaterLiters);
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold text-zinc-200 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-cyan-400" />
                        <span>250 ml</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (authUserId) addWater(authUserId, 0.5, targetWaterLiters);
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold text-zinc-200 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-cyan-400" />
                        <span>500 ml</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (authUserId) addWater(authUserId, -0.25, targetWaterLiters);
                        }}
                        disabled={waterIntakeLiters <= 0}
                        title="Restar 250ml"
                        className="min-h-[38px] w-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (authUserId) resetWater(authUserId);
                        }}
                        title="Reiniciar contador de agua"
                        className="min-h-[38px] w-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold text-zinc-400 hover:text-red-400 active:scale-95 transition-all flex items-center justify-center"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
