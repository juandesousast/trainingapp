"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { useProfileStore } from "@/stores/useProfileStore";
import { Wind, Clock, Check, Trophy, Heart, Activity, Flame } from "lucide-react";
import { cn, formatSecondsToMinutes } from "@/lib/utils";

interface CooldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: (cooldownData: {
    cooldownType: string;
    durationMinutes: number;
    notes?: string;
  }) => void;
  workoutName: string;
  elapsedSeconds: number;
  totalVolumeKg: number;
  completedSetsCount: number;
}

const COOLDOWN_TYPES = [
  {
    id: "cardio_liss",
    label: "Cardio LISS",
    desc: "Bici suave o cinta ritmo regenerativo",
    icon: Activity,
  },
  {
    id: "mobility",
    label: "Movilidad Articular",
    desc: "Caderas, tobillos y columna torácica",
    icon: Wind,
  },
  {
    id: "stretching",
    label: "Estiramientos",
    desc: "Fascias y grupos musculares principales",
    icon: Heart,
  },
  {
    id: "foam_roller",
    label: "Foam Roller",
    desc: "Liberación miofascial profunda",
    icon: Flame,
  },
];

const DURATION_OPTIONS = [5, 10, 15, 20];

export const CooldownModal: React.FC<CooldownModalProps> = ({
  isOpen,
  onClose,
  onConfirmFinish,
  workoutName,
  elapsedSeconds,
  totalVolumeKg,
  completedSetsCount,
}) => {
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const [selectedType, setSelectedType] = useState<string>("cardio_liss");
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [skipCooldown, setSkipCooldown] = useState<boolean>(false);

  const handleFinish = () => {
    onConfirmFinish({
      cooldownType: skipCooldown ? "Ninguno" : selectedType,
      durationMinutes: skipCooldown ? 0 : durationMinutes,
    });
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-md z-50" />
        <Drawer.Content className="max-h-[90dvh] flex flex-col bg-zinc-950 border-t border-zinc-800 rounded-t-[28px] overflow-hidden fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none">
          {/* Manija */}
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto my-3 shrink-0" />

          {/* Cuerpo desplazable */}
          <div className="flex-1 overflow-y-auto px-5 pt-1 pb-8 overscroll-contain touch-pan-y">
            {/* Encabezado */}
            <div className="text-center mb-5">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-xl"
                style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
              >
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                ¡Entrenamiento Completado!
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {workoutName} · Cierre y Vuelta a la Calma BIIO
              </p>
            </div>

            {/* Resumen de la Sesión */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 mb-5 text-center">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Tiempo
                </span>
                <span className="text-sm font-mono tabular-nums font-black text-white">
                  {formatSecondsToMinutes(elapsedSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Volumen Total
                </span>
                <span
                  className="text-sm font-mono tabular-nums font-black"
                  style={{ color: accentColor }}
                >
                  {Math.round(totalVolumeKg)} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Series Hechas
                </span>
                <span className="text-sm font-mono tabular-nums font-black text-white">
                  {completedSetsCount}
                </span>
              </div>
            </div>

            {/* Vuelta a la Calma */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-4 h-4" style={{ color: accentColor }} />
                  <span>Protocolo de Enfriamiento</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSkipCooldown(!skipCooldown)}
                  className="min-h-[36px] px-2 flex items-center text-[11px] font-mono font-bold text-zinc-400 hover:text-zinc-200 underline transition-colors"
                >
                  {skipCooldown ? "Incluir enfriamiento" : "Saltar enfriamiento"}
                </button>
              </div>

              {!skipCooldown ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {COOLDOWN_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={cn(
                            "min-h-[60px] p-3 rounded-2xl border text-left transition-all duration-200 active:scale-95",
                            isSelected
                              ? "bg-zinc-900 shadow-md border-white"
                              : "bg-zinc-950 border-zinc-800 hover:bg-zinc-900"
                          )}
                          style={{
                            borderColor: isSelected ? accentColor : undefined,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              className="w-4 h-4"
                              style={{ color: isSelected ? accentColor : "#A1A1AA" }}
                            />
                            <span
                              className="text-xs font-mono font-black truncate"
                              style={{ color: isSelected ? accentColor : "#FFFFFF" }}
                            >
                              {type.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 line-clamp-1">
                            {type.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Duración */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        Duración:
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {DURATION_OPTIONS.map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => setDurationMinutes(min)}
                          className={cn(
                            "min-w-[40px] min-h-[40px] rounded-xl text-xs font-mono tabular-nums font-bold transition-all duration-200 active:scale-95 flex items-center justify-center",
                            durationMinutes === min
                              ? "text-black font-extrabold shadow-sm"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          )}
                          style={{
                            backgroundColor:
                              durationMinutes === min ? accentColor : undefined,
                          }}
                        >
                          {min}&apos;
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-4 text-center">
                  <span className="text-xs font-mono text-zinc-400 block">
                    Has marcado sin vuelta a la calma en esta sesión.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Barra Inferior Fija de Acción (Sticky Bottom con Safe Area) */}
          <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-md px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] border-t border-zinc-900 shrink-0">
            <button
              onClick={handleFinish}
              className="w-full min-h-[50px] py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-2xl transition-all duration-200 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Guardar y Cerrar Entrenamiento</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
