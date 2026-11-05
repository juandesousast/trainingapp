"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Pill,
  Sun,
  Flame,
  Zap,
  Moon,
  Droplets,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  ChevronDown,
  Info,
  Beef,
  Wheat,
  Activity,
  ShieldCheck,
  ArrowRightLeft,
  ShoppingCart,
  Share2,
} from "lucide-react";
import {
  useSupplementStore,
  SUPPLEMENT_CATALOG,
  SupplementItem,
} from "@/stores/useSupplementStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useBiometricsStore } from "@/stores/useBiometricsStore";
import {
  calculateNutritionPlan,
  calculateCreatineDose,
  MealPortion,
} from "@/lib/nutrition-engine";
import {
  CLEAN_FOODS,
  MacroCategory,
  calculateFoodPortion,
} from "@/lib/food-database";
import { useMealCustomizationsStore } from "@/stores/useMealCustomizationsStore";
import { FoodSwapDrawer } from "@/components/FoodSwapDrawer";
import {
  generateSmartGroceryList,
  generateGroceryWhatsAppText,
  type GroceryHorizon,
} from "@/lib/grocery-engine";
import { soundEngine } from "@/lib/audio";
import { cn } from "@/lib/utils";

const ICONS_MAP: Record<string, React.ElementType> = {
  Sun,
  Flame,
  Zap,
  Utensils,
  Moon,
};

