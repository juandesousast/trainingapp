"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { NutritionGoal } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
  User,
  X,
  Check,
  Ruler,
  Target,
  Flame,
  Zap,
  Dumbbell,
  Minus,
  Plus,
  Sparkles,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProgramExercise {
  id: string;
  slug: string;
  name: string;
  muscleGroup: string;
  defaultKg: number;
}

const MALE_EXERCISES: ProgramExercise[] = [
  {
    id: "b722e036-ec24-4de0-8d9a-ceb263c8433b",
    slug: "box_squat",
    name: "Box Squat",
    muscleGroup: "Piernas / Glúteos",
    defaultKg: 120,
  },
  {
    id: "d4aa5b02-6743-4d3d-9fc9-9e5c11fe0bf1",
    slug: "bench_press",
    name: "Press Banca Plano",
    muscleGroup: "Pectoral / Tríceps",
    defaultKg: 100,
  },
  {
    id: "f5216b32-5241-425a-bdcd-1d7a83bb289f",
    slug: "deadlift",
    name: "Peso Muerto",
    muscleGroup: "Cadena Posterior",
    defaultKg: 160,
  },
  {
    id: "e1e31e4b-89a8-4ab0-857e-770c252e3403",
    slug: "barbell_row",
    name: "Remo con Barra",
    muscleGroup: "Espalda / Dorsal",
    defaultKg: 85,
  },
  {
    id: "1cfd9b80-77f4-4c71-a35b-609e84ca7806",
    slug: "military_press",
    name: "Press Militar",
    muscleGroup: "Hombros",
    defaultKg: 65,
  },
];

const FEMALE_EXERCISES: ProgramExercise[] = [
  {
    id: "b722e036-ec24-4de0-8d9a-ceb263c8433b",
    slug: "box_squat",
    name: "Box Squat",
    muscleGroup: "Piernas / Glúteos",
    defaultKg: 60,
  },
  {
    id: "3b1a2a9d-447e-41f0-9533-a43683e606b5",
    slug: "seated_military_press",
    name: "Press Militar Sentada",
    muscleGroup: "Hombros",
    defaultKg: 30,
  },
  {
    id: "8c2ae95f-5710-444c-ac6e-ecc51847cf51",
    slug: "hip_thrust",
    name: "Hip Thrust",
    muscleGroup: "Glúteos / Femorales",
    defaultKg: 90,
  },
  {
    id: "3d5c7bcd-e48e-421a-805b-59bb8a33c040",
    slug: "landmine_row",
    name: "Remo Landmine",
    muscleGroup: "Espalda",
    defaultKg: 35,
  },
  {
    id: "f5216b32-5241-425a-bdcd-1d7a83bb289f",
    slug: "deadlift",
    name: "Peso Muerto",
    muscleGroup: "Cadena Posterior",
    defaultKg: 70,
  },
];

interface NutritionGoalOption {
  id: NutritionGoal;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

const NUTRITION_GOAL_OPTIONS: NutritionGoalOption[] = [
  {
    id: "fat_loss",
    label: "Definición / Grasa",
    badge: "Déficit -18%",
    description: "Máxima oxidación adiposa manteniendo masa magra.",
    icon: Flame,
  },
  {
    id: "recomp",
    label: "Recomposición BIIO",
    badge: "Normo / -8%",
    description: "100% TDEE en entreno · Déficit -8% en descanso.",
    icon: Zap,
  },
  {
    id: "maintenance",
    label: "Mantenimiento",
    badge: "100% TDEE",
    description: "Consolidación y balance calórico neutro.",
    icon: Target,
  },
  {
    id: "hypertrophy",
    label: "Volumen Limpio",
    badge: "Superávit +8%",
    description: "Superávit para máxima síntesis de hipertrofia.",
    icon: Dumbbell,
  },
];

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { authUserId, activeProfile, updateProfileGoals } = useProfileStore();
  const { userMaxes, setUserMaxes } = useWorkoutSessionStore();

