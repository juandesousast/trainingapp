"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Pill,
  Sun,
  Flame,
  Zap,
  Moon,
  Droplets,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  ChevronDown,
  Info,
  Beef,
  Wheat,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  useSupplementStore,
  SUPPLEMENT_CATALOG,
  SupplementItem,
} from "@/stores/useSupplementStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { calculateNutritionPlan, MealPortion } from "@/lib/nutrition-engine";
import { cn } from "@/lib/utils";

const ICONS_MAP: Record<string, React.ElementType> = {
  Sun,
  Flame,
  Zap,
  Utensils,
  Moon,
};

export const NutritionView: React.FC = () => {
  const { activeProfile, authUserId } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const isFemale = activeProfile.role === "hoplita_girl" || activeProfile.gender === "female";
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

  // Acordeón de comidas (abierto por defecto la primera comida)
  const [expandedMeal, setExpandedMeal] = useState<string | null>("meal_1");

  // Cargar registros al montar o cuando cambie el usuario
  useEffect(() => {
    if (authUserId) {
      fetchTodayLogs(authUserId);
    }
  }, [authUserId, fetchTodayLogs]);

  // Obtener métricas corporales más recientes del usuario
  const latestBiometric = entries && entries.length > 0 ? entries[entries.length - 1] : null;

  const currentWeightKg = useMemo(() => {
    if (latestBiometric?.weightKg) return latestBiometric.weightKg;
    if (activeProfile.targetWeightKg) return Number(activeProfile.targetWeightKg);
    return isFemale ? 60.0 : 82.15;
  }, [latestBiometric, activeProfile, isFemale]);

  const currentBodyFatPct = useMemo(() => {
    if (latestBiometric?.bodyFatPct) return latestBiometric.bodyFatPct;
    return isFemale ? 22.0 : 25.6;
  }, [latestBiometric, isFemale]);

  const targetBodyFatPct = useMemo(() => {
    if (activeProfile.targetBodyFatPct) return Number(activeProfile.targetBodyFatPct);
    return isFemale ? 21.0 : 16.0;
  }, [activeProfile, isFemale]);

  // Determinar si hoy es día de entrenamiento (Lunes, Miércoles, Viernes por defecto)
  const isTrainingDay = useMemo(() => {
    if (isTrainingDayOverride !== null) return isTrainingDayOverride;
    const day = new Date().getDay();
    return day === 1 || day === 3 || day === 5;
  }, [isTrainingDayOverride]);

  // Ejecutar el motor metabólico dinámico
  const plan = useMemo(() => {
    return calculateNutritionPlan({
      weightKg: currentWeightKg,
      bodyFatPct: currentBodyFatPct,
      targetBodyFatPct: targetBodyFatPct,
      isTrainingDay,
    });
  }, [currentWeightKg, currentBodyFatPct, targetBodyFatPct, isTrainingDay]);

  // Cálculos dinámicos de suplementación e hidratación
  const creatineGrams = useMemo(() => {
    return Math.round(currentWeightKg * 0.05 * 10) / 10;
  }, [currentWeightKg]);

  const targetWaterLiters = useMemo(() => {
    const raw = currentWeightKg * 0.035 + (isTrainingDay ? 0.5 : 0);
    return Number(raw.toFixed(1));
  }, [currentWeightKg, isTrainingDay]);

  const waterProgressPct = Math.min(100, Math.round((waterIntakeLiters / targetWaterLiters) * 100));

  // Conteo de adherencia de suplementos
  const totalSupplements = SUPPLEMENT_CATALOG.length;
  const takenSupplementsCount = SUPPLEMENT_CATALOG.filter((item) => dailyLogs[item.id]).length;
  const adherencePct = Math.round((takenSupplementsCount / totalSupplements) * 100);

  // 4 Bloques de suplementos
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

  const toggleMealExpand = (id: string) => {
    setExpandedMeal((prev) => (prev === id ? null : id));
  };

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
          "w-full min-h-[56px] p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.98]",
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
      {/* 1. HEADER HERO: Dark Kinetic */}
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
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black tracking-widest text-zinc-400 uppercase block">
                HOPLITA OS · NUTRICIÓN BIIO
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

        {/* Indicador de fase y balance metabólico */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: plan.isDeficitPhase ? "#F59E0B" : "#10B981" }}
            />
            <span className="font-bold text-zinc-300">
              {plan.isDeficitPhase ? "Déficit -18% · Fase de Definición" : "Normocalórica · Mantenimiento"}
            </span>
          </div>
          <span className="text-zinc-500">
            BMR: <strong className="text-zinc-300 tabular-nums">{plan.bmr}</strong> kcal
          </span>
        </div>
      </motion.div>

      {/* 2. DASHBOARD DE MACROS & CALORÍAS OBJETIVO */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-baseline justify-between border-b border-zinc-800/70 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Presupuesto Energético Diario
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black tabular-nums text-white">
                {plan.targetCalories.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                kcal
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] space-y-0.5">
            <div className="text-zinc-400">
              TDEE: <strong className="text-white tabular-nums">{plan.tdee}</strong> kcal
            </div>
            <div className="text-zinc-400">
              LBM: <strong className="text-white tabular-nums">{plan.lbmKg}</strong> kg ({currentBodyFatPct}% grasa)
            </div>
          </div>
        </div>

        {/* Barras de distribución de 3 Macros */}
        <div className="space-y-3">
          {/* Proteína */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="font-bold text-white">Proteína</span>
                <span className="text-[10px] text-zinc-400">(2.2g/kg LBM)</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.proteinGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.proteinKcal} kcal · {plan.proteinPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-white">Carbohidratos</span>
                <span className="text-[10px] text-zinc-400">
                  {isTrainingDay ? "(Demanda Glucolítica)" : "(Ciclado Ligero)"}
                </span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.carbGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.carbKcal} kcal · {plan.carbPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.carbPct}%` }}
              />
            </div>
          </div>

          {/* Grasas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-bold text-white">Grasas Saludables</span>
                <span className="text-[10px] text-zinc-400">(0.9g/kg Peso)</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.fatGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.fatKcal} kcal · {plan.fatPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.fatPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESGLOSE DE 4 COMIDAS (ACORDEÓN TÁCTIL) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              Estructura de 4 Comidas y Porciones
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {isTrainingDay ? "Timing Peri-Entreno" : "Distribución Estable"}
          </span>
        </div>

        <div className="space-y-2.5">
          {plan.meals.map((meal) => {
            const isExpanded = expandedMeal === meal.id;

            return (
              <div
                key={meal.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden transition-all duration-200"
              >
                {/* Cabecera del Acordeón */}
                <button
                  type="button"
                  onClick={() => toggleMealExpand(meal.id)}
                  className="w-full p-3.5 flex items-center justify-between gap-2.5 text-left active:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-tight">
                        {meal.name}: {meal.subtitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-400">
                      <span>{meal.timing}</span>
                      <span>·</span>
                      <span className="font-bold text-zinc-200 tabular-nums">
                        {meal.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Micro pills de macros */}
                    <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                        {meal.proteinGrams}P
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                        {meal.carbGrams}C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                        {meal.fatGrams}G
                      </span>
                    </div>

                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 transition-transform duration-200",
                        isExpanded ? "rotate-180 text-white" : ""
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Contenido desplegable */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/60 space-y-3">
                        {/* Macro badges para móvil */}
                        <div className="grid grid-cols-3 gap-2 text-center font-mono">
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Proteína ({meal.proteinPct}%)
                            </span>
                            <span className="text-base font-black text-cyan-400 tabular-nums">
                              {meal.proteinGrams}g
                            </span>
                          </div>
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Carbos ({meal.carbPct}%)
                            </span>
                            <span className="text-base font-black text-amber-400 tabular-nums">
                              {meal.carbGrams}g
                            </span>
                          </div>
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Grasas ({meal.fatPct}%)
                            </span>
                            <span className="text-base font-black text-rose-400 tabular-nums">
                              {meal.fatGrams}g
                            </span>
                          </div>
                        </div>

                        {/* Sugerencias prácticas de fuentes limpias */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 space-y-2 text-[11px]">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                            Fuentes Óptimas Sugeridas
                          </span>

                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 font-mono font-bold shrink-0">P:</span>
                              <span className="text-zinc-300 leading-tight">
                                {meal.suggestions.protein}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-amber-400 font-mono font-bold shrink-0">C:</span>
                              <span className="text-zinc-300 leading-tight">
                                {meal.suggestions.carbs}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-rose-400 font-mono font-bold shrink-0">G:</span>
                              <span className="text-zinc-300 leading-tight">
                                {meal.suggestions.fats}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BLOQUE INFERIOR DE SUPLEMENTACIÓN & HIDRATACIÓN */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              Protocolo de Suplementación & Agua
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {takenSupplementsCount}/{totalSupplements} tomas ({adherencePct}%)
          </span>
        </div>

        {/* Tarjetas Dinámicas de Creatina e Hidratación */}
        <div className="grid grid-cols-2 gap-2.5">
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
              Base: {currentWeightKg.toFixed(1)} kg
            </span>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Meta Agua
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

        {/* Módulo Interactivo de Hidratación */}
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

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (authUserId) addWater(authUserId, 0.25, targetWaterLiters);
                }}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => {
                  if (authUserId) addWater(authUserId, 0.5, targetWaterLiters);
                }}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
              >
                +500ml
              </button>
              <button
                type="button"
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

          <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${waterProgressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Bloques del Catálogo de Suplementación */}
        {/* Bloque 1: Desayuno */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                1. Desayuno / Mañana
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Con fuente de grasa</span>
          </div>
          <div className="space-y-2">{breakfastItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 2: Pre / Post-Entreno */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                2. Pre / Post-Entreno
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {isTrainingDay ? "Vasodilatación y flujo" : "Mantenimiento endotelial"}
            </span>
          </div>
          <div className="space-y-2">{workoutItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 3: Comida o Merienda */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: accentColor }} />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                3. Comida o Merienda
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Saturación y proteína</span>
          </div>
          <div className="space-y-2">{lunchItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 4: Noche */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                4. Noche / Antes de Dormir
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">30-45 min antes de dormir</span>
          </div>
          <div className="space-y-2">{nightItems.map(renderSupplementRow)}</div>
        </div>
      </div>
    </div>
  );
};
