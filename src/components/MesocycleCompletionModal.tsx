"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  Zap,
  CheckCircle2,
  Layers,
  Award,
} from "lucide-react";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { cn } from "@/lib/utils";

export const MesocycleCompletionModal: React.FC = () => {
  const {
    showMesocycleCompletionModal,
    mesocycleCompletionData,
    closeMesocycleCompletionModal,
    activateNextMesocycle,
  } = useWorkoutSessionStore();
  const { activeProfile } = useProfileStore();
  const [isActivating, setIsActivating] = useState(false);

  if (!showMesocycleCompletionModal || !mesocycleCompletionData) {
    return null;
  }

  const accentColor = activeProfile.themeAccent || "#CCFF00";
  const {
    progressions,
    mesocycleNumber,
    mesocycleName,
    totalExposures,
    nextMesocycleNumber,
    nextMesocycleName,
    nextMesocycleTotalExposures,
    isMacrocyleComplete,
  } = mesocycleCompletionData;

  const nextNumber = nextMesocycleNumber || mesocycleNumber + 1;
  const nextName = nextMesocycleName || `M${nextNumber}`;
  const nextSessions = nextMesocycleTotalExposures || 9;

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await activateNextMesocycle();
    } catch (err) {
      console.error("Error activating next mesocycle:", err);
    } finally {
      setIsActivating(false);
    }
  };

  const getSubtitles = () => {
    if (isMacrocyleComplete) {
      return "Has recorrido con éxito la totalidad del sistema BIIO (M1 Reacondicionamiento ➔ M2 Preparación ➔ M3 Especialización ➔ M4 Fuerza 1 ➔ M5 Maximales). Has alcanzado tu pico histórico de fuerza absoluta.";
    }
    switch (mesocycleNumber) {
      case 1:
        return "Has consolidado la adaptación anatómica de tendones y la base hipertrófica en pirámide inversa (15-12-10). Tus patrones biomecánicos están optimizados para pasar a la fase de fuerza submáxima.";
      case 2:
        return "Has superado los 3 microciclos de sobrecarga progresiva (8-6-4) y descarga técnica. Tu reclutamiento neuromuscular y umbral de fatiga están listos para la especialización técnica.";
      case 3:
        return "Has perfeccionado el tempo y la tensión mecánica continua bajo carga submáxima. Estás preparado para la fase de cargas altas en Fuerza 1.";
      case 4:
        return "Fase de fuerza submáxima 4x4 y pirámide pesada dominada. Has sentado las bases para el test final de maximales y cluster sets en M5.";
      default:
        return "Bloque completado con éxito siguiendo la metodología de sobrecarga progresiva BIIO.";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg my-auto bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border rounded-3xl p-5 sm:p-7 shadow-2xl text-left overflow-hidden space-y-5"
          style={{
            borderColor: `${accentColor}40`,
            boxShadow: `0 20px 60px -15px ${accentColor}25`,
          }}
        >
          {/* Background glow */}
          <div
            className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />

          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase font-mono shadow-sm"
              style={{
                backgroundColor: accentColor,
                color: "#000000",
              }}
            >
              {isMacrocyleComplete ? (
                <>
                  <Award className="w-3.5 h-3.5" />
                  MACROCICLO COMPLETO · HOPLITA BIIO
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  M{mesocycleNumber} COMPLETADO · {totalExposures}/{totalExposures} SESIONES
                </>
              )}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              HOPLITA BIIO
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none">
              {isMacrocyleComplete
                ? "MACROCICLO HOPLITA BIIO COMPLETADO"
                : `${mesocycleName.toUpperCase()} CONCLUIDO`}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {getSubtitles()}
            </p>
          </div>

          {/* Strength Progression Card */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-300" />
                {isMacrocyleComplete
                  ? "EVOLUCIÓN TOTAL DEL MACROCICLO (M1 ➔ M5 PICO REAL)"
                  : `PROGRESIÓN DE FUERZA (SESIÓN 1 ➔ SESIÓN ${totalExposures})`}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {isMacrocyleComplete ? "PICO HISTÓRICO" : "SERIE EFECTIVA"}
              </span>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {progressions.map((prog) => (
                <div key={prog.slug} className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white uppercase tracking-tight truncate">
                      {prog.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {prog.muscleGroup}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-400">
                        <span className="text-zinc-500">{prog.startWeightKg}kg</span>
                        <span className="text-zinc-600 mx-1">➔</span>
                        <span className="text-white font-bold">{prog.endWeightKg}kg</span>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        {prog.startReps} reps
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                      }}
                    >
                      +{prog.deltaKg}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1RM Automatic Recalibration Section */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {isMacrocyleComplete
                  ? "MAXIMALES 1RM PICO HISTÓRICO CONSOLIDADOS"
                  : "RECALIBRACIÓN DE 1RM ESTIMADO (EPLEY / BRZYCKI)"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                CALIBRADO
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal">
              {isMacrocyleComplete
                ? "Tus marcas máximas oficiales registradas tras completar los 5 mesociclos:"
                : "A partir de tus series efectivas se han proyectado tus nuevos maximales para calibrar con precisión las intensidades del siguiente mesociclo:"}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {progressions.map((prog) => (
                <div
                  key={`1rm-${prog.slug}`}
                  className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-zinc-400 truncate">
                    {prog.name}
                  </span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 line-through">
                      {prog.previous1RM} kg
                    </span>
                    <span
                      className="text-xs font-mono font-black"
                      style={{ color: accentColor }}
                    >
                      {prog.proposed1RM} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Mesocycle Preview Card */}
          {!isMacrocyleComplete && (
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white uppercase tracking-tight">
                    M{nextNumber} · {nextName.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    {nextSessions} SESIONES
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {nextNumber === 2 && (
                    <>
                      Sobrecarga progresiva en rangos de fuerza <span className="text-zinc-200 font-mono font-bold">8-6-4</span>, descansos ampliados a <span className="text-zinc-200 font-mono font-bold">2&apos;00&quot;</span> y descarga técnica 8x3.
                    </>
                  )}
                  {nextNumber === 3 && (
                    <>
                      Especialización técnica con tensión mecánica continua <span className="text-zinc-200 font-mono font-bold">6-6-6</span>, tempo estricto y pausas de <span className="text-zinc-200 font-mono font-bold">2&apos;15&quot;</span>.
                    </>
                  )}
                  {nextNumber === 4 && (
                    <>
                      Cargas submáximas en pirámide pesada <span className="text-zinc-200 font-mono font-bold">5-4-3-2</span> al 80%-87.5% de 1RM y pausas de <span className="text-zinc-200 font-mono font-bold">2&apos;30&quot; - 3&apos;00&quot;</span>.
                    </>
                  )}
                  {nextNumber === 5 && (
                    <>
                      Cluster Sets intra-serie (1 rep / 15&quot;-25&quot;) al 87.5%-92.5% y sesiones de test de 1RM real.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            {isMacrocyleComplete ? (
              <button
                type="button"
                onClick={handleActivate}
                disabled={isActivating}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl",
                  isActivating ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.98]"
                )}
                style={{
                  backgroundColor: accentColor,
                  color: "#000000",
                  boxShadow: `0 8px 30px -8px ${accentColor}50`,
                }}
              >
                {isActivating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    FINALIZANDO MACROCICLO...
                  </>
                ) : (
                  <>
                    « FINALIZAR MACROCICLO Y PROGRAMAR DESCARGA ESTRATÉGICA »
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleActivate}
                disabled={isActivating}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl",
                  isActivating ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.98]"
                )}
                style={{
                  backgroundColor: accentColor,
                  color: "#000000",
                  boxShadow: `0 8px 30px -8px ${accentColor}50`,
                }}
              >
                {isActivating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ACTIVANDO M{nextNumber} Y ACTUALIZANDO 1RM...
                  </>
                ) : (
                  <>
                    « ACTIVAR M{nextNumber}: {nextName.toUpperCase()} ({nextSessions} SESIONES) ➔ »
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={closeMesocycleCompletionModal}
              disabled={isActivating}
              className="w-full py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cerrar y Revisar Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