  const accentColor = activeProfile.themeAccent;
  const isFemale = activeProfile.gender === "female" || activeProfile.role === "hoplita_girl";
  const exercises = isFemale ? FEMALE_EXERCISES : MALE_EXERCISES;

  // Estado Antropométrico
  const [heightCm, setHeightCm] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [targetBodyFatPct, setTargetBodyFatPct] = useState("");

  // Estado de Objetivo Nutricional
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>("fat_loss");

  // Estado de 1RM
  const [oneRms, setOneRms] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializar estado cuando se abre el drawer
  useEffect(() => {
    if (isOpen) {
      setHeightCm(activeProfile.heightCm ? String(activeProfile.heightCm) : "");
      setTargetWeightKg(activeProfile.targetWeightKg ? String(activeProfile.targetWeightKg) : "");
      setTargetBodyFatPct(
        activeProfile.targetBodyFatPct !== undefined ? String(activeProfile.targetBodyFatPct) : ""
      );
      setNutritionGoal(activeProfile.nutritionGoal || "fat_loss");

      // Cargar 1RMs iniciales desde el store o defaults
      const initialMaxes: Record<string, number> = {};
      exercises.forEach((ex) => {
        initialMaxes[ex.slug] = userMaxes[ex.slug] || ex.defaultKg;
      });
      setOneRms(initialMaxes);
      setSaveSuccess(false);
    }
  }, [isOpen, activeProfile, userMaxes, exercises]);

  const handleAdjust1RM = (slug: string, delta: number) => {
    setOneRms((prev) => {
      const current = prev[slug] ?? 50;
      const next = Math.max(10, Math.round((current + delta) * 2) / 2);
      return { ...prev, [slug]: next };
    });
  };