export const NutritionView: React.FC = () => {
  const { activeProfile, authUserId } = useProfileStore();
  const accentColor = activeProfile.themeAccent;
  const isFemale =
    activeProfile.sex === "female" ||
    activeProfile.gender === "female" ||
    activeProfile.role === "hoplita_girl";
  const { entries } = useBiometricsStore();

  const {
    dailyLogs,
    waterIntakeLiters,
    isTrainingDayOverride,
    setTrainingDayOverride,
    fetchTodayLogs,
    toggleSupplementTaken,
    addWater,
    resetWater,
  } = useSupplementStore();

  // Acordeón de comidas (abierto por defecto la primera comida)
  const [expandedMeal, setExpandedMeal] = useState<string | null>("meal_1");

  // Perfil actual para personalización de comidas (indexado por UUID)
  const profileId = activeProfile.id;

  const { getCustomization, setSwap } = useMealCustomizationsStore();

  // Estado del drawer de intercambio de alimentos
  const [swapDrawerState, setSwapDrawerState] = useState<{
    isOpen: boolean;
    category: MacroCategory;
    mealId: string;
    mealName: string;
    mealSubtitle: string;
    targetMacroGrams: number;
    currentFoodId: string;
  } | null>(null);

  const openSwapDrawer = (
    mealId: string,
    mealName: string,
    mealSubtitle: string,
    category: MacroCategory,
    targetMacroGrams: number,
    currentFoodId: string
  ) => {
    soundEngine.playTap();
    setSwapDrawerState({
      isOpen: true,
      category,
      mealId,
      mealName,
      mealSubtitle,
      targetMacroGrams,
      currentFoodId,
    });
  };

  // Cargar registros al montar o cuando cambie el usuario
  useEffect(() => {
    if (authUserId) {
      fetchTodayLogs(authUserId);
    }
  }, [authUserId, fetchTodayLogs]);

  // Obtener métricas corporales más recientes del usuario
  const latestBiometric = entries && entries.length > 0 ? entries[entries.length - 1] : null;

  const currentWeightKg = useMemo(() => {
    if (latestBiometric?.weightKg) return latestBiometric.weightKg;
    if (activeProfile.targetWeightKg) return Number(activeProfile.targetWeightKg);
    return isFemale ? 60.0 : 82.15;
  }, [latestBiometric, activeProfile, isFemale]);

  const currentBodyFatPct = useMemo(() => {
    if (latestBiometric?.bodyFatPct) return latestBiometric.bodyFatPct;
    return isFemale ? 22.0 : 25.6;
  }, [latestBiometric, isFemale]);

  const targetBodyFatPct = useMemo(() => {
    if (activeProfile.targetBodyFatPct) return Number(activeProfile.targetBodyFatPct);
    return isFemale ? 21.0 : 16.0;
  }, [activeProfile, isFemale]);

  // Determinar si hoy es día de entrenamiento (Lunes, Miércoles, Viernes por defecto)
  const isTrainingDay = useMemo(() => {
    if (isTrainingDayOverride !== null) return isTrainingDayOverride;
    const day = new Date().getDay();
    return day === 1 || day === 3 || day === 5;
  }, [isTrainingDayOverride]);

  // Ejecutar el motor metabólico dinámico
  const plan = useMemo(() => {
    return calculateNutritionPlan({
      weightKg: currentWeightKg,
      bodyFatPct: currentBodyFatPct,
      targetBodyFatPct: targetBodyFatPct,
      isTrainingDay,
      nutritionGoal: activeProfile.nutritionGoal,
      sex: activeProfile.sex,
    });
  }, [currentWeightKg, currentBodyFatPct, targetBodyFatPct, isTrainingDay, activeProfile.nutritionGoal, activeProfile.sex]);

  // Cálculos dinámicos de suplementación e hidratación
  const creatineGrams = useMemo(() => {
    return calculateCreatineDose(currentWeightKg);
  }, [currentWeightKg]);

  const targetWaterLiters = useMemo(() => {
    const raw = currentWeightKg * 0.035 + (isTrainingDay ? 0.5 : 0);
    return Number(raw.toFixed(1));
  }, [currentWeightKg, isTrainingDay]);

  const waterProgressPct = Math.min(100, Math.round((waterIntakeLiters / targetWaterLiters) * 100));

  // Conteo de adherencia de suplementos
  const totalSupplements = SUPPLEMENT_CATALOG.length;
  const takenSupplementsCount = SUPPLEMENT_CATALOG.filter((item) => dailyLogs[item.id]).length;
  const adherencePct = Math.round((takenSupplementsCount / totalSupplements) * 100);

  // 4 Bloques de suplementos
  const breakfastItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "breakfast");
  const workoutItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "workout");
  const lunchItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "lunch");
  const nightItems = SUPPLEMENT_CATALOG.filter((item) => item.block === "night");

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(new Date());
  }, []);

  const toggleMealExpand = (id: string) => {
    setExpandedMeal((prev) => (prev === id ? null : id));
  };

  // Subnavegador: Menú Diario vs Lista de la Compra
  const [activeSubTab, setActiveSubTab] = useState<"menu" | "grocery">("menu");

  // Horizonte temporal para la lista de compra (3, 5 o 7 días)
  const [groceryHorizon, setGroceryHorizon] = useState<GroceryHorizon>(7);

  // Artículos tachados / completados en la lista de la compra
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);

  // Secciones colapsadas en lista de compra (todas abiertas por defecto)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Toast de copiado para WhatsApp
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  // Cargar ítems tachados desde localStorage al montar o al cambiar de atleta
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`vector_grocery_checked_${profileId}`);
      if (saved) {
        setCheckedItemIds(JSON.parse(saved));
      } else {
        setCheckedItemIds([]);
      }
    } catch (e) {
      console.error("Error al cargar lista de compra desde localStorage:", e);
    }
  }, [profileId]);

  const toggleGroceryItem = (itemId: string) => {
    soundEngine.playTap();
    setCheckedItemIds((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      try {
        localStorage.setItem(`vector_grocery_checked_${profileId}`, JSON.stringify(next));
      } catch (e) {
        console.error("Error al guardar en localStorage:", e);
      }
      return next;
    });
  };

  const resetGroceryList = () => {
    soundEngine.playTap();
    setCheckedItemIds([]);
    try {
      localStorage.removeItem(`vector_grocery_checked_${profileId}`);
    } catch (e) {
      console.error("Error al resetear lista en localStorage:", e);
    }
  };

  const toggleSectionCollapse = (catKey: string) => {
    soundEngine.playTap();
    setCollapsedSections((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  // Cálculo reactivo de la lista de la compra inteligente
  const groceryList = useMemo(() => {
    return generateSmartGroceryList({
      weightKg: currentWeightKg,
      bodyFatPct: currentBodyFatPct,
      targetBodyFatPct: activeProfile.targetBodyFatPct,
      nutritionGoal: activeProfile.nutritionGoal,
      sex: activeProfile.sex,
      profileId: activeProfile.id,
      athleteName: activeProfile.displayName || "Atleta",
      horizonDays: groceryHorizon,
      getCustomization,
    });
  }, [
    currentWeightKg,
    currentBodyFatPct,
    activeProfile.targetBodyFatPct,
    activeProfile.nutritionGoal,
    activeProfile.sex,
    activeProfile.id,
    activeProfile.displayName,
    groceryHorizon,
    getCustomization,
  ]);

  const checkedGroceryCount = useMemo(() => {
    let count = 0;
    for (const sec of groceryList.sections) {
      for (const item of sec.items) {
        if (checkedItemIds.includes(item.id)) {
          count++;
        }
      }
    }
    return count;
  }, [groceryList, checkedItemIds]);

  const groceryProgressPct =
    groceryList.totalItemsCount > 0
      ? Math.round((checkedGroceryCount / groceryList.totalItemsCount) * 100)
      : 0;

  const handleCopyWhatsApp = async () => {
    if (!groceryList) return;
    const text = generateGroceryWhatsAppText(groceryList);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      soundEngine.playClusterRepBeep();
      setCopyToastVisible(true);
      setTimeout(() => {
        setCopyToastVisible(false);
      }, 2500);
    } catch (err) {
      console.error("Error al copiar texto:", err);
    }
  };

  const renderSupplementRow = (item: SupplementItem) => {
    const isTaken = Boolean(dailyLogs[item.id]);
    const Icon = ICONS_MAP[item.iconName] || Pill;

    let doseText = item.baseDose;
    if (item.id === "creatine") {
      doseText = `${creatineGrams.toFixed(1)} g`;
    } else if (item.getDynamicDose) {
      doseText = item.getDynamicDose(currentWeightKg, isTrainingDay);
    }

    return (
      <div
        key={item.id}
        onClick={() => {
          if (authUserId) toggleSupplementTaken(authUserId, item.id);
        }}
        className={cn(
          "w-full min-h-[56px] p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.98]",
          isTaken
            ? "bg-zinc-950/70 border-zinc-800"
            : "bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700"
        )}
        style={{
          borderColor: isTaken ? `${accentColor}40` : undefined,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm"
            style={{
              backgroundColor: isTaken ? `${accentColor}20` : "#27272A",
              color: isTaken ? accentColor : "#A1A1AA",
            }}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold transition-colors leading-tight",
                  isTaken ? "text-zinc-400 line-through" : "text-zinc-100"
                )}
              >
                {item.name}
              </span>
              <span
                className="text-[11px] font-mono tabular-nums font-black px-1.5 py-0.5 rounded-md leading-none shrink-0"
                style={{
                  backgroundColor: `${accentColor}18`,
                  color: accentColor,
                }}
              >
                {doseText}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-1">
              {item.notes}
            </p>
          </div>
        </div>

        {/* Checkbox táctil */}
        <button
          type="button"
          aria-label={`Marcar ${item.name}`}
          className={cn(
            "w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 active:scale-90",
            isTaken
              ? "text-black shadow-md"
              : "bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-700"
          )}
          style={{
            backgroundColor: isTaken ? accentColor : undefined,
            borderColor: isTaken ? accentColor : undefined,
          }}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-36 space-y-6">
      {/* 1. HEADER HERO: Dark Kinetic */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 border bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 shadow-2xl backdrop-blur-xl"
        style={{
          borderColor: `${accentColor}40`,
          boxShadow: `0 10px 40px -15px ${accentColor}25`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black tracking-widest text-zinc-400 uppercase block">
                VECTOR OS · NUTRICIÓN BIIO
              </span>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                <span>{isTrainingDay ? "Día de Entrenamiento" : "Día de Descanso"}</span>
                <span
                  className="w-2 h-2 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: accentColor }}
                />
              </h1>
              <p className="text-[11px] font-mono text-zinc-400 capitalize mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>{todayFormatted}</span>
              </p>
            </div>
          </div>

          {/* Toggle Día de Entreno / Descanso */}
          <button
            type="button"
            onClick={() => setTrainingDayOverride(!isTrainingDay)}
            title="Alternar entre protocolo de entreno y descanso"
            className="min-h-[38px] px-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>{isTrainingDay ? "⚡ Entreno" : "💤 Descanso"}</span>
          </button>
        </div>

        {/* Indicador de fase y balance metabólico */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor:
                  plan.nutritionGoal === "fat_loss"
                    ? "#F59E0B"
                    : plan.nutritionGoal === "recomp"
                    ? "#10B981"
                    : plan.nutritionGoal === "hypertrophy"
                    ? "#A855F7"
                    : "#38BDF8",
              }}
            />
            <span className="font-bold text-zinc-200">
              {plan.goalLabel}
            </span>
          </div>
          <span className="text-zinc-500">
            BMR: <strong className="text-zinc-300 tabular-nums">{plan.bmr}</strong> kcal
          </span>
        </div>
      </motion.div>

      {/* SUBNAVEGADOR: Menú Diario vs. Lista de la Compra */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-inner">
        <button
          type="button"
          onClick={() => {
            soundEngine.playTap();
            setActiveSubTab("menu");
          }}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            activeSubTab === "menu"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          )}
          style={{
            borderColor: activeSubTab === "menu" ? `${accentColor}60` : undefined,
          }}
        >
          <Utensils
            className="w-3.5 h-3.5"
            style={{ color: activeSubTab === "menu" ? accentColor : undefined }}
          />
          <span>🍽️ Menú Diario</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playTap();
            setActiveSubTab("grocery");
          }}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            activeSubTab === "grocery"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          )}
          style={{
            borderColor: activeSubTab === "grocery" ? `${accentColor}60` : undefined,
          }}
        >
          <ShoppingCart
            className="w-3.5 h-3.5"
            style={{ color: activeSubTab === "grocery" ? accentColor : undefined }}
          />
          <span>🛒 Lista de la Compra</span>
        </button>
      </div>

      {activeSubTab === "grocery" ? (
        /* VISTA: LISTA DE LA COMPRA INTELIGENTE */
        <motion.div
          key="grocery-view"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* BARRA DE ACCIONES SUPERIOR */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Selector de Horizonte */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {([3, 5, 7] as GroceryHorizon[]).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setGroceryHorizon(days);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95",
                      groceryHorizon === days
                        ? "text-black shadow-sm font-black"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                    style={{
                      backgroundColor: groceryHorizon === days ? accentColor : "transparent",
                    }}
                  >
                    {days} Días
                  </button>
                ))}
              </div>

              {/* Botón Copiar para WhatsApp */}
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar para WhatsApp</span>
              </button>
            </div>

            {/* Contador de Progreso & Reinicio */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    Progreso:
                  </span>
                  <span className="font-mono tabular-nums font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-md text-[11px]">
                    {checkedGroceryCount}/{groceryList.totalItemsCount} tachados ({groceryProgressPct}%)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetGroceryList}
                  title="Desmarcar todos los artículos de la lista"
                  className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reiniciar lista</span>
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${groceryProgressPct}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>

            {/* Info de días ponderados */}
            <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-0.5">
              <span>
                Ponderación BIIO:{" "}
                <strong className="text-zinc-300">
                  {groceryList.trainingDays}d entreno + {groceryList.restDays}d descanso
                </strong>
              </span>
              <span>
                Atleta: <strong className="text-zinc-300">{groceryList.athleteName}</strong>
              </span>
            </div>
          </div>

          {/* CHECKLIST POR CATEGORÍAS */}
          <div className="space-y-3">
            {groceryList.sections.map((section) => {
              const isCollapsed = !!collapsedSections[section.category];
              const sectionCheckedCount = section.items.filter((i) =>
                checkedItemIds.includes(i.id)
              ).length;
              const isSectionAllChecked =
                section.items.length > 0 && sectionCheckedCount === section.items.length;

              return (
                <div
                  key={section.category}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden transition-all duration-200"
                >
                  {/* Cabecera de Categoría */}
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapse(section.category)}
                    className="w-full p-3.5 flex items-center justify-between gap-2.5 text-left active:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{section.emoji}</span>
                      <span className="text-xs font-black text-white uppercase tracking-tight">
                        {section.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded-md font-bold tabular-nums",
                          isSectionAllChecked
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400"
                        )}
                      >
                        {sectionCheckedCount}/{section.items.length}
                      </span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 transition-transform duration-200",
                          isCollapsed ? "" : "rotate-180 text-white"
                        )}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Lista de Ítems */}
                  {!isCollapsed && (
                    <div className="px-3 pb-3 pt-1 border-t border-zinc-800/60 space-y-2">
                      {section.items.map((item) => {
                        const isChecked = checkedItemIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleGroceryItem(item.id)}
                            className={cn(
                              "w-full min-h-[52px] p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.99]",
                              isChecked
                                ? "bg-zinc-950/70 border-zinc-800/80 opacity-70"
                                : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
                            )}
                            style={{
                              borderColor: isChecked ? `${accentColor}30` : undefined,
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg shrink-0 leading-none">
                                {item.emoji}
                              </span>
                              <div className="min-w-0">
                                <span
                                  className={cn(
                                    "text-xs font-bold block transition-colors leading-tight",
                                    isChecked
                                      ? "text-zinc-500 line-through"
                                      : "text-zinc-100"
                                  )}
                                >
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span
                                    className={cn(
                                      "text-[11px] font-mono font-black tabular-nums transition-colors",
                                      isChecked ? "text-zinc-500" : "text-zinc-300"
                                    )}
                                  >
                                    {item.formattedAmount}
                                  </span>
                                  {item.commercialNote && (
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      ({item.commercialNote})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Checkbox táctil */}
                            <button
                              type="button"
                              aria-label={`Marcar ${item.name}`}
                              className={cn(
                                "w-8 h-8 min-w-[32px] min-h-[32px] rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200",
                                isChecked
                                  ? "text-black shadow-md"
                                  : "bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-700"
                              )}
                              style={{
                                backgroundColor: isChecked ? accentColor : undefined,
                                borderColor: isChecked ? accentColor : undefined,
                              }}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* VISTA: MENÚ DIARIO */
        <>
          {/* 2. DASHBOARD DE MACROS & CALORÍAS OBJETIVO */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-baseline justify-between border-b border-zinc-800/70 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                  Presupuesto Energético Diario
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl sm:text-4xl font-black tabular-nums text-white">
                    {plan.targetCalories.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    kcal
                  </span>
                </div>
              </div>

          <div className="text-right font-mono text-[11px] space-y-0.5">
            <div className="text-zinc-400">
              TDEE: <strong className="text-white tabular-nums">{plan.tdee}</strong> kcal
            </div>
            <div className="text-zinc-400">
              LBM: <strong className="text-white tabular-nums">{plan.lbmKg}</strong> kg ({currentBodyFatPct}% grasa)
            </div>
          </div>
        </div>

        {/* Barras de distribución de 3 Macros */}
        <div className="space-y-3">
          {/* Proteína */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="font-bold text-white">Proteína</span>
                <span className="text-[10px] text-zinc-400">(2.2g/kg LBM)</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.proteinGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.proteinKcal} kcal · {plan.proteinPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-white">Carbohidratos</span>
                <span className="text-[10px] text-zinc-400">
                  {isTrainingDay ? "(Demanda Glucolítica)" : "(Ciclado Ligero)"}
                </span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.carbGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.carbKcal} kcal · {plan.carbPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.carbPct}%` }}
              />
            </div>
          </div>

          {/* Grasas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-bold text-white">Grasas Saludables</span>
                <span className="text-[10px] text-zinc-400">(0.9g/kg Peso)</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-white text-sm">{plan.fatGrams}g</span>
                <span className="text-zinc-400 text-[10px] ml-1.5">
                  ({plan.fatKcal} kcal · {plan.fatPct}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${plan.fatPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESGLOSE DE 4 COMIDAS (ACORDEÓN TÁCTIL) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              Estructura de 4 Comidas y Porciones
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {isTrainingDay ? "Timing Peri-Entreno" : "Distribución Estable"}
          </span>
        </div>

        <div className="space-y-2.5">
          {plan.meals.map((meal) => {
            const isExpanded = expandedMeal === meal.id;
            const custom = getCustomization(profileId, meal.id);
            const proteinFood =
              CLEAN_FOODS[custom.proteinFoodId] || CLEAN_FOODS.pechuga_pollo;
            const carbFood =
              CLEAN_FOODS[custom.carbFoodId] || CLEAN_FOODS.arroz_basmati;
            const fatFood =
              CLEAN_FOODS[custom.fatFoodId] || CLEAN_FOODS.aove;

            const hasMicroSlot =
              meal.id === "meal_1" || meal.id === "meal_2" || meal.id === "meal_4";
            const defaultMicroId =
              meal.id === "meal_1"
                ? "arandanos_frutos_rojos"
                : meal.id === "meal_2"
                ? "brocoli_vapor"
                : "calabacin_plancha";

            const microFood =
              CLEAN_FOODS[custom.microFoodId || defaultMicroId] ||
              CLEAN_FOODS[defaultMicroId];
            const microTargetGrams = meal.id === "meal_1" ? 100 : 200;
            const microPortion = hasMicroSlot
              ? calculateFoodPortion(microTargetGrams, "micros", microFood)
              : null;

            // Descuento de carbohidratos de la fruta/verdura del carbohidrato base
            const microCarbDeduction = microPortion
              ? Math.round(microPortion.carbContribution)
              : 0;
            const adjustedCarbGrams = hasMicroSlot
              ? Math.max(10, meal.carbGrams - microCarbDeduction)
              : meal.carbGrams;

            const proteinPortion = calculateFoodPortion(
              meal.proteinGrams,
              "protein",
              proteinFood
            );

            // Compensación de grasas si se elige Salmón fresco
            let adjustedFatGrams = meal.fatGrams;
            if (custom.proteinFoodId === "salmon_fresco") {
              const salmonFatGrams = Math.round(proteinPortion.fatContribution);
              adjustedFatGrams = Math.max(0, meal.fatGrams - salmonFatGrams);
            }

            const carbPortion = calculateFoodPortion(
              adjustedCarbGrams,
              "carbs",
              carbFood
            );
            const fatPortion = calculateFoodPortion(
              adjustedFatGrams,
              "fats",
              fatFood
            );

            return (
              <div
                key={meal.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden transition-all duration-200"
              >
                {/* Cabecera del Acordeón */}
                <button
                  type="button"
                  data-meal-toggle={meal.id}
                  onClick={() => toggleMealExpand(meal.id)}
                  className="w-full p-3.5 flex items-center justify-between gap-2.5 text-left active:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-tight">
                        {meal.name}: {meal.subtitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-400">
                      <span>{meal.timing}</span>
                      <span>·</span>
                      <span className="font-bold text-zinc-200 tabular-nums">
                        {meal.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Micro pills de macros */}
                    <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                        {meal.proteinGrams}P
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                        {meal.carbGrams}C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                        {meal.fatGrams}G
                      </span>
                    </div>

                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 transition-transform duration-200",
                        isExpanded ? "rotate-180 text-white" : ""
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Contenido desplegable */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/60 space-y-3">
                        {/* Macro badges para móvil */}
                        <div className="grid grid-cols-3 gap-2 text-center font-mono">
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Proteína ({meal.proteinPct}%)
                            </span>
                            <span className="text-base font-black text-cyan-400 tabular-nums">
                              {meal.proteinGrams}g
                            </span>
                          </div>
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Carbos ({meal.carbPct}%)
                            </span>
                            <span className="text-base font-black text-amber-400 tabular-nums">
                              {meal.carbGrams}g
                            </span>
                          </div>
                          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                            <span className="text-[9px] uppercase text-zinc-400 block">
                              Grasas ({meal.fatPct}%)
                            </span>
                            <span className="text-base font-black text-rose-400 tabular-nums">
                              {meal.fatGrams}g
                            </span>
                          </div>
                        </div>

                        {/* Intercambio Inteligente de Alimentos Limpios */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                              Alimentos & Gramaje en Báscula
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">
                              Pulsa para intercambiar ⇄
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* Chip Proteína */}
                            <button
                              type="button"
                              data-swap-chip-protein={meal.id}
                              onClick={() =>
                                openSwapDrawer(
                                  meal.id,
                                  meal.name,
                                  meal.subtitle,
                                  "protein",
                                  meal.proteinGrams,
                                  custom.proteinFoodId
                                )
                              }
                              className="w-full text-left p-2.5 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/30 border border-cyan-500/25 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2.5 group active:scale-[0.99] touch-manipulation min-h-[44px]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-lg shrink-0 leading-none" role="img" aria-label="protein">
                                  {proteinFood.emoji}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-zinc-100">
                                      <span className="font-mono text-cyan-300 font-black mr-1">
                                        {proteinPortion.grams}g
                                      </span>
                                      {proteinFood.shortName}
                                    </span>
                                    {proteinPortion.unitNote && (
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        ({proteinPortion.unitNote})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-cyan-400/80 block">
                                    ➔ ({meal.proteinGrams}g P)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                  {proteinPortion.calories} kcal
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:border-cyan-400 transition-colors">
                                  <ArrowRightLeft className="w-3 h-3" />
                                </div>
                              </div>
                            </button>

                            {/* Chip Carbohidratos */}
                            <button
                              type="button"
                              data-swap-chip-carbs={meal.id}
                              onClick={() =>
                                openSwapDrawer(
                                  meal.id,
                                  meal.name,
                                  meal.subtitle,
                                  "carbs",
                                  adjustedCarbGrams,
                                  custom.carbFoodId
                                )
                              }
                              className="w-full text-left p-2.5 rounded-xl bg-amber-950/20 hover:bg-amber-950/30 border border-amber-500/25 hover:border-amber-500/50 transition-all flex items-center justify-between gap-2.5 group active:scale-[0.99] touch-manipulation min-h-[44px]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-lg shrink-0 leading-none" role="img" aria-label="carbs">
                                  {carbFood.emoji}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-zinc-100">
                                      <span className="font-mono text-amber-300 font-black mr-1">
                                        {carbPortion.grams}g
                                      </span>
                                      {carbFood.shortName}
                                    </span>
                                    {carbPortion.unitNote && (
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        ({carbPortion.unitNote})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-amber-400/80 block">
                                    ➔ ({adjustedCarbGrams}g C{microCarbDeduction > 0 ? ` · -${microCarbDeduction}g por ${meal.id === "meal_1" ? "fruta" : "verdura"}` : ""})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  {carbPortion.calories} kcal
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:text-white group-hover:border-amber-400 transition-colors">
                                  <ArrowRightLeft className="w-3 h-3" />
                                </div>
                              </div>
                            </button>

                            {/* Chip Grasas Saludables */}
                            <button
                              type="button"
                              onClick={() =>
                                openSwapDrawer(
                                  meal.id,
                                  meal.name,
                                  meal.subtitle,
                                  "fats",
                                  adjustedFatGrams,
                                  custom.fatFoodId
                                )
                              }
                              className="w-full text-left p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/25 hover:border-rose-500/50 transition-all flex items-center justify-between gap-2.5 group active:scale-[0.99] touch-manipulation min-h-[44px]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-lg shrink-0 leading-none" role="img" aria-label="fats">
                                  {fatFood.emoji}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-zinc-100">
                                      <span className="font-mono text-rose-300 font-black mr-1">
                                        {fatPortion.grams}g
                                      </span>
                                      {fatFood.shortName}
                                    </span>
                                    {fatPortion.unitNote && (
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        ({fatPortion.unitNote})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-rose-400/80 block">
                                    ➔ ({adjustedFatGrams}g G{custom.proteinFoodId === "salmon_fresco" ? ` · compensado con salmón` : ""})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                  {fatPortion.calories} kcal
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:text-white group-hover:border-rose-400 transition-colors">
                                  <ArrowRightLeft className="w-3 h-3" />
                                </div>
                              </div>
                            </button>

                            {/* Chip Micronutrientes (Slot 4: Fruta en desayuno, Verdura en almuerzo/cena) */}
                            {hasMicroSlot && microPortion && (
                              <button
                                type="button"
                                data-swap-chip-micros={meal.id}
                                onClick={() =>
                                  openSwapDrawer(
                                    meal.id,
                                    meal.name,
                                    meal.subtitle,
                                    "micros",
                                    microTargetGrams,
                                    microFood.id
                                  )
                                }
                                className={cn(
                                  "w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 group active:scale-[0.99] touch-manipulation min-h-[44px]",
                                  meal.id === "meal_1"
                                    ? "bg-purple-950/20 hover:bg-purple-950/30 border-purple-500/25 hover:border-purple-500/50"
                                    : "bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/25 hover:border-emerald-500/50"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-lg shrink-0 leading-none" role="img" aria-label="micros">
                                    {microFood.emoji}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-zinc-100">
                                        <span
                                          className={cn(
                                            "font-mono font-black mr-1",
                                            meal.id === "meal_1" ? "text-purple-300" : "text-emerald-300"
                                          )}
                                        >
                                          {microPortion.grams}g
                                        </span>
                                        {microFood.shortName}
                                      </span>
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        ({meal.id === "meal_1" ? "Antioxidantes" : "Fibra & Minerales"})
                                      </span>
                                    </div>
                                    <span
                                      className={cn(
                                        "text-[10px] font-mono block",
                                        meal.id === "meal_1" ? "text-purple-400/80" : "text-emerald-400/80"
                                      )}
                                    >
                                      ➔ ({microPortion.carbContribution}g C · {microPortion.calories} kcal)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={cn(
                                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                                      meal.id === "meal_1"
                                        ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    )}
                                  >
                                    {microPortion.calories} kcal
                                  </span>
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-lg bg-zinc-900 border flex items-center justify-center transition-colors",
                                      meal.id === "meal_1"
                                        ? "border-purple-500/30 text-purple-400 group-hover:text-white group-hover:border-purple-400"
                                        : "border-emerald-500/30 text-emerald-400 group-hover:text-white group-hover:border-emerald-400"
                                    )}
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                  </div>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BLOQUE INFERIOR DE SUPLEMENTACIÓN & HIDRATACIÓN */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              Protocolo de Suplementación & Agua
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {takenSupplementsCount}/{totalSupplements} tomas ({adherencePct}%)
          </span>
        </div>

        {/* Tarjetas Dinámicas de Creatina e Hidratación */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Creatina Monohidrato
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                Calibrado: 0.1g/kg
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                {creatineGrams.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-zinc-400">g/día</span>
            </div>
            <span className="text-[10px] text-zinc-400 block truncate">
              Base: {currentWeightKg.toFixed(1)} kg de peso corporal
            </span>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Meta Agua
              </span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                {targetWaterLiters.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-zinc-400">litros/día</span>
            </div>
            <span className="text-[10px] text-zinc-400 block truncate">
              35ml/kg {isTrainingDay ? "+ 0.5L entreno" : ""}
            </span>
          </div>
        </div>

        {/* Módulo Interactivo de Hidratación */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-tight text-white block">
                  Agua Ingerida Hoy
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {waterIntakeLiters.toFixed(2)} L de {targetWaterLiters.toFixed(1)} L ({waterProgressPct}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (authUserId) addWater(authUserId, 0.25, targetWaterLiters);
                }}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => {
                  if (authUserId) addWater(authUserId, 0.5, targetWaterLiters);
                }}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white transition-all active:scale-95"
              >
                +500ml
              </button>
              <button
                type="button"
                onClick={() => {
                  if (authUserId) resetWater(authUserId);
                }}
                aria-label="Resetear agua"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${waterProgressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Bloques del Catálogo de Suplementación */}
        {/* Bloque 1: Desayuno */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                1. Desayuno / Mañana
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Con fuente de grasa</span>
          </div>
          <div className="space-y-2">{breakfastItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 2: Pre / Post-Entreno */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                2. Pre / Post-Entreno
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {isTrainingDay ? "Vasodilatación y flujo" : "Mantenimiento endotelial"}
            </span>
          </div>
          <div className="space-y-2">{workoutItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 3: Comida o Merienda */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: accentColor }} />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                3. Comida o Merienda
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Saturación y proteína</span>
          </div>
          <div className="space-y-2">{lunchItems.map(renderSupplementRow)}</div>
        </div>

        {/* Bloque 4: Noche */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
                4. Noche / Antes de Dormir
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">30-45 min antes de dormir</span>
          </div>
          <div className="space-y-2">{nightItems.map(renderSupplementRow)}</div>
        </div>
      </div>
        </>
      )}

      {/* TOAST FLOTANTE: Feedback de copia al portapapeles */}
      <AnimatePresence>
        {copyToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-emerald-500/50 text-white font-mono text-xs shadow-2xl flex items-center gap-2 pointer-events-none backdrop-blur-xl"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="font-bold">Lista copiada al portapapeles</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL / DRAWER INTERCAMBIO INTELIGENTE DE ALIMENTOS */}
      {swapDrawerState && (
        <FoodSwapDrawer
          isOpen={swapDrawerState.isOpen}
          onClose={() => setSwapDrawerState(null)}
          category={swapDrawerState.category}
          mealId={swapDrawerState.mealId}
          mealName={swapDrawerState.mealName}
          mealSubtitle={swapDrawerState.mealSubtitle}
          targetMacroGrams={swapDrawerState.targetMacroGrams}
          currentFoodId={swapDrawerState.currentFoodId}
          themeAccent={accentColor}
          onSelectFood={(newFoodId) => {
            setSwap(
              profileId,
              swapDrawerState.mealId,
              swapDrawerState.category,
              newFoodId
            );
            setSwapDrawerState(null);
          }}
        />
      )}
    </div>
  );
};
