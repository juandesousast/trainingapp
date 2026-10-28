"use client";

import React from "react";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { MesocyclesDashboard } from "@/components/MesocyclesDashboard";
import { ActiveWorkoutView } from "@/components/ActiveWorkoutView";

export default function HomePage() {
  const { isLiveSession } = useWorkoutSessionStore();

  return (
    <div className="w-full">
      {isLiveSession ? <ActiveWorkoutView /> : <MesocyclesDashboard />}
    </div>
  );
}
