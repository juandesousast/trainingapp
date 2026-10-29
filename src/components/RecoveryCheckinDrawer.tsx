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
          notes: `Sueño: ${sleepQuality}, DOMS: ${domsLevel}, Agua: ${waterIntake}, Pasos: ${dailySteps}`,
        },
        { onConflict: "profile_id,log_date" }
      );

      await refreshStats();
    } catch (err) {
      console.warn("Aviso al guardar daily_habits:", err);
    }

    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-6 max-w-md mx-auto outline-none max-h-[90vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-5" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Check-in de Recuperación (DIARIO)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-6">
            Registra tu estado de recuperación diario según la pestaña DIARIO del sistema Hoplita para modular el volumen e intensidad.
          </p>

          <form onSubmit={handleSave} className="space-y-5">
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

            <button
              type="submit"
              className="w-full mt-6 min-h-[52px] py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Guardar Check-in de Recuperación</span>
            </button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
