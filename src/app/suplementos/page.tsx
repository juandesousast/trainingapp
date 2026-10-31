"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NutritionView } from "@/components/NutritionView";
import { BottomNav, TabType } from "@/components/BottomNav";

export default function SuplementosRoutePage() {
  const router = useRouter();

  const handleTabChange = (tab: TabType) => {
    if (tab === "supplements") return;
    router.push("/");
  };

  return (
    <div className="w-full">
      <NutritionView />
      <BottomNav activeTab="supplements" onTabChange={handleTabChange} />
    </div>
  );
}
