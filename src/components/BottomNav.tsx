"use client";

import React from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { Dumbbell, Scale, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "workout" | "recomp" | "daily";

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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "workout", label: "Entreno", icon: Dumbbell },
    { id: "recomp", label: "Báscula", icon: Scale },
    { id: "daily", label: "Diario", icon: CalendarCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-6 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all duration-200 active:scale-95",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive ? "bg-zinc-900 shadow-md" : "bg-transparent"
                )}
                style={{
                  color: isActive ? accentColor : undefined,
                }}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono tracking-tight font-bold",
                  isActive ? "font-black" : "font-medium"
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
