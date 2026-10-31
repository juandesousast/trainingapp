"use client";

import React from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { Dumbbell, Scale, Pill, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "workout" | "recomp" | "supplements" | "daily";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { activeProfile } = useProfileStore();
  const accentColor = activeProfile.themeAccent;

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "workout", label: "Entreno", icon: Dumbbell },
    { id: "recomp", label: "Báscula", icon: Scale },
    { id: "supplements", label: "Suplementos", icon: Pill },
    { id: "daily", label: "Diario", icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 px-4 py-2 flex items-center justify-around pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
      <div className="max-w-md w-full mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] text-[11px] font-medium transition-colors active:scale-95",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {/* Contenedor circular del icono con fondo suave y acento */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  isActive ? "shadow-sm" : "bg-transparent text-zinc-500"
                )}
                style={{
                  backgroundColor: isActive ? `${accentColor}20` : "transparent",
                  color: isActive ? accentColor : undefined,
                }}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>

              {/* Texto de la pestaña */}
              <span
                className={cn(
                  "text-[10px] font-mono tracking-tight transition-colors",
                  isActive ? "font-black" : "font-medium text-zinc-500"
                )}
                style={{
                  color: isActive ? accentColor : undefined,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
