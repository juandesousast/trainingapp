"use client";

import React, { useState } from "react";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { MesocyclesDashboard } from "@/components/MesocyclesDashboard";
import { ActiveWorkoutView } from "@/components/ActiveWorkoutView";
import { RecompCharts } from "@/components/RecompCharts";
import { NutritionView } from "@/components/NutritionView";
import { DailyCheckinView } from "@/components/DailyCheckinView";
import { BottomNav, TabType } from "@/components/BottomNav";
import { MesocycleCompletionModal } from "@/components/MesocycleCompletionModal";

export default function HomePage() {
  const { isLiveSession } = useWorkoutSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>("workout");

  return (
    <div className="w-full">
      {isLiveSession ? (
        <ActiveWorkoutView />
      ) : (
        <>
          {activeTab === "workout" && <MesocyclesDashboard />}
          {activeTab === "recomp" && <RecompCharts />}
          {activeTab === "supplements" && <NutritionView />}
          {activeTab === "daily" && <DailyCheckinView />}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}

      {/* Modal de Finalización / Graduación de Mesociclo */}
      <MesocycleCompletionModal />
    </div>
  );
}
