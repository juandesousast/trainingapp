"use client";

import React, { useState } from "react";
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
  Legend,
} from "recharts";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { BiometricsDrawer } from "@/components/BiometricsDrawer";
import { getBMIBadge, getBodyFatBadge, getVisceralFatBadge } from "@/lib/healthBadges";
import { Plus, TrendingDown, Dumbbell, Target, Activity, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

export const RecompCharts: React.FC = () => {
  const { entries } = useBiometricsStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Datos para Gráfica 1: Recomposición (% Grasa vs Masa Muscular)
  const recompData = entries.map((e) => ({
    date: e.date,
    bodyFatPct: e.bodyFatPct,
    muscleMassKg: e.muscleMassKg,
    weightKg: e.weightKg,
  }));

  // Datos para Gráfica 2: Fuerza Total (Evolución de 1RM estimado)
  const strengthData = [
    { name: "M1", squat: 110, bench: 85, deadlift: 135, military: 52, hipThrust: 115 },
    { name: "M2", squat: 117.5, bench: 90, deadlift: 145, military: 57.5, hipThrust: 125 },
    { name: "M3", squat: 122.5, bench: 95, deadlift: 152.5, military: 60, hipThrust: 132.5 },
    { name: "M4", squat: 127.5, bench: 97.5, deadlift: 157.5, military: 62.5, hipThrust: 137.5 },
    { name: "M5 (Target)", squat: 135, bench: 105, deadlift: 165, military: 67.5, hipThrust: 145 },
  ];

  const latest = entries[entries.length - 1] || entries[0];
  const bmiBadge = getBMIBadge(latest.bmi);
  const fatBadge = getBodyFatBadge(latest.bodyFatPct, activeProfile.gender);
  const viscBadge = getVisceralFatBadge(latest.visceralFatRating);

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto px-4">
      {/* Cabecera y Botón Nuevo Pesaje */}
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
          className="px-3.5 py-2 rounded-2xl text-xs font-black uppercase text-black font-mono flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Pesar</span>
        </button>
      </div>

      {/* Tarjeta de Resumen Actual */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">
            Peso Actual
          </span>
          <span className="text-lg font-mono font-black text-white">
            {latest.weightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
            -1.35 kg total
          </span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">
            % Grasa
          </span>
          <span className="text-lg font-mono font-black text-amber-400">
            {latest.bodyFatPct}%
          </span>
          <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">
            Meta: {activeProfile.targetBodyFatPct || (activeProfile.slug === "hoplita" ? 16 : 21)}%
          </span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">
            Masa Muscular
          </span>
          <span
            className="text-lg font-mono font-black"
            style={{ color: accentColor }}
          >
            {latest.muscleMassKg} <span className="text-xs font-normal text-zinc-400">kg</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
            +0.72 kg magro
          </span>
        </div>
      </div>

      {/* Indicadores Clínicos de Salud (Badges de Estado) */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase">
            Estado Clínico:
          </span>
        </div>

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
      </div>

      {/* Perímetros Corporales Registrados (si existen) */}
      {(latest.waistCircumferenceCm || latest.hipCm || latest.armCm || latest.chestCm) && (
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

      {/* GRÁFICA 1: RECOMPOSICIÓN CORPORAL (Doble Eje: Grasa % vs Masa Muscular kg) */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">
              Recomposición Corporal
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Grasa %
            </span>
            <span className="flex items-center gap-1" style={{ color: accentColor }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              Músculo kg
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recompData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="date" stroke="#71717A" fontSize={10} fontVariant="mono" />
              <YAxis
                yAxisId="left"
                stroke="#F59E0B"
                fontSize={10}
                domain={[15, 30]}
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={accentColor}
                fontSize={10}
                domain={[55, 65]}
                unit="kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090B",
                  borderColor: "#3F3F46",
                  borderRadius: 16,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="bodyFatPct"
                stroke="#F59E0B"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFat)"
                name="% Grasa"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="muscleMassKg"
                stroke={accentColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMuscle)"
                name="Músculo kg"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICA 2: FUERZA TOTAL (Evolución 1RM) */}
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
            <LineChart data={strengthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
