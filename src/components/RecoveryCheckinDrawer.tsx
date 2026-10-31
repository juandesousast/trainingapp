"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { supabase } from "@/lib/supabase";
import { toLocalDateString } from "@/lib/activityStats";
import { HeartPulse, Check, X, Moon, Droplets, Zap, Footprints, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecoveryCheckinDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryCheckinDrawer: React.FC<RecoveryCheckinDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { addRecoveryCheckin } = useBiometricsStore();
  const { activeProfile, refreshStats } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [sleepQuality, setSleepQuality] = useState<"Muy profundo" | "Reparador" | "Normal" | "Ligero" | "Imposible">("Reparador");
  const [domsLevel, setDomsLevel] = useState<"Sin dolor" | "Leve" | "Moderado" | "Intenso" | "Incapacitante">("Leve");
  const [waterIntake, setWaterIntake] = useState<"1L" | "2L" | "3L" | "4L" | "+5L">("3L");
  const [motivation, setMotivation] = useState<"Máximas" | "Altas" | "Normal" | "Pocas" | "Nulas">("Altas");
  const [dailySteps, setDailySteps] = useState<"+10k" | "8k-10k" | "6k-8k" | "4k-6k" | "-4k">("+10k");

  const sleepOptions: ("Muy profundo" | "Reparador" | "Normal" | "Ligero" | "Imposible")[] = [
    "Muy profundo",
    "Reparador",
    "Normal",
    "Ligero",
    "Imposible",
  ];

  const domsOptions: ("Sin dolor" | "Leve" | "Moderado" | "Intenso" | "Incapacitante")[] = [
    "Sin dolor",
    "Leve",
    "Moderado",
    "Intenso",
    "Incapacitante",
  ];

  const waterOptions: ("1L" | "2L" | "3L" | "4L" | "+5L")[] = [
    "1L",
    "2L",
    "3L",
    "4L",
    "+5L",
  ];

  const motivationOptions: ("Máximas" | "Altas" | "Normal" | "Pocas" | "Nulas")[] = [
    "Máximas",
    "Altas",
    "Normal",
    "Pocas",
    "Nulas",
  ];

  const stepsOptions: ("+10k" | "8k-10k" | "6k-8k" | "4k-6k" | "-4k")[] = [
    "+10k",
    "8k-10k",
    "6k-8k",
    "4k-6k",
    "-4k",
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    addRecoveryCheckin({
      profileId: activeProfile.id,
      date: `Hoy · ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`,
      sleepQuality,
      domsLevel,
      waterIntake,
      motivation,
      dailySteps,
    });

    try {
      const todayStr = toLocalDateString(new Date());
      await supabase.from("daily_habits").upsert(
        {
          profile_id: activeProfile.id,
          log_date: todayStr,
          sleep_hours:
            sleepQuality === "Muy profundo"
              ? 9
              : sleepQuality === "Reparador"
              ? 8
              : sleepQuality === "Normal"
              ? 7
              : 6,
          psychological_condition:
            motivation === "Máximas"
              ? 1
              : motivation === "Altas"
              ? 2
              : motivation === "Normal"
              ? 3
              : 4,
          session_rpe: domsLevel === "Incapacitante" ? 9 : domsLevel === "Intenso" ? 8 : 7,
          notes: `Sueño: ${sleepQuality}, DOMS: ${domsLevel}, Agua: ${waterIntake}, Pasos: ${dailySteps}`,
        },
        { onConflict: "profile_id,log_date" }
      );

      await refreshStats();
    } catch (err) {
      console.warn("Aviso al guardar hábito diario en Supabase:", err);
    }

    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Drawer.Content className="max-h-[90dvh] flex flex-col bg-zinc-950 border-t border-zinc-800 rounded-t-[28px] overflow-hidden fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none">
          {/* Handle superior visible */}
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto my-3 shrink-0" />

          {/* Cabecera Fija */}
          <div className="px-5 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5" style={{ color: accentColor }} />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Check-in de Recuperación (DIARIO)
                </h2>
              </div>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Registra tu estado de recuperación diario según la pestaña DIARIO del sistema Hoplita para modular el volumen e intensidad.
            </p>
          </div>

          {/* Cuerpo desplazable con Safe Area */}
          <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8 overscroll-contain touch-pan-y space-y-5">
              {/* 1. Calidad de Sueño */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Calidad de Sueño</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {sleepOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSleepQuality(opt)}
                      className={cn(
                        "min-h-[44px] py-2 px-1 rounded-xl text-[10px] font-mono font-black text-center truncate transition-all duration-200 active:scale-95 flex items-center justify-center",
                        sleepQuality === opt
                          ? "text-black shadow-md font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      style={{
                        backgroundColor: sleepQuality === opt ? accentColor : undefined,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Nivel de Agujetas (DOMS) */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nivel de Agujetas</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {domsOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setDomsLevel(opt)}
                      className={cn(
                        "min-h-[44px] py-2 px-1 rounded-xl text-[10px] font-mono font-black text-center truncate transition-all duration-200 active:scale-95 flex items-center justify-center",
                        domsLevel === opt
                          ? "text-black shadow-md font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      style={{
                        backgroundColor: domsLevel === opt ? accentColor : undefined,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Ingesta de Agua */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ingesta de Agua</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {waterOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setWaterIntake(opt)}
                      className={cn(
                        "min-h-[44px] py-2 rounded-xl text-xs font-mono tabular-nums font-black text-center transition-all duration-200 active:scale-95 flex items-center justify-center",
                        waterIntake === opt
                          ? "text-black shadow-md font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      style={{
                        backgroundColor: waterIntake === opt ? accentColor : undefined,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ganas de Entrenar */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ganas de Entrenar</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {motivationOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setMotivation(opt)}
                      className={cn(
                        "min-h-[44px] py-2 px-1 rounded-xl text-[10px] font-mono font-black text-center truncate transition-all duration-200 active:scale-95 flex items-center justify-center",
                        motivation === opt
                          ? "text-black shadow-md font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      style={{
                        backgroundColor: motivation === opt ? accentColor : undefined,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Pasos Diarios */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase mb-2">
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pasos Diarios (Actividad NEAT)</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {stepsOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setDailySteps(opt)}
                      className={cn(
                        "min-h-[44px] py-2 rounded-xl text-[10px] font-mono tabular-nums font-black text-center transition-all duration-200 active:scale-95 flex items-center justify-center",
                        dailySteps === opt
                          ? "text-black shadow-md font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      style={{
                        backgroundColor: dailySteps === opt ? accentColor : undefined,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra Inferior Fija de Acción (Sticky Bottom con Safe Area) */}
            <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-md px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] border-t border-zinc-900 shrink-0">
              <button
                type="submit"
                className="w-full min-h-[50px] py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Guardar Check-in de Recuperación</span>
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
