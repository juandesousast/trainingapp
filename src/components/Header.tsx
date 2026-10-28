"use client";

import React from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { Flame, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const { activeProfile, profiles, setActiveProfile } = useProfileStore();

  const isHoplita = activeProfile.slug === "hoplita";
  const accentColor = activeProfile.themeAccent;

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm tracking-tighter shadow-lg transition-colors duration-300"
            style={{ backgroundColor: accentColor }}
          >
            HOS
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
              HOPLITA OS
            </h1>
            <p className="text-[11px] font-semibold text-zinc-200 tracking-tight">
              DARK KINETIC BIIO
            </p>
          </div>
        </div>

        {/* Selector de Perfil y Métricas Rápidas */}
        <div className="flex items-center gap-2">
          {/* Racha con llama */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 text-xs font-mono font-bold text-zinc-300">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{activeProfile.streakDays}d</span>
          </div>

          {/* Anillo / Progreso Semanal */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 text-xs font-mono font-bold text-zinc-300">
            <CheckCircle2
              className="w-3.5 h-3.5 transition-colors"
              style={{ color: accentColor }}
            />
            <span>
              {activeProfile.weeklyCompleted}/{activeProfile.weeklyTarget}
            </span>
          </div>

          {/* Switcher Él / Ella */}
          <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
            <button
              onClick={() => setActiveProfile("hoplita")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                isHoplita
                  ? "bg-[#CCFF00] text-black shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Él
            </button>
            <button
              onClick={() => setActiveProfile("hoplita_girl")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                !isHoplita
                  ? "bg-[#F43F5E] text-white shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Ella
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
