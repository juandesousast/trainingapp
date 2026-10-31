"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import { useBiometricsStore, BiometricEntry } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { BiometricsDrawer } from "@/components/BiometricsDrawer";
import { getBMIBadge, getBodyFatBadge, getVisceralFatBadge } from "@/lib/healthBadges";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  Target,
  Activity,
  Ruler,
  Scale,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "all";
type MetricKey = "weight" | "bodyFat" | "muscle" | "waist";

interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  dataKey: "weightKg" | "bodyFatPct" | "muscleMassKg" | "waistCircumferenceCm";
  unit: string;
  targetValue?: number | null;
  color: string;
  gradientId: string;
}

export const RecompCharts: React.FC = () => {
  const { entries } = useBiometricsStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const isGirl = activeProfile.role === "hoplita_girl" || activeProfile.gender === "female";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("weight");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  // Métricas configuradas con soporte de línea de meta (Target Reference Line)
  const metricConfigs: Record<MetricKey, MetricConfig> = useMemo(() => ({
    weight: {
      key: "weight",
      label: "Peso Corporal",
      shortLabel: "Peso (kg)",
      dataKey: "weightKg",
      unit: "kg",
      targetValue: activeProfile.targetWeightKg ? Number(activeProfile.targetWeightKg) : (isGirl ? 60.0 : 72.8),
      color: accentColor,
      gradientId: "colorWeight",
    },
    bodyFat: {
      key: "bodyFat",
      label: "% Grasa Corporal",
      shortLabel: "% Grasa",
      dataKey: "bodyFatPct",
      unit: "%",
      targetValue: activeProfile.targetBodyFatPct ? Number(activeProfile.targetBodyFatPct) : (isGirl ? 21.0 : 16.0),
      color: "#F59E0B", // Ámbar
      gradientId: "colorBodyFat",
    },
    muscle: {
      key: "muscle",
      label: "Masa Muscular",
      shortLabel: "Músculo (kg)",
      dataKey: "muscleMassKg",
      unit: "kg",
      targetValue: null,
      color: "#38BDF8", // Sky / Cyan
      gradientId: "colorMuscle",
    },
    waist: {
      key: "waist",
      label: "Perímetro Cintura",
      shortLabel: "Cintura (cm)",
      dataKey: "waistCircumferenceCm",
      unit: "cm",
      targetValue: null,
      color: "#A855F7", // Purple
      gradientId: "colorWaist",
    },
  }), [activeProfile, accentColor, isGirl]);

  const activeMetricConfig = metricConfigs[selectedMetric];

  // 1. Agrupar y deduplicar por fecha (YYYY-MM-DD), prefiriendo toma en ayunas o la última del día
  const deduplicatedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const map = new Map<string, BiometricEntry>();
    entries.forEach((e) => {
      const dateKey = e.date.includes("T") ? e.date.split("T")[0] : e.date;
      const existing = map.get(dateKey);
      if (!existing) {
        map.set(dateKey, e);
      } else {
        // Si la nueva toma es en ayunas y la anterior no, sobrescribe
        if (e.isFasting && !existing.isFasting) {
          map.set(dateKey, e);
        } else if (e.isFasting === existing.isFasting) {
          map.set(dateKey, e);
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [entries]);

  // 2. Filtrar por rango temporal (7d, 30d, all)
  const filteredEntries = useMemo(() => {
    if (deduplicatedEntries.length === 0) return [];
    if (timeRange === "all") return deduplicatedEntries;

    const days = timeRange === "7d" ? 7 : 30;
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = deduplicatedEntries.filter((e) => {
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d >= cutoff;
    });

    // Si los registros son históricos antiguos y el filtro queda vacío, mostrar los últimos N
    if (filtered.length === 0) {
      return deduplicatedEntries.slice(-days);
    }
    return filtered;
  }, [deduplicatedEntries, timeRange]);

  // 3. Preparar puntos del gráfico con cálculo de delta respecto al punto previo
  const chartData = useMemo(() => {
    return filteredEntries.map((e, index) => {
      const prev = index > 0 ? filteredEntries[index - 1] : null;
      const rawVal = e[activeMetricConfig.dataKey];
      const val = rawVal !== undefined && rawVal !== null ? Number(rawVal) : null;

      const prevRaw = prev ? prev[activeMetricConfig.dataKey] : null;
      const prevVal = prevRaw !== undefined && prevRaw !== null ? Number(prevRaw) : null;

      const delta =
        val !== null && prevVal !== null
          ? Number((val - prevVal).toFixed(2))
          : null;

      // Formato fecha legible para eje X
      let formattedX = e.date;
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        formattedX = new Intl.DateTimeFormat("es-ES", {
          day: "numeric",
          month: "short",
        }).format(d);
      }

      return {
        ...e,
        dateKey: e.date,
        formattedDate: formattedX,
        displayValue: val,
        prevDelta: delta,
      };
    });
  }, [filteredEntries, activeMetricConfig]);

  // 4. Resumen de Tendencia (Delta Total del Periodo)
  const trendSummary = useMemo(() => {
    if (filteredEntries.length < 2) return null;
    const first = filteredEntries[0];
    const last = filteredEntries[filteredEntries.length - 1];

    const deltaWeight = Number((last.weightKg - first.weightKg).toFixed(1));
    const deltaFat = Number((last.bodyFatPct - first.bodyFatPct).toFixed(1));
    const deltaMuscle = Number((last.muscleMassKg - first.muscleMassKg).toFixed(1));
    const deltaWaist =
      last.waistCircumferenceCm && first.waistCircumferenceCm
        ? Number((last.waistCircumferenceCm - first.waistCircumferenceCm).toFixed(1))
        : null;

    return {
      deltaWeight,
      deltaFat,
      deltaMuscle,
      deltaWaist,
      firstDate: first.date,
      lastDate: last.date,
    };
  }, [filteredEntries]);

  // Registros globales para tarjetas superiores
  const hasEntries = deduplicatedEntries.length > 0;
  const latest = hasEntries ? deduplicatedEntries[deduplicatedEntries.length - 1] : null;
  const first = hasEntries ? deduplicatedEntries[0] : null;

  const totalDeltaWeight =
    hasEntries && deduplicatedEntries.length >= 2 && latest && first
      ? (latest.weightKg - first.weightKg).toFixed(1)
      : null;
  const totalDeltaMuscle =
    hasEntries && deduplicatedEntries.length >= 2 && latest && first
      ? (latest.muscleMassKg - first.muscleMassKg).toFixed(1)
      : null;

  // Badges clínicos de salud
  const bmiBadge = latest ? getBMIBadge(latest.bmi) : null;
  const fatBadge = latest ? getBodyFatBadge(latest.bodyFatPct, activeProfile.gender) : null;
  const viscBadge = latest ? getVisceralFatBadge(latest.visceralFatRating) : null;

  // Custom Tooltip Oscuro Táctil (Dark Kinetic)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const value = dataPoint.displayValue;
      const delta = dataPoint.prevDelta;

      return (
        <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1 z-50">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
            {dataPoint.formattedDate} ({dataPoint.dateKey})
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-white tabular-nums">
              {value}
            </span>
            <span className="text-[10px] text-zinc-400">
              {activeMetricConfig.unit}
            </span>
          </div>
          {delta !== null && (
            <p
              className={cn(
                "text-[10px] font-bold tabular-nums flex items-center gap-1",
                delta < 0
                  ? "text-emerald-400"
                  : delta > 0
                  ? "text-amber-400"
                  : "text-zinc-400"
              )}
            >
              {delta > 0 ? `+${delta}` : delta} {activeMetricConfig.unit} vs previo
            </p>
          )}
          {activeMetricConfig.targetValue && (
            <p className="text-[9px] text-zinc-500 pt-0.5 border-t border-zinc-800">
              Meta: {activeMetricConfig.targetValue} {activeMetricConfig.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-44 pt-2 max-w-md mx-auto px-4 pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      {/* 1. Cabecera y Botón Nuevo Pesaje */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest block">
            ANALYTICS BIIO
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Recomposición & Báscula
          </h2>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-black uppercase text-black font-mono flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all duration-200"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Pesar</span>
        </button>
      </div>

      {/* 2. Tarjetas de Resumen Actual */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
            Peso Actual
          </span>
          <span className="text-lg font-mono tabular-nums font-black text-white">
            {latest ? latest.weightKg : "--"}{" "}
            <span className="text-xs font-normal text-zinc-400">kg</span>
          </span>
          {totalDeltaWeight !== null ? (
            <span
              className={cn(
                "text-[9px] font-mono tabular-nums block mt-0.5",
                Number(totalDeltaWeight) <= 0 ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {Number(totalDeltaWeight) > 0 ? `+${totalDeltaWeight}` : totalDeltaWeight} kg total
            </span>
          ) : (
            <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">
              {hasEntries ? "Línea base" : "Sin registros"}
            </span>
          )}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
            % Grasa
          </span>
          <span className="text-lg font-mono tabular-nums font-black text-amber-400">
            {latest ? `${latest.bodyFatPct}%` : "-- %"}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono tabular-nums block mt-0.5">
            Meta: {activeProfile.targetBodyFatPct || (isGirl ? 21 : 16)}%
          </span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
            Masa Muscular
          </span>
          <span
            className="text-lg font-mono tabular-nums font-black"
            style={{ color: accentColor }}
          >
            {latest ? latest.muscleMassKg : "--"}{" "}
            <span className="text-xs font-normal text-zinc-400">kg</span>
          </span>
          {totalDeltaMuscle !== null ? (
            <span
              className={cn(
                "text-[9px] font-mono tabular-nums block mt-0.5",
                Number(totalDeltaMuscle) >= 0 ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {Number(totalDeltaMuscle) > 0 ? `+${totalDeltaMuscle}` : totalDeltaMuscle} kg magro
            </span>
          ) : (
            <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">
              {hasEntries ? "Línea base" : "Sin registros"}
            </span>
          )}
        </div>
      </div>

      {/* 3. Indicadores Clínicos de Salud */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase">
            Estado Clínico:
          </span>
        </div>

        {fatBadge && bmiBadge && viscBadge ? (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <div
              className={cn(
                "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                fatBadge.bgClass,
                fatBadge.textClass,
                fatBadge.borderClass
              )}
            >
              <span>Grasa:</span>
              <span className="font-black">{fatBadge.label}</span>
            </div>

            <div
              className={cn(
                "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                bmiBadge.bgClass,
                bmiBadge.textClass,
                bmiBadge.borderClass
              )}
            >
              <span>IMC:</span>
              <span className="font-black">{bmiBadge.label}</span>
            </div>

            <div
              className={cn(
                "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                viscBadge.bgClass,
                viscBadge.textClass,
                viscBadge.borderClass
              )}
            >
              <span>Visceral:</span>
              <span className="font-black">{viscBadge.label}</span>
            </div>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-zinc-500 italic">
            Pendiente de primer pesaje
          </span>
        )}
      </div>

      {/* 4. Perímetros Corporales (si existen) */}
      {latest && (latest.waistCircumferenceCm || latest.hipCm || latest.armCm || latest.chestCm) && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Últimos Perímetros Corporales (cm)</span>
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            {latest.waistCircumferenceCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Cintura</span>
                <span className="font-black text-zinc-200">{latest.waistCircumferenceCm} cm</span>
              </div>
            )}
            {latest.hipCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Cadera</span>
                <span className="font-black text-zinc-200">{latest.hipCm} cm</span>
              </div>
            )}
            {latest.armCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Brazo</span>
                <span className="font-black text-zinc-200">{latest.armCm} cm</span>
              </div>
            )}
            {latest.thighCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Muslo</span>
                <span className="font-black text-zinc-200">{latest.thighCm} cm</span>
              </div>
            )}
            {latest.chestCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Pecho</span>
                <span className="font-black text-zinc-200">{latest.chestCm} cm</span>
              </div>
            )}
            {latest.neckCm && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <span className="text-[9px] text-zinc-500 block uppercase">Cuello</span>
                <span className="font-black text-zinc-200">{latest.neckCm} cm</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DASHBOARD DE GRÁFICAS DE EVOLUCIÓN HISTÓRICA */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-4">
        {/* Filtros Superiores: Rango de Tiempo (7d / 30d / all) */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">
              Evolución Histórica
            </h3>
          </div>

          {/* Selector de Rango */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                timeRange === "7d"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              7 Días
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                timeRange === "30d"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              30 Días
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                timeRange === "all"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Todo
            </button>
          </div>
        </div>

        {/* Selector de Variable Clave (Píldoras táctiles) */}
        <div className="grid grid-cols-4 gap-1.5">
          {(["weight", "bodyFat", "muscle", "waist"] as MetricKey[]).map((key) => {
            const isSelected = selectedMetric === key;
            const cfg = metricConfigs[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={cn(
                  "py-2 px-1.5 rounded-xl border text-center transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-0.5",
                  isSelected
                    ? "bg-zinc-950 border-zinc-600 shadow-md ring-1 ring-white/10"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
                style={{
                  borderColor: isSelected ? cfg.color : undefined,
                }}
              >
                <span
                  className={cn(
                    "text-[10px] font-mono font-black uppercase tracking-tight block truncate w-full",
                    isSelected ? "text-white" : "text-zinc-400"
                  )}
                  style={{ color: isSelected ? cfg.color : undefined }}
                >
                  {cfg.shortLabel}
                </span>
                {cfg.targetValue && (
                  <span className="text-[8px] font-mono text-zinc-500 block">
                    Meta: {cfg.targetValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tarjeta de Resumen de Tendencia (Delta Total del Periodo) */}
        {trendSummary && (
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">
                Variación neta en periodo
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white font-bold">
                  Peso:{" "}
                  <strong
                    className={cn(
                      "font-black tabular-nums",
                      trendSummary.deltaWeight < 0
                        ? "text-emerald-400"
                        : trendSummary.deltaWeight > 0
                        ? "text-amber-400"
                        : "text-zinc-300"
                    )}
                  >
                    {trendSummary.deltaWeight > 0 ? `+${trendSummary.deltaWeight}` : trendSummary.deltaWeight} kg
                  </strong>
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] space-y-0.5">
              <div className="text-zinc-400">
                Grasa:{" "}
                <strong
                  className={cn(
                    "tabular-nums",
                    trendSummary.deltaFat < 0 ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {trendSummary.deltaFat > 0 ? `+${trendSummary.deltaFat}` : trendSummary.deltaFat}%
                </strong>
              </div>
              <div className="text-zinc-400">
                Músculo:{" "}
                <strong
                  className={cn(
                    "tabular-nums",
                    trendSummary.deltaMuscle > 0 ? "text-emerald-400" : "text-zinc-300"
                  )}
                >
                  {trendSummary.deltaMuscle > 0 ? `+${trendSummary.deltaMuscle}` : trendSummary.deltaMuscle} kg
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Estado Condicional: 0 registros vs 1 registro vs Gráfica Completa */}
        {!hasEntries ? (
          /* Estado Vacío (0 Registros) */
          <div className="h-60 w-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800">
            <div
              className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 shadow-lg"
              style={{ color: accentColor }}
            >
              <Scale className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono font-black text-white uppercase tracking-wider">
              Sin mediciones registradas
            </p>
            <p className="text-[11px] font-mono text-zinc-400 max-w-xs mt-1 mb-4 leading-relaxed">
              Registra tu primer pesaje matutino en ayunas para trazar la línea de tendencia y calibrar tus metas.
            </p>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-black uppercase text-black flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Iniciar Primer Pesaje</span>
            </button>
          </div>
        ) : filteredEntries.length === 1 ? (
          /* Estado de 1 Registro (Línea Base) */
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs font-mono">
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-zinc-300 leading-snug">
                Punto de partida registrado:{" "}
                <strong className="text-white">
                  {chartData[0].displayValue} {activeMetricConfig.unit}
                </strong>
                . Registra tu próximo pesaje para trazar la curva de evolución.
              </p>
            </div>

            {/* Renderizar punto único y línea de meta */}
            <div className="h-52 w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    {
                      ...chartData[0],
                      formattedDate: chartData[0].formattedDate,
                    },
                  ]}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={activeMetricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetricConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeMetricConfig.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="formattedDate" stroke="#71717A" fontSize={10} fontVariant="mono" />
                  <YAxis
                    stroke="#71717A"
                    fontSize={10}
                    unit={activeMetricConfig.unit}
                    domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 5)), (dataMax: number) => Math.ceil(dataMax + 5)]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {activeMetricConfig.targetValue && (
                    <ReferenceLine
                      y={activeMetricConfig.targetValue}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `Meta: ${activeMetricConfig.targetValue} ${activeMetricConfig.unit}`,
                        position: "top",
                        fill: "#F87171",
                        fontSize: 10,
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="displayValue"
                    stroke={activeMetricConfig.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${activeMetricConfig.gradientId})`}
                    name={activeMetricConfig.label}
                    dot={{ r: 5, fill: activeMetricConfig.color, stroke: "#09090B", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Gráfica Completa (Múltiples Registros) */
          <div className="h-64 w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id={activeMetricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetricConfig.color} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={activeMetricConfig.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#71717A"
                  fontSize={10}
                  fontVariant="mono"
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717A"
                  fontSize={10}
                  unit={activeMetricConfig.unit}
                  domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 2)), (dataMax: number) => Math.ceil(dataMax + 2)]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {activeMetricConfig.targetValue && (
                  <ReferenceLine
                    y={activeMetricConfig.targetValue}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Meta: ${activeMetricConfig.targetValue} ${activeMetricConfig.unit}`,
                      position: "top",
                      fill: "#F87171",
                      fontSize: 10,
                      fontFamily: "monospace",
                      fontWeight: "bold",
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="displayValue"
                  stroke={activeMetricConfig.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${activeMetricConfig.gradientId})`}
                  name={activeMetricConfig.label}
                  dot={{ r: 4, fill: activeMetricConfig.color, stroke: "#09090B", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: activeMetricConfig.color, stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 6. GRÁFICA DE FUERZA TOTAL · CURVA 1RM (kg) */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">
              Fuerza Total · Curva 1RM (kg)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            5 Ejercicios Clave
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { name: "M1", squat: 110, bench: 85, deadlift: 135, military: 52, hipThrust: 115 },
                { name: "M2", squat: 117.5, bench: 90, deadlift: 145, military: 57.5, hipThrust: 125 },
                { name: "M3", squat: 122.5, bench: 95, deadlift: 152.5, military: 60, hipThrust: 132.5 },
                { name: "M4", squat: 127.5, bench: 97.5, deadlift: 157.5, military: 62.5, hipThrust: 137.5 },
                { name: "M5 (Target)", squat: 135, bench: 105, deadlift: 165, military: 67.5, hipThrust: 145 },
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="name" stroke="#71717A" fontSize={10} />
              <YAxis stroke="#71717A" fontSize={10} domain={[40, 180]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090B",
                  borderColor: "#3F3F46",
                  borderRadius: 16,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Line type="monotone" dataKey="deadlift" stroke="#EF4444" strokeWidth={2.5} name="Peso Muerto" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="squat" stroke={accentColor} strokeWidth={2.5} name="Sentadilla" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="hipThrust" stroke="#EC4899" strokeWidth={2.5} name="Hip Thrust" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="bench" stroke="#3B82F6" strokeWidth={2.5} name="Press Banca" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="military" stroke="#10B981" strokeWidth={2.5} name="Press Militar" dot={{ r: 3 }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawer Formulario de Báscula */}
      <BiometricsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
