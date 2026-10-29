"use client";

import React, { useState } from "react";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { MRCalculatorDrawer } from "@/components/MRCalculatorDrawer";
import { PlateCalculatorDrawer } from "@/components/PlateCalculatorDrawer";
import { ExerciseTechnicalGuideDrawer } from "@/components/ExerciseTechnicalGuideDrawer";
import { CooldownModal } from "@/components/CooldownModal";
import { ExerciseVisualizer } from "@/components/ExerciseVisualizer";
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
  Disc,
  BookOpen,
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
    muscleGroup?: string;
    initialWeight?: number;
  } | null>(null);

  // Estado para abrir la Guía Técnica & Biomecánica en Drawer
  const [guideDrawerData, setGuideDrawerData] = useState<{
    name: string;
    slug?: string;
    muscleGroup?: string;
    technicalNotes?: string;
  } | null>(null);

  // Estado para abrir la calculadora de Discos & Calentamiento
  const [plateDrawerData, setPlateDrawerData] = useState<{
    exerciseName: string;
    weightKg: number;
  } | null>(null);

  // Estado para el modal de Vuelta a la Calma
  const [isCooldownOpen, setIsCooldownOpen] = useState(false);

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

  // Estadísticas de la sesión actual
  const allSets = Object.values(setsByExercise).flat();
  const completedSets = allSets.filter((s) => s.isCompleted);
  const completedSetsCount = completedSets.length;
  const totalVolumeKg = completedSets.reduce(
    (sum, s) => sum + s.actualWeightKg * s.actualReps,
    0
  );

  return (
    <div className="pb-44 max-w-md mx-auto pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      {/* Encabezado Sticky del Entreno Activo */}
      <div className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900 py-3 px-4 mb-3 flex items-center justify-between">
        <button
          onClick={() => finishWorkout()}
          className="min-h-[44px] px-2 flex items-center gap-1 text-xs font-extrabold text-zinc-400 hover:text-white transition-colors active:scale-95 uppercase tracking-tight"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-zinc-400 uppercase block">
            {activeMesocycle.name} · {activeWorkout.letter}
          </span>
          <h2 className="text-sm font-black text-white tracking-tight uppercase">
            Exposición <span className="font-mono tabular-nums">{activeMesocycle.currentExposure}</span>º de <span className="font-mono tabular-nums">{activeMesocycle.totalExposures}</span>º
          </h2>
        </div>

        <button
          onClick={() => setIsCooldownOpen(true)}
          className="min-h-[44px] px-4 rounded-full text-xs font-black uppercase text-black font-mono transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          Terminar
        </button>
      </div>

      {/* Lista de Bloques y Ejercicios */}
      <div className="space-y-6 px-4 pt-2">
        {groupedExercises.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={cn(
              "rounded-3xl transition-all",
              group.isGroup
                ? "bg-zinc-950/40 border border-zinc-800/80 p-3.5 space-y-4"
                : "space-y-4"
            )}
            style={{
              borderColor: group.isGroup ? `${accentColor}40` : undefined,
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

                    {/* Botones de Utilidad: Discos & Calculadora M&R */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setPlateDrawerData({
                            exerciseName: workoutExercise.exercise.name,
                            weightKg: sets[0]?.actualWeightKg || 60,
                          })
                        }
                        className="min-h-[44px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 text-[11px] font-mono font-bold transition-all duration-200 active:scale-95"
                        title="Calculadora de Discos y Calentamiento"
                      >
                        <Disc className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span>Discos</span>
                      </button>

                      <button
                        onClick={() =>
                          setDrawerExercise({
                            slug: workoutExercise.exercise.slug,
                            name: workoutExercise.exercise.name,
                            muscleGroup: workoutExercise.exercise.muscleGroup,
                            initialWeight: sets[0]?.actualWeightKg,
                          })
                        }
                        className="min-h-[44px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 text-[11px] font-mono font-bold transition-all duration-200 active:scale-95"
                        title="Calcular 1RM y Tablas M&R"
                      >
                        <Calculator className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span>M&R</span>
                      </button>

                      <button
                        onClick={() =>
                          setGuideDrawerData({
                            name: workoutExercise.exercise.name,
                            slug: workoutExercise.exercise.slug,
                            muscleGroup: workoutExercise.exercise.muscleGroup,
                            technicalNotes: workoutExercise.technicalNotes,
                          })
                        }
                        className="min-h-[44px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 text-[11px] font-mono font-bold transition-all duration-200 active:scale-95"
                        title="Guía Técnica & Biomecánica"
                      >
                        <BookOpen className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span>Guía</span>
                      </button>
                    </div>
                  </div>

                  {/* Visualizador Biomecánico Remotion con HUD y Tempo */}
                  <div className="mb-4">
                    <ExerciseVisualizer
                      exerciseName={workoutExercise.exercise.name}
                      exerciseSlug={workoutExercise.exercise.slug}
                      muscleGroup={workoutExercise.exercise.muscleGroup}
                      videoUrl={workoutExercise.exercise.videoPath}
                      tempo={workoutExercise.tempo || "3-1-X-1"}
                      notes={workoutExercise.technicalNotes}
                      isCluster={isClusterExercise}
                      themeAccent={accentColor}
                    />
                  </div>

                  {/* Tabla de Series Cero-Teclado */}
                  <div className="space-y-2.5">
                    {sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className={cn(
                          "rounded-2xl p-2.5 sm:p-3 border transition-all duration-300",
                          set.isCompleted
                            ? "bg-zinc-950/90 border-emerald-500/60 shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30"
                            : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className="grid grid-cols-[36px_1fr_1fr_48px] items-center gap-2">
                          {/* Número de Serie */}
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-xs font-mono tabular-nums font-black text-zinc-400">
                              S{set.setNumber}
                            </span>
                            {set.isCompleted && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                            )}
                          </div>

                          {/* Control KILOS (Cero-Teclado) */}
                          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center justify-between gap-1 min-w-0">
                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustWeight(workoutExercise.id, setIndex, -2.5)
                              }
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-base text-zinc-100 flex items-center justify-center p-0 transition-all duration-200 active:scale-95 disabled:opacity-30 shrink-0"
                            >
                              -
                            </button>

                            <div
                              onClick={() =>
                                setPlateDrawerData({
                                  exerciseName: workoutExercise.exercise.name,
                                  weightKg: set.actualWeightKg,
                                })
                              }
                              className="text-center px-0.5 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 flex-1 min-w-0"
                              title="Pulsar para calcular discos y ver aproximación"
                            >
                              <div className="font-mono tabular-nums text-lg font-bold text-white whitespace-nowrap leading-none flex items-baseline justify-center gap-0.5">
                                <span>{set.actualWeightKg}</span>
                                <span className="text-[10px] text-zinc-400 font-normal">kg</span>
                              </div>
                              {set.historicalWeightKg ? (
                                <span className="text-[11px] font-mono tabular-nums text-zinc-400 block mt-0.5 whitespace-nowrap truncate">
                                  ant: {set.historicalWeightKg}kg
                                </span>
                              ) : null}
                            </div>

                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustWeight(workoutExercise.id, setIndex, 2.5)
                              }
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-base text-zinc-100 flex items-center justify-center p-0 transition-all duration-200 active:scale-95 disabled:opacity-30 shrink-0"
                            >
                              +
                            </button>
                          </div>

                          {/* Control REPS (Cero-Teclado) */}
                          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center justify-between gap-1 min-w-0">
                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustReps(workoutExercise.id, setIndex, -1)
                              }
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-base text-zinc-100 flex items-center justify-center p-0 transition-all duration-200 active:scale-95 disabled:opacity-30 shrink-0"
                            >
                              -
                            </button>

                            <div className="text-center px-0.5 flex-1 min-w-0">
                              <div className="font-mono tabular-nums text-lg font-bold text-white whitespace-nowrap leading-none flex items-baseline justify-center gap-0.5">
                                <span>{set.actualReps}</span>
                                <span className="text-[10px] text-zinc-400 font-normal">rep</span>
                              </div>
                              {set.historicalReps ? (
                                <span className="text-[11px] font-mono tabular-nums text-zinc-400 block mt-0.5 whitespace-nowrap truncate">
                                  ant: {set.historicalReps}r
                                </span>
                              ) : null}
                            </div>

                            <button
                              disabled={set.isCompleted}
                              onClick={() =>
                                adjustReps(workoutExercise.id, setIndex, 1)
                              }
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-base text-zinc-100 flex items-center justify-center p-0 transition-all duration-200 active:scale-95 disabled:opacity-30 shrink-0"
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
                              "w-11 h-11 min-w-[44px] rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 shrink-0 justify-self-center",
                              set.isCompleted
                                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 font-black"
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
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono tabular-nums font-black text-xl text-black animate-pulse shadow-lg"
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
                    <span className="text-base font-black text-white font-mono tabular-nums">
                      Repetición {clusterCurrentRep} de {clusterTotalReps}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={nextClusterRepManual}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all duration-200 active:scale-95"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={stopClusterTimer}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-200 active:scale-95"
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
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono tabular-nums font-black text-lg text-black shadow-lg"
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
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm"
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
          muscleGroup={drawerExercise.muscleGroup}
          initialWeight={drawerExercise.initialWeight}
        />
      )}

      {/* Drawer Calculadora de Discos & Series de Calentamiento */}
      {plateDrawerData && (
        <PlateCalculatorDrawer
          isOpen={Boolean(plateDrawerData)}
          onClose={() => setPlateDrawerData(null)}
          exerciseName={plateDrawerData.exerciseName}
          initialWeightKg={plateDrawerData.weightKg}
        />
      )}

      {/* Drawer Guía Técnica & Biomecánica (ExerciseAPI.dev) */}
      {guideDrawerData && (
        <ExerciseTechnicalGuideDrawer
          isOpen={Boolean(guideDrawerData)}
          onClose={() => setGuideDrawerData(null)}
          exerciseName={guideDrawerData.name}
          exerciseSlug={guideDrawerData.slug}
          muscleGroup={guideDrawerData.muscleGroup}
          technicalNotes={guideDrawerData.technicalNotes}
          themeAccent={accentColor}
        />
      )}

      {/* Modal / Drawer de Vuelta a la Calma */}
      <CooldownModal
        isOpen={isCooldownOpen}
        onClose={() => setIsCooldownOpen(false)}
        onConfirmFinish={({ cooldownType, durationMinutes }) => {
          setIsCooldownOpen(false);
          finishWorkout({ cooldownType, durationMinutes });
        }}
        workoutName={`${activeMesocycle.name} · ${activeWorkout.name}`}
        elapsedSeconds={60 * 45} // Duración estimada estándar
        totalVolumeKg={totalVolumeKg}
        completedSetsCount={completedSetsCount}
      />
    </div>
  );
};
