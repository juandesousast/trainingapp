"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
  RotateCcw,
  Sparkles,
  Scale,
  Calendar,
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

export const SupplementsView: React.FC = () => {
  const { activeProfile, authUserId } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const { entries } = useBiometricsStore();

  const {
    dailyLogs,
    waterIntakeLiters,
    isTrainingDayOverride,
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

  // Determinar si hoy es día de entrenamiento (Lunes, Miércoles, Viernes)
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

  // 4 Bloques requeridos
  const breakfastItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "breakfast");
  const workoutItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "workout");
  const lunchItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "lunch");
  const nightItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "night");

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(new Date());
  }, []);

  const renderSupplementRow = (item: SupplementItem) => {
    const isTaken = Boolean(dailyLogs[item.id]);
    const Icon = ICONS_MAP[item.iconName] || Pill;

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
          "w-full min-h-[58px] p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.98]",
          isTaken
            ? "bg-zinc-950/70 border-zinc-800"
            : "bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700"
        )}
        style={{
          borderColor: isTaken ? `${accentColor}40` : undefined,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm"
            style={{
              backgroundColor: isTaken ? `${accentColor}20` : "#27272A",
              color: isTaken ? accentColor : "#A1A1AA",
            }}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold transition-colors leading-tight",
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
            <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-1">
              {item.notes}
            </p>
          </div>
        </div>

        {/* Checkbox táctil */}
        <button
          type="button"
          aria-label={`Marcar ${item.name}`}
          className={cn(
            "w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 active:scale-90",
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
    <div className="max-w-md mx-auto px-4 pt-4 pb-36 space-y-6">
      {/* 1. Header Hero Dark Kinetic */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 border bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 shadow-2xl backdrop-blur-xl"
        style={{
          borderColor: `${accentColor}40`,
          boxShadow: `0 10px 40px -15px ${accentColor}25`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black tracking-widest text-zinc-400 uppercase block">
                HOPLITA OS · STACK DIARIO
              </span>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                <span>{isTrainingDay ? "Día de Entrenamiento" : "Día de Descanso"}</span>
                <span
                  className="w-2 h-2 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: accentColor }}
                />
              </h1>
              <p className="text-[11px] font-mono text-zinc-400 capitalize mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>{todayFormatted}</span>
              </p>
            </div>
          </div>

          {/* Toggle Día de Entreno / Descanso */}
          <button
            type="button"
            onClick={() => setTrainingDayOverride(!isTrainingDay)}
            title="Alternar entre protocolo de entreno y descanso"
            className="min-h-[38px] px-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>{isTrainingDay ? "⚡ Entreno" : "💤 Descanso"}</span>
          </button>
        </div>

        {/* Barra de progreso de adherencia */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400">Adherencia del Protocolo</span>
            <span className="font-bold text-white tabular-nums">
              {takenSupplementsCount} / {totalSupplements} tomas ({adherencePct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${adherencePct}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* 2. Métricas Dinámicas Personalizadas por Peso */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tarjeta Creatina */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Creatina (0.05g/kg)
            </span>
            <Zap className="w-3.5 h-3.5" style={{ color: accentColor }} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
              {creatineGrams.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-zinc-400">gramos</span>
          </div>
          <span className="text-[10px] text-zinc-400 block truncate">
            Base: {currentWeightKg.toFixed(1)} kg de peso
          </span>
        </div>

        {/* Tarjeta Hidratación */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Meta Hidratación
            </span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
              {targetWaterLiters.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-zinc-400">litros/día</span>
          </div>
          <span className="text-[10px] text-zinc-400 block truncate">
            35ml/kg {isTrainingDay ? "+ 0.5L entreno" : ""}
          </span>
        </div>
      </div>

      {/* 3. Módulo de Registro de Hidratación */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-tight text-white block">
                Agua Ingerida Hoy
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {waterIntakeLiters.toFixed(2)} L de {targetWaterLiters.toFixed(1)} L ({waterProgressPct}%)
              </span>
            </div>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (authUserId) addWater(authUserId, 0.25, targetWaterLiters);
              }}
              className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
            >
              +250ml
            </button>
            <button
              onClick={() => {
                if (authUserId) addWater(authUserId, 0.5, targetWaterLiters);
              }}
              className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
            >
              +500ml
            </button>
            <button
              onClick={() => {
                if (authUserId) resetWater(authUserId);
              }}
              aria-label="Resetear agua"
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de progreso de agua */}
        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${waterProgressPct}%` }}
          />
        </div>
      </div>

      {/* 4. BLOQUE 1: Desayuno */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              1. Desayuno / Mañana
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Con fuente de grasa</span>
        </div>
        <div className="space-y-2">
          {breakfastItems.map(renderSupplementRow)}
        </div>
      </div>

      {/* 5. BLOQUE 2: Pre / Post-Entreno */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              2. Pre / Post-Entreno
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {isTrainingDay ? "Vasodilatación y flujo" : "Mantenimiento endotelial"}
          </span>
        </div>
        <div className="space-y-2">
          {workoutItems.map(renderSupplementRow)}
        </div>
      </div>

      {/* 6. BLOQUE 3: Comida o Merienda */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              3. Comida o Merienda
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Saturación y proteína</span>
        </div>
        <div className="space-y-2">
          {lunchItems.map(renderSupplementRow)}
        </div>
      </div>

      {/* 7. BLOQUE 4: Noche / Antes de Dormir */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              4. Noche / Antes de Dormir
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">30-45 min antes de dormir</span>
        </div>
        <div className="space-y-2">
          {nightItems.map(renderSupplementRow)}
        </div>
      </div>
    </div>
  );
};
