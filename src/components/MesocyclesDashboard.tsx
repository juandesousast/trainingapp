"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { getMesocyclesForProfile } from "@/lib/mesocyclesData";
import { BentoMesocycleCard } from "@/components/BentoMesocycleCard";
import { RecoveryCheckinDrawer } from "@/components/RecoveryCheckinDrawer";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { Mesocycle, Workout } from "@/lib/types";
import { Play, Sparkles, Scale, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export const MesocyclesDashboard: React.FC = () => {
  const { activeProfile } = useProfileStore();
  const { startWorkout } = useWorkoutSessionStore();
  const accentColor = activeProfile.themeAccent;

  const mesocycles = getMesocyclesForProfile(activeProfile.slug);
  const activeMeso = mesocycles.find((m) => m.isActive) || mesocycles[0];

  const [selectedMesocycle, setSelectedMesocycle] = useState<Mesocycle>(activeMeso);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const { recoveryCheckins } = useBiometricsStore();
  const latestRecovery = recoveryCheckins[0];

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
  const nextWorkout: Workout =
    workouts.length > 0
      ? workouts[0]
      : {
          id: "w-fallback",
          mesocycleId: selectedMesocycle.id,
          letter: "A",
          name: "Entreno A: Progresión Principal BIIO",
          orderIndex: 1,
          exercises: [],
        };

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-4 space-y-6">
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
              className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-black font-mono tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-3 h-3" />
              SESIÓN DE HOY RECOMENDADA
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {selectedMesocycle.code}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
            {selectedMesocycle.name}
          </h2>

          <p className="text-sm font-semibold text-zinc-300 mt-1">
            {nextWorkout.name}
          </p>

          <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
            Exposición {selectedMesocycle.currentExposure}º de {selectedMesocycle.totalExposures}º · {selectedMesocycle.splitStructure}
          </p>

          {/* Botón Principal Cinético */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => startWorkout(selectedMesocycle, nextWorkout)}
            className="w-full mt-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-black shadow-xl transition-all duration-300"
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
        {/* Pill de Línea Base Biométrica */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Báscula en Ayunas (Baseline)
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200">
                82.15 kg · 25.6% Grasa · 58.08 kg Músculo
              </span>
            </div>
          </div>
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full text-black"
            style={{ backgroundColor: accentColor }}
          >
            Meta: 16%
          </span>
        </div>

        {/* Botón Trigger: Check-in Diario de Recuperación */}
        <button
          onClick={() => setIsRecoveryOpen(true)}
          className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
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
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all"
            style={{
              borderColor: `${accentColor}55`,
              color: accentColor,
            }}
          >
            {latestRecovery ? "Actualizar" : "+ Check-in"}
          </span>
        </button>
      </div>

      <RecoveryCheckinDrawer
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
      />

      {/* Catálogo Bento de los 5 Mesociclos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
            Plan Maestro Hoplita (5 Mesociclos)
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
              onSelect={(m) => setSelectedMesocycle(m)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