  const handle1RMChange = (slug: string, valueStr: string) => {
    const val = parseFloat(valueStr);
    setOneRms((prev) => ({
      ...prev,
      [slug]: isNaN(val) ? 0 : val,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Resolver IDs reales de usuario y perfil de forma garantizada
      let currentUserId = authUserId;
      let currentProfileId = activeProfile.id;

      if (!currentUserId || currentProfileId === "1") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          const { data: prof } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (prof?.id) {
            currentProfileId = prof.id;
          }
        }
      }

      // 2. Guardar metas antropométricas en profiles
      const parsedHeight = heightCm ? parseFloat(heightCm) : null;
      const parsedWeight = targetWeightKg ? parseFloat(targetWeightKg) : undefined;
      const parsedFat = targetBodyFatPct ? parseFloat(targetBodyFatPct) : activeProfile.targetBodyFatPct;

      await updateProfileGoals(parsedFat, parsedWeight, parsedHeight, nutritionGoal);

      // 3. Guardar 1RM en user_maxes
      if (currentUserId && currentProfileId && currentProfileId !== "1") {
        const recordsToUpsert = exercises.map((ex) => ({
          profile_id: currentProfileId,
          exercise_id: ex.id,
          user_id: currentUserId,
          one_rm_kg: oneRms[ex.slug] || ex.defaultKg,
          calculation_method: "tested",
          tested_at: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from("user_maxes")
          .upsert(recordsToUpsert, { onConflict: "profile_id,exercise_id" });

        if (error) {
          console.error("Error upserting user_maxes:", error);
        }
      }

      // 4. Actualizar store de sesión de entrenamiento
      setUserMaxes(oneRms);

      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error saving profile adjustments:", err);
      setIsSaving(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" />
        <Drawer.Content className="max-h-[90dvh] flex flex-col rounded-t-[28px] border-t border-zinc-800 bg-zinc-950 p-0 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none overflow-hidden">
          {/* Handle superior visible */}
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto my-3 shrink-0" />

          {/* Header fijo superior */}
          <div className="px-5 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-black text-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    {activeProfile.displayName}
                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                      }}
                    >
                      {activeProfile.role?.replace("_", " ") || "ATLETA"}
                    </span>
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
                aria-label="Cerrar ajustes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-snug">
              Calibra tus datos antropométricos y las cargas 1RM que rigen las series de tu entrenamiento.
            </p>
          </div>

          {/* Cuerpo con scroll fluido */}
          <form noValidate onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8 overscroll-contain touch-pan-y space-y-6">
              {/* SECCIÓN 1: DATOS ANTROPOMÉTRICOS & METAS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" style={{ color: accentColor }} />
                  <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                    Datos Antropométricos y Metas
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Altura */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                    <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="100"
                      max="250"
                      placeholder="180"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-black text-base focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Meta de Peso */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                    <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      Meta Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="40"
                      max="150"
                      placeholder="80.0"
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-black text-base focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Meta % Grasa */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                    <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      Meta % Grasa
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="5"
                      max="40"
                      placeholder={isFemale ? "21.0" : "16.0"}
                      value={targetBodyFatPct}
                      onChange={(e) => setTargetBodyFatPct(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-black text-base focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: OBJETIVO NUTRICIONAL ACTUAL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4" style={{ color: accentColor }} />
                    <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                      Objetivo Nutricional Actual
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Ajuste dinámico TDEE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {NUTRITION_GOAL_OPTIONS.map((opt) => {
                    const isSelected = nutritionGoal === opt.id;
                    const Icon = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNutritionGoal(opt.id)}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 active:scale-98 select-none relative overflow-hidden",
                          isSelected
                            ? "bg-zinc-900 border-zinc-600 shadow-md ring-1 ring-white/10"
                            : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100"
                        )}
                        style={{
                          borderColor: isSelected ? accentColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isSelected ? `${accentColor}25` : "#27272A",
                              color: isSelected ? accentColor : "#A1A1AA",
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <span
                            className={cn(
                              "text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none",
                              isSelected
                                ? "bg-white/10 text-white"
                                : "bg-zinc-900 text-zinc-400"
                            )}
                          >
                            {opt.badge}
                          </span>
                        </div>

                        <div>
                          <span
                            className={cn(
                              "text-xs font-bold block leading-tight",
                              isSelected ? "text-white" : "text-zinc-300"
                            )}
                          >
                            {opt.label}
                          </span>
                          <p className="text-[9px] text-zinc-400 leading-snug mt-1 line-clamp-2">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN 3: GESTOR DE 1RM BASE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" style={{ color: accentColor }} />
                    <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                      Gestor de 1RM Base (Fuerza Máxima)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">kg</span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Calcula automáticamente las pirámides (60%, 65%, 70%) y clústers de tu mesociclo.
                </p>

                <div className="space-y-2">
                  {exercises.map((ex) => {
                    const currentVal = oneRms[ex.slug] ?? ex.defaultKg;
                    return (
                      <div
                        key={ex.slug}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        {/* Nombre y grupo */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                            {ex.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {ex.muscleGroup}
                          </span>
                        </div>

                        {/* Controles táctiles de peso */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Botón Restar */}
                          <button
                            type="button"
                            onClick={() => handleAdjust1RM(ex.slug, -2.5)}
                            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-base active:scale-95 transition-transform"
                            aria-label={`Reducir 1RM de ${ex.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          {/* Input numérico directo */}
                          <div className="relative w-16">
                            <input
                              type="number"
                              step="any"
                              min="10"
                              max="350"
                              value={currentVal || ""}
                              onChange={(e) => handle1RMChange(ex.slug, e.target.value)}
                              className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-xl text-center text-white font-mono font-black text-base focus:outline-none focus:border-zinc-500"
                            />
                          </div>

                          {/* Botón Sumar */}
                          <button
                            type="button"
                            onClick={() => handleAdjust1RM(ex.slug, 2.5)}
                            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-base active:scale-95 transition-transform"
                            aria-label={`Aumentar 1RM de ${ex.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Fijo con Botón Guardar */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <button
                type="submit"
                disabled={isSaving}
                className={cn(
                  "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 shadow-lg",
                  saveSuccess
                    ? "bg-emerald-500 text-black"
                    : isFemale
                    ? "bg-[#F43F5E] text-white hover:bg-[#E11D48]"
                    : "bg-[#CCFF00] text-black hover:bg-[#B8E600]"
                )}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Guardando Ajustes...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ajustes Guardados con Éxito</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar Ajustes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
