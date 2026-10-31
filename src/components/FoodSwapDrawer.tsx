"use client";

import React from "react";
import { Drawer } from "vaul";
import {
  Check,
  Scale,
  Sparkles,
  Info,
  Beef,
  Wheat,
  Droplets,
  ArrowRightLeft,
} from "lucide-react";
import {
  FoodItem,
  MacroCategory,
  getFoodsByCategory,
  calculateFoodPortion,
} from "@/lib/food-database";
import { soundEngine } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface FoodSwapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: MacroCategory;
  mealId: string;
  mealName: string;
  mealSubtitle: string;
  targetMacroGrams: number;
  currentFoodId: string;
  themeAccent?: string;
  onSelectFood: (foodId: string) => void;
}

export const FoodSwapDrawer: React.FC<FoodSwapDrawerProps> = ({
  isOpen,
  onClose,
  category,
  mealName,
  mealSubtitle,
  targetMacroGrams,
  currentFoodId,
  themeAccent = "#CCFF00",
  onSelectFood,
}) => {
  const foods = getFoodsByCategory(category);

  const categoryMeta = {
    protein: {
      label: "Proteína",
      tag: "PROTEÍNA MAGRA",
      color: "#22D3EE", // cyan-400
      bg: "rgba(34, 211, 238, 0.12)",
      border: "rgba(34, 211, 238, 0.3)",
      icon: Beef,
    },
    carbs: {
      label: "Carbohidratos",
      tag: "CARBOHIDRATO COMPLEJO",
      color: "#FBBF24", // amber-400
      bg: "rgba(251, 191, 36, 0.12)",
      border: "rgba(251, 191, 36, 0.3)",
      icon: Wheat,
    },
    fats: {
      label: "Grasas Saludables",
      tag: "GRASA ESENCIAL",
      color: "#FB7185", // rose-400
      bg: "rgba(251, 113, 133, 0.12)",
      border: "rgba(251, 113, 133, 0.3)",
      icon: Droplets,
    },
  }[category];

  const CategoryIcon = categoryMeta.icon;

  const handleSelect = (foodId: string) => {
    soundEngine.playTap();
    onSelectFood(foodId);
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] max-h-[88vh] flex flex-col focus:outline-none shadow-2xl">
          {/* Barra de Arrastre */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-800 my-3" />

          {/* Encabezado del Drawer */}
          <div className="px-5 pb-3 border-b border-zinc-900 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider"
                style={{
                  backgroundColor: categoryMeta.bg,
                  color: categoryMeta.color,
                  border: `1px solid ${categoryMeta.border}`,
                }}
              >
                <CategoryIcon className="w-3 h-3" />
                {categoryMeta.tag}
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                MERCADO ESPAÑA
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Sustituir Alimento</span>
                  <ArrowRightLeft className="w-4 h-4 text-zinc-500" />
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {mealName} ({mealSubtitle}) · Objetivo exacto:{" "}
                  <strong className="text-white font-mono">{targetMacroGrams}g</strong> de {categoryMeta.label.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-zinc-400">
              <Scale className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span>
                El motor calcula los gramos exactos a poner en tu báscula de cocina para no alterar tus macros diarios.
              </span>
            </div>
          </div>

          {/* Lista de Alimentos Equivalentes */}
          <div className="overflow-y-auto px-4 py-3 space-y-2 flex-1">
            {foods.map((food) => {
              const portion = calculateFoodPortion(targetMacroGrams, category, food);
              const isSelected = food.id === currentFoodId;

              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelect(food.id)}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 active:scale-[0.98]",
                    isSelected
                      ? "bg-zinc-900 border-zinc-700 shadow-lg"
                      : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700/80"
                  )}
                  style={{
                    borderColor: isSelected ? categoryMeta.color : undefined,
                    boxShadow: isSelected ? `0 4px 20px -8px ${categoryMeta.color}40` : undefined,
                  }}
                >
                  {/* Izquierda: Emoji + Nombre + Nota de supermercado */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                      {food.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                          {food.shortName}
                        </span>
                        {isSelected && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: categoryMeta.color }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {food.commercialNote || food.name}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 mt-1">
                        <span>{portion.calories} kcal</span>
                        <span>·</span>
                        <span>{food.proteinPer100g}P</span>
                        <span>·</span>
                        <span>{food.carbsPer100g}C</span>
                        <span>·</span>
                        <span>{food.fatsPer100g}G (/100g)</span>
                      </div>
                    </div>
                  </div>

                  {/* Derecha: Indicador de Báscula */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div
                        className="px-2.5 py-1 rounded-xl text-xs sm:text-sm font-mono font-black tabular-nums border flex flex-col items-end"
                        style={{
                          backgroundColor: `${categoryMeta.color}15`,
                          color: categoryMeta.color,
                          borderColor: `${categoryMeta.color}35`,
                        }}
                      >
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                          Pesar
                        </span>
                        <span>{portion.grams} g</span>
                      </div>
                      {portion.unitNote && (
                        <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                          ({portion.unitNote})
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-white text-black font-black"
                          : "border border-zinc-800 text-transparent"
                      )}
                      style={{
                        backgroundColor: isSelected ? categoryMeta.color : undefined,
                        color: isSelected ? "#000000" : undefined,
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pie de Drawer */}
          <div className="px-5 py-3 border-t border-zinc-900 shrink-0 bg-zinc-950/95 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>BIIO NUTRITION ENGINE</span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase font-bold text-zinc-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
