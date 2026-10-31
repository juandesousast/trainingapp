"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useMesocyclesStore } from "@/stores/useMesocyclesStore";
import { getMesocyclesForProfile } from "@/lib/mesocyclesData";
import { BentoMesocycleCard } from "@/components/BentoMesocycleCard";
import { RecoveryCheckinDrawer } from "@/components/RecoveryCheckinDrawer";
import { TargetGoalDialog } from "@/components/TargetGoalDialog";
import { BiometricsDrawer } from "@/components/BiometricsDrawer";
import { SupplementProtocolCard } from "@/components/SupplementProtocolCard";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { Mesocycle, Workout } from "@/lib/types";
import { Play, Sparkles, Scale, HeartPulse, Check, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MesocyclesDashboard: React.FC = () => {
  const { activeProfile } = useProfileStore();
  const { startWorkout } = useWorkoutSessionStore();
  const { activeMesoNumberByProfile, setActiveMesoNumber, getExposure, exposuresByProfileAndMeso } = useMesocyclesStore();
  const accentColor = activeProfile.themeAccent;

  const activeMesoNumber = activeMesoNumberByProfile[activeProfile.slug] || 1;
  const mesocycles = useMemo(() => {
    return getMesocyclesForProfile(activeProfile.slug).map((m) => ({
      ...m,
      currentExposure: getExposure(activeProfile.slug, m.number, m.currentExposure),
    }));
  }, [activeProfile.slug, getExposure, exposuresByProfileAndMeso]);

  const activeMeso =
    mesocycles.find((m) => m.number === activeMesoNumber) || mesocycles[0];

  const [selectedMesocycle, setSelectedMesocycle] = useState<Mesocycle>(activeMeso);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number>(0);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const { entries, recoveryCheckins } = useBiometricsStore();
  const latestRecovery = recoveryCheckins[0];
  const latestBiometric = entries && entries.length > 0 ? entries[entries.length - 1] : null;

  // Cuando cambie el perfil activo o el mesociclo activo, actualizar la selección
  useEffect(() => {
    const nextActive =
      mesocycles.find((m) => m.number === activeMesoNumber) || mesocycles[0];
    setSelectedMesocycle(nextActive);
    setSelectedWorkoutIndex(0);
  }, [activeProfile.slug, activeMesoNumber]);

  // Sincronizar el objetivo semanal del mesociclo activo
  useEffect(() => {
    const target = activeMeso?.weeklyTarget || 3;
    if (activeProfile.weeklyTarget !== target) {
      useProfileStore.getState().updateActivityStats(
        activeProfile.streakDays,
        activeProfile.weeklyCompleted,
        target
      );
    }
  }, [activeMeso, activeProfile.weeklyTarget, activeProfile.streakDays, activeProfile.weeklyCompleted]);

  const workouts = selectedMesocycle.workouts || [];
  const currentWorkout: Workout =
    workouts[selectedWorkoutIndex] ||
    workouts[0] || {
      id: "w-fallback",
      mesocycleId: selectedMesocycle.id,
      letter: "A",
      name: "Entreno A: Progresión Principal BIIO",
      orderIndex: 1,
      exercises: [],
    };

  const isSelectedActive = selectedMesocycle.number === activeMesoNumber;

  const handleMarkAsActive = (meso: Mesocycle) => {
    setActiveMesoNumber(activeProfile.slug, meso.number);
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-44 pt-4 space-y-6 pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      {/* Hero Banner Dark Kinetic */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 border bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 shadow-2xl backdrop-blur-xl"
        style={{
          borderColor: `${accentColor}55`,
          boxShadow: `0 10px 40px -15px ${accentColor}25`,
        }}
      >
        {/* Glow de fondo */}
        <div
          className="absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span
              className={cn(
                "text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono tracking-wider flex items-center gap-1.5 shadow-sm",
                isSelectedActive ? "text-black" : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              )}
              style={{ backgroundColor: isSelectedActive ? accentColor : undefined }}
            >
              {isSelectedActive ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  MESOCICLO ACTIVO HOY
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  EXPLORANDO M{selectedMesocycle.number}
                </>
              )}
            </span>
            <span className="text-xs font-mono tabular-nums font-bold text-zinc-400">
              {selectedMesocycle.code}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                {selectedMesocycle.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Exposición <span className="font-mono tabular-nums font-bold text-zinc-300">{selectedMesocycle.currentExposure}</span>º de <span className="font-mono tabular-nums font-bold text-zinc-300">{selectedMesocycle.totalExposures}</span>º · {selectedMesocycle.splitStructure}
              </p>
            </div>

            {/* Botón para marcar como activo si se está explorando otro ciclo */}
            {!isSelectedActive && (
              <button
                type="button"
                onClick={() => handleMarkAsActive(selectedMesocycle)}
                className="shrink-0 min-h-[44px] text-[10px] font-mono font-black uppercase px-3 py-1.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/90 text-zinc-200 hover:text-white transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Activar</span>
              </button>
            )}
          </div>

          {/* Selector de Entrenos del Mesociclo (A, B, C) */}
          {workouts.length > 1 && (
            <div className="mt-4 pt-3 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Seleccionar Sesión a Realizar:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workouts.map((w, idx) => {
                  const isSelectedW = idx === selectedWorkoutIndex;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWorkoutIndex(idx)}
                      className={cn(
                        "min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm",
                        isSelectedW
                          ? "bg-zinc-100 text-black shadow-md font-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                    >
                      <span className="font-mono font-black">Entreno {w.letter}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Sesión Seleccionada
            </span>
            <p className="text-xs font-bold text-zinc-100 mt-0.5">
              {currentWorkout.name}
            </p>
          </div>

          {/* Botón Principal Cinético */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => startWorkout(selectedMesocycle, currentWorkout)}
            className="w-full mt-5 min-h-[56px] py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-black shadow-xl transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 25px -5px ${accentColor}66`,
            }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>EMPEZAR ENTRENAMIENTO</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Fila de Accesos Rápidos: Báscula & Check-in de Recuperación */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Pill de Línea Base Biométrica y Meta Personalizada Clicable */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div
            onClick={() => setIsBiometricsOpen(true)}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
            title="Pulsar para registrar pesaje matutino"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block truncate">
                Báscula en Ayunas ({activeProfile.displayName})
              </span>
              {latestBiometric ? (
                <span className="text-xs font-mono tabular-nums font-bold text-zinc-200 block truncate">
                  {latestBiometric.weightKg} kg · {latestBiometric.bodyFatPct}% Grasa · {latestBiometric.muscleMassKg} kg Músculo
                </span>
              ) : (
                <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors block">
                  Sin mediciones registradas · Pulsa para iniciar tu primer pesaje
                </span>
              )}
            </div>
          </div>

          {/* Píldora de Meta Dinámica y Clicable */}
          <button
            type="button"
            onClick={() => setIsGoalOpen(true)}
            title="Pulsar para personalizar meta corporal"
            className="min-h-[44px] text-[10px] font-mono tabular-nums font-black px-3.5 py-1.5 rounded-full text-black hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center gap-1 cursor-pointer shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <span>Meta: {activeProfile.targetBodyFatPct || (activeProfile.role === "hoplita_girl" ? 21 : 16)}%</span>
          </button>
        </div>

        {/* Botón Trigger: Check-in Diario de Recuperación */}
        <button
          onClick={() => setIsRecoveryOpen(true)}
          className="w-full min-h-[64px] bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex items-center justify-between transition-all duration-200 active:scale-95 group text-left"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Check-in Diario de Recuperación
              </span>
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                {latestRecovery ? (
                  <>
                    <span className="text-zinc-300">Sueño: {latestRecovery.sleepQuality}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-300">Agujetas: {latestRecovery.domsLevel}</span>
                  </>
                ) : (
                  <span className="text-zinc-400">Registrar sueño, DOMS, agua, pasos...</span>
                )}
              </span>
            </div>
          </div>
          <span
            className="min-h-[36px] text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border transition-all flex items-center justify-center shrink-0"
            style={{
              borderColor: `${accentColor}55`,
              color: accentColor,
            }}
          >
            {latestRecovery ? "Actualizar" : "+ Check-in"}
          </span>
        </button>
      </div>

      {/* Módulo de Suplementación & Recuperación */}
      <SupplementProtocolCard />

      {/* Catálogo Bento de los 5 Mesociclos (Navegación Desbloqueada) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
            Plan Maestro Hoplita (5 Mesociclos Desbloqueados)
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">
            {mesocycles.length} Bloques
          </span>
        </div>

        <div className="space-y-3">
          {mesocycles.map((meso) => (
            <BentoMesocycleCard
              key={meso.id}
              mesocycle={meso}
              isSelected={selectedMesocycle.number === meso.number}
              isActiveMeso={activeMesoNumber === meso.number}
              onSelect={(m) => {
                setSelectedMesocycle(m);
                setSelectedWorkoutIndex(0);
              }}
              onActivate={handleMarkAsActive}
            />
          ))}
        </div>
      </div>

      {/* Modal / Dialog de Meta Personalizada */}
      <TargetGoalDialog
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
      />

      {/* Drawer de Check-in de Recuperación */}
      <RecoveryCheckinDrawer
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
      />

      {/* Drawer de Pesaje Matutino en Ayunas */}
      <BiometricsDrawer
        isOpen={isBiometricsOpen}
        onClose={() => setIsBiometricsOpen(false)}
      />
    </div>
  );
};
