"use client";

import React, { useState } from "react";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { MRCalculatorDrawer } from "@/components/MRCalculatorDrawer";
import {
  Check,
  RotateCcw,
  FastForward,
  Calculator,
  ChevronLeft,
  Volume2,
  Clock,
  Zap,
  Repeat,
  AlertCircle,
} from "lucide-react";
import { cn, formatSecondsToMinutes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const ActiveWorkoutView: React.FC = () => {
  const {
    activeWorkout,
    activeMesocycle,
    setsByExercise,
    adjustWeight,
    adjustReps,
    toggleSetCompleted,
    finishWorkout,
    isResting,
    restTimeRemaining,
    restTotalSeconds,
    skipRestTimer,
    isClusterActive,
    clusterCurrentRep,
    clusterTotalReps,
    clusterSecsRemaining,
    clusterIntervalSecs,
    nextClusterRepManual,
    stopClusterTimer,
  } = useWorkoutSessionStore();

  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  // Estado para abrir la calculadora M&R en Drawer
  const [drawerExercise, setDrawerExercise] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  if (!activeWorkout || !activeMesocycle) return null;

  // Agrupar ejercicios: identificar si son individuales o parte de Jump Set / Tri-Set
  const groupedExercises: { isGroup: boolean; tag?: string; items: typeof activeWorkout.exercises }[] = [];
  let currentGroupTag: string | null = null;
  let currentGroupItems: typeof activeWorkout.exercises = [];

  activeWorkout.exercises.forEach((item) => {
    if (item.blockType === "jump_set" || item.blockType === "tri_set") {
      const tag = item.groupTag || "CIRCUITO";
      if (currentGroupTag === tag) {
        currentGroupItems.push(item);
      } else {
        if (currentGroupItems.length > 0) {
          groupedExercises.push({
            isGroup: currentGroupItems.length > 1,
            tag: currentGroupTag || undefined,
            items: currentGroupItems,
          });
        }
        currentGroupTag = tag;
        currentGroupItems = [item];
      }
    } else {
      if (currentGroupItems.length > 0) {
        groupedExercises.push({
          isGroup: currentGroupItems.length > 1,
          tag: currentGroupTag || undefined,
          items: currentGroupItems,
        });
        currentGroupTag = null;
        currentGroupItems = [];
      }
      groupedExercises.push({
        isGroup: false,
        items: [item],
      });
    }
  });

  if (currentGroupItems.length > 0) {
    groupedExercises.push({
      isGroup: currentGroupItems.length > 1,
      tag: currentGroupTag || undefined,
      items: currentGroupItems,
    });
  }

  const isM5Cluster = activeMesocycle.number === 5;

  return (
    <div className="pb-36 pt-2 max-w-md mx-auto px-4">
      {/* Encabezado del Entreno Activo */}
      <div className="sticky top-14 z-30 bg-zinc-950/95 backdrop-blur-md pt-2 pb-3 border-b border-zinc-800/80 mb-4 flex items-center justify-between">
        <button
          onClick={finishWorkout}
          className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-zinc-400 uppercase block">
            {activeMesocycle.name} · {activeWorkout.letter}
          </span>
          <h2 className="text-sm font-black text-white tracking-tight uppercase">
            Exposición {activeMesocycle.currentExposure}º de {activeMesocycle.totalExposures}º
          </h2>
        </div>

        <button
          onClick={finishWorkout}
          className="text-xs font-black uppercase px-2.5 py-1 rounded-full text-black font-mono transition-transform active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          Terminar
        </button>
      </div>

      {/* Lista de Bloques y Ejercicios */}
      <div className="space-y-6">
        {groupedExercises.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={cn(
              "rounded-3xl transition-all",
              group.isGroup
                ? "bg-zinc-950 border-2 border-dashed p-3 space-y-4"
                : "space-y-4"
            )}
            style={{
              borderColor: group.isGroup ? `${accentColor}55` : undefined,
            }}
          >
            {/* Cabecera especial para Jump Set / Circuito */}
            {group.isGroup && (
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-black font-mono flex items-center gap-1"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Repeat className="w-3 h-3" />
                    JUMP SET / CIRCUITO
                  </span>
                  <span className="text-[11px] font-mono font-bold text-zinc-400">
                    Pausa 30&quot; entre ejercicios
                  </span>
                </div>
              </div>
            )}

            {/* Ejercicios dentro del grupo */}
            {group.items.map((workoutExercise) => {
              const sets = setsByExercise[workoutExercise.id] || [];
              const isClusterExercise =
                isM5Cluster && workoutExercise.blockType === "cluster_set";

              return (
                <div
                  key={workoutExercise.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 shadow-lg backdrop-blur-md"
                >
                  {/* Cabecera de Ejercicio */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-zinc-400">
                          #{workoutExercise.orderIndex}
                        </span>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">
                          {workoutExercise.exercise.name}
                        </h3>
                      </div>

                      {/* Notas Técnicas BIIO */}
                      {workoutExercise.technicalNotes && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{workoutExercise.technicalNotes}</span>
                        </div>
                      )}

                      {/* Tempo */}
                      {workoutExercise.tempo && (
                        <span className="inline-block mt-1 text-[11px] font-mono text-zinc-400">
                          Tempo Cadencia: <strong className="text-zinc-200">{workoutExercise.tempo}</strong>
                        </span>
                      )}
                    </div>

                    {/* Botón rápido Calculadora 1RM */}
                    <button
                      onClick={() =>
                        setDrawerExercise({
                          slug: workoutExercise.exercise.slug,
                          name: workoutExercise.exercise.name,
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] font-mono font-bold transition-colors"
                      title="Calcular 1RM"
                    >
                      <Calculator className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>1RM</span>
                    </button>
                  </div>

                  {/* Tabla de Series Cero-Teclado */}
                  <div className="space-y-2.5">
                    {sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className={cn(
                          "rounded-2xl p-3 border transition-all duration-200",
                          set.isCompleted
                            ? "bg-zinc-950/70 border-zinc-800/60 opacity-80"
                            : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Número de Serie */}
                          <div className="flex flex-col items-center justify-center w-7">
                            <span className="text-xs font-mono font-black text-zinc-400">
                              S{set.setNumber}
                            </span>
                            {set.isCompleted && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                            )}
                          </div>

                          {/* Control KILOS (Cero-Teclado) */}
                          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex items-center justify-between">
                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustWeight(workoutExercise.id, setIndex, -2.5)
                              }
                              className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg text-zinc-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
                            >
                              -
                            </button>

                            <div className="text-center px-1">
                              <span className="text-sm font-mono font-black text-white block">
                                {set.actualWeightKg}
                                <span className="text-[10px] text-zinc-400 ml-0.5">kg</span>
                              </span>
                              {set.historicalWeightKg && (
                                <span className="text-[9px] font-mono text-zinc-400 block -mt-0.5">
                                  ant: {set.historicalWeightKg}kg
                                </span>
                              )}
                            </div>

                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustWeight(workoutExercise.id, setIndex, 2.5)
                              }
                              className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg text-zinc-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          {/* Control REPS (Cero-Teclado) */}
                          <div className="w-28 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex items-center justify-between">
                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustReps(workoutExercise.id, setIndex, -1)
                              }
                              className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg text-zinc-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
                            >
                              -
                            </button>

                            <div className="text-center px-1">
                              <span className="text-sm font-mono font-black text-white block">
                                {set.actualReps}
                                <span className="text-[10px] text-zinc-400 ml-0.5">rep</span>
                              </span>
                              {set.historicalReps && (
                                <span className="text-[9px] font-mono text-zinc-400 block -mt-0.5">
                                  ant: {set.historicalReps}r
                                </span>
                              )}
                            </div>

                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustReps(workoutExercise.id, setIndex, 1)
                              }
                              className="w-8 h-8 rounded-lg bg-zinc-800 font-bold text-lg text-zinc-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          {/* Botón de Check / Completar */}
                          <button
                            onClick={() =>
                              toggleSetCompleted(
                                workoutExercise.id,
                                setIndex,
                                workoutExercise.restSeconds,
                                isClusterExercise,
                                15
                              )
                            }
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90",
                              set.isCompleted
                                ? "bg-emerald-500 text-black shadow-md font-bold"
                                : "bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                            )}
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ISLA FLOTANTE DE DESCANSO O MODO CLUSTER (Fixed Bottom) */}
      <AnimatePresence>
        {(isResting || isClusterActive) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50"
          >
            {isClusterActive ? (
              /* PANEL CLUSTER SET (Mesociclo 5) */
              <div
                className="bg-zinc-950 border-2 rounded-3xl p-4 shadow-2xl flex items-center justify-between"
                style={{ borderColor: accentColor }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl text-black animate-pulse"
                    style={{ backgroundColor: accentColor }}
                  >
                    {clusterSecsRemaining}s
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-mono font-black uppercase tracking-wider block"
                      style={{ color: accentColor }}
                    >
                      CLUSTER M5 · 1 REP CADA {clusterIntervalSecs}&quot;
                    </span>
                    <span className="text-base font-black text-white font-mono">
                      Repetición {clusterCurrentRep} de {clusterTotalReps}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={nextClusterRepManual}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-white active:scale-95"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={stopClusterTimer}
                    className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    Parar
                  </button>
                </div>
              </div>
            ) : (
              /* ISLA DE DESCANSO NORMAL */
              <div className="bg-zinc-950/95 border border-zinc-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg text-black shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    {formatSecondsToMinutes(restTimeRemaining)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                      DESCANSO ACTIVO
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      Recupera antes de la siguiente serie
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={skipRestTimer}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1 active:scale-95"
                  >
                    <span>Saltar</span>
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer M&R */}
      {drawerExercise && (
        <MRCalculatorDrawer
          isOpen={Boolean(drawerExercise)}
          onClose={() => setDrawerExercise(null)}
          exerciseSlug={drawerExercise.slug}
          exerciseName={drawerExercise.name}
        />
      )}
    </div>
  );
};
