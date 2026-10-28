"use client";

import React, { useState } from "react";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { Moon, Smile, Activity, Star, Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const DailyCheckinView: React.FC = () => {
  const { dailyHabits, addDailyHabit } = useBiometricsStore();
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [sleepHours, setSleepHours] = useState<string>("8");
  const [psychologicalCondition, setPsychologicalCondition] = useState<number>(1);
  const [sessionRpe, setSessionRpe] = useState<number>(8);
  const [workoutQuality, setWorkoutQuality] = useState<number>(9);
  const [notes, setNotes] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const sleepOptions = ["6 o menos", "7", "8", "9", "10+"];

  const psychoOptions = [
    { val: 1, label: "1 · Óptima" },
    { val: 2, label: "2 · Buena" },
    { val: 3, label: "3 · Normal" },
    { val: 4, label: "4 · Baja" },
    { val: 5, label: "5 · Negativa" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    addDailyHabit({
      profileId: activeProfile.id,
      date: `Hoy · ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`,
      sleepHours,
      psychologicalCondition,
      sessionRpe,
      workoutQuality,
      notes: notes.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    setNotes("");
  };

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto px-4">
      {/* Cabecera */}
      <div>
        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest block">
          PESTAÑA DIARIO · EXCEL
        </span>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Check-in Diario del Hoplita
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Monitorea el descanso, la disposición mental y el esfuerzo subjetivo de la sesión.
        </p>
      </div>

      {/* Formulario Check-in */}
      <form onSubmit={handleSave} className="space-y-5 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        {/* 1. Horas de Sueño */}
        <div>
          <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Horas de Sueño</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {sleepOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setSleepHours(opt)}
                className={cn(
                  "py-2 rounded-xl text-xs font-mono font-black transition-all",
                  sleepHours === opt
                    ? "text-black shadow-md"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                )}
                style={{
                  backgroundColor: sleepHours === opt ? accentColor : undefined,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Condición Psicológica (1 Óptima a 5 Muy Negativa) */}
        <div>
          <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>Condición Psicológica</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {psychoOptions.map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setPsychologicalCondition(opt.val)}
                className={cn(
                  "py-2 px-1 rounded-xl text-[10px] font-mono font-black transition-all text-center leading-tight truncate",
                  psychologicalCondition === opt.val
                    ? "text-black shadow-md"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                )}
                style={{
                  backgroundColor:
                    psychologicalCondition === opt.val ? accentColor : undefined,
                }}
              >
                {opt.label.split(" · ")[0]}
                <span className="block text-[8px] font-normal opacity-80">
                  {opt.label.split(" · ")[1]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. RPE de la Sesión (1-10) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>RPE de la Sesión (1 a 10)</span>
            </label>
            <span
              className="text-xs font-mono font-black px-2 py-0.5 rounded-md text-black"
              style={{ backgroundColor: accentColor }}
            >
              RPE {sessionRpe}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setSessionRpe(num)}
                className={cn(
                  "py-2 rounded-lg text-xs font-mono font-black transition-all",
                  sessionRpe === num
                    ? "text-black shadow-md"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                )}
                style={{
                  backgroundColor: sessionRpe === num ? accentColor : undefined,
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Calidad del Entrenamiento (1-10) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Calidad del Entreno (1 a 10)</span>
            </label>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200">
              {workoutQuality} / 10
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setWorkoutQuality(num)}
                className={cn(
                  "py-2 rounded-lg text-xs font-mono font-black transition-all",
                  workoutQuality === num
                    ? "bg-zinc-200 text-black shadow-md font-extrabold"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Notas Adicionales */}
        <div>
          <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1.5">
            Sensaciones y Notas de la Sesión
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Buena velocidad de barra en Box Squat. Recuperación rápida en el Tri-Set."
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>¡Check-in Registrado!</span>
            </>
          ) : (
            <span>Guardar Check-in de Hoy</span>
          )}
        </button>
      </form>

      {/* Historial de Check-ins Previos */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono px-1">
          Historial de Registros
        </h3>

        <div className="space-y-2.5">
          {dailyHabits.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  {item.date}
                </span>
                <span
                  className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full text-black"
                  style={{ backgroundColor: accentColor }}
                >
                  RPE {item.sessionRpe} · Calidad {item.workoutQuality}/10
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span>Sueño: <strong className="text-zinc-200">{item.sleepHours}h</strong></span>
                <span>Psicológico: <strong className="text-zinc-200">{item.psychologicalCondition}/5</strong></span>
              </div>

              {item.notes && (
                <p className="text-xs text-zinc-400 italic pt-1 border-t border-zinc-800/60">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
