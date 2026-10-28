"use client";

import React from "react";
import { Mesocycle } from "@/lib/types";
import { useProfileStore } from "@/stores/useProfileStore";
import { Sparkles, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoMesocycleCardProps {
  mesocycle: Mesocycle;
  isSelected: boolean;
  isActiveMeso: boolean;
  onSelect: (mesocycle: Mesocycle) => void;
  onActivate: (mesocycle: Mesocycle) => void;
}

export const BentoMesocycleCard: React.FC<BentoMesocycleCardProps> = ({
  mesocycle,
  isSelected,
  isActiveMeso,
  onSelect,
  onActivate,
}) => {
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const progressPct = Math.round(
    (mesocycle.currentExposure / mesocycle.totalExposures) * 100
  );

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mesocycle)}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 transition-all duration-300 cursor-pointer border",
        isActiveMeso
          ? "bg-zinc-900/90 shadow-xl border-opacity-100"
          : isSelected
          ? "bg-zinc-900/60 border-zinc-700"
          : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
      )}
      style={{
        borderColor: isActiveMeso ? accentColor : isSelected ? "#A1A1AA" : undefined,
        boxShadow: isActiveMeso ? `0 0 25px -5px ${accentColor}33` : undefined,
      }}
    >
      {/* Badge Superior */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs text-black shadow-sm"
            style={{ backgroundColor: isActiveMeso ? accentColor : isSelected ? "#FFFFFF" : "#71717A" }}
          >
            {mesocycle.code}
          </span>
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase font-mono">
            {mesocycle.splitStructure}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isActiveMeso ? (
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono tracking-wider flex items-center gap-1 shadow-sm text-black"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              ACTIVO
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActivate(mesocycle);
              }}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
            >
              <Check className="w-2.5 h-2.5" />
              <span>Activar</span>
            </button>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Título y Meta */}
      <div className="mb-3">
        <h3 className="text-base font-black text-white uppercase tracking-tight">
          {mesocycle.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {mesocycle.targetGoal}
        </p>
      </div>

      {/* Barra de progreso de exposiciones */}
      <div className="pt-2 border-t border-zinc-800/80">
        <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mb-1.5">
          <span>Progreso exposiciones</span>
          <span className="font-bold text-zinc-200">
            {mesocycle.currentExposure} / {mesocycle.totalExposures} ({progressPct}%)
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(5, progressPct)}%`,
              backgroundColor: isActiveMeso ? accentColor : "#71717A",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
