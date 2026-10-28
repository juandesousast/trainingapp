"use client";

import React from "react";
import { Mesocycle } from "@/lib/types";
import { useProfileStore } from "@/stores/useProfileStore";
import { Trophy, Dumbbell, Sparkles, ChevronRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface BentoMesocycleCardProps {
  mesocycle: Mesocycle;
  onSelect: (mesocycle: Mesocycle) => void;
}

export const BentoMesocycleCard: React.FC<BentoMesocycleCardProps> = ({
  mesocycle,
  onSelect,
}) => {
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const isCurrent = mesocycle.isActive;
  const progressPct = Math.round(
    (mesocycle.currentExposure / mesocycle.totalExposures) * 100
  );

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mesocycle)}
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
        isCurrent
          ? "bg-zinc-900/90 shadow-xl"
          : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
      }`}
      style={{
        borderColor: isCurrent ? accentColor : undefined,
        boxShadow: isCurrent ? `0 0 25px -5px ${accentColor}33` : undefined,
      }}
    >
      {/* Badge Superior */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs text-black shadow-sm"
            style={{ backgroundColor: isCurrent ? accentColor : "#71717A" }}
          >
            {mesocycle.code}
          </span>
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase font-mono">
            {mesocycle.splitStructure}
          </span>
        </div>

        {isCurrent ? (
          <span
            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono tracking-wider flex items-center gap-1 shadow-sm text-black"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            ACTIVO
          </span>
        ) : (
          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <span>{mesocycle.totalExposures} sesiones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
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
              backgroundColor: isCurrent ? accentColor : "#71717A",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
