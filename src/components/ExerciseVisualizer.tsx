"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ExerciseComposition, ExerciseCompositionProps } from "@/remotion/ExerciseComposition";
import { Loader2 } from "lucide-react";
import { getExerciseVisual } from "@/lib/exercise-media";
import { cn } from "@/lib/utils";

// Import dinámico del Player de Remotion sin SSR
const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/9] bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    ),
  }
);

interface ExerciseVisualizerProps extends ExerciseCompositionProps {
  exerciseSlug?: string;
  className?: string;
}

export const ExerciseVisualizer: React.FC<ExerciseVisualizerProps> = ({
  exerciseName,
  exerciseSlug,
  muscleGroup,
  videoUrl,
  tempo = "3-1-X-1",
  notes,
  isCluster = false,
  themeAccent = "#CCFF00",
  className,
}) => {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"tempo" | "tecnica">("tempo");

  useEffect(() => {
    setMounted(true);
    try {
      const savedMode = localStorage.getItem("hoplita_exercise_view_mode");
      if (savedMode === "tempo" || savedMode === "tecnica") {
        setViewMode(savedMode);
      }
    } catch (e) {
      // Ignorar fallos de localStorage
    }
  }, []);

  const handleModeChange = (mode: "tempo" | "tecnica") => {
    setViewMode(mode);
    try {
      localStorage.setItem("hoplita_exercise_view_mode", mode);
    } catch (e) {
      // Ignorar fallos de localStorage
    }
  };

  if (!mounted) {
    return (
      <div className="w-full aspect-[16/9] bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    );
  }

  // Buscar el asset visual estático del catálogo
  const visual = getExerciseVisual(exerciseName, exerciseSlug);
  const mediaUrl = visual?.mediaUrl;
  const secondaryMediaUrl = visual?.secondaryMediaUrl;

  // Duración estándar del loop: 180 frames @ 30fps = 6 segundos
  const durationInFrames = 180;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-zinc-950 ${
        className || ""
      }`}
    >
      {/* Cabecera Interna Ordenada: Datos Biomecánicos + Selector TEMPO / TÉCNICA */}
      <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-start justify-between gap-2 pointer-events-auto">
        {/* Izquierda: Disposición vertical ordenada sin solapamientos */}
        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 truncate">
            BIOMECÁNICA · {muscleGroup || "FUERZA BIIO"}
          </span>
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-tight truncate">
            {exerciseName}
          </h4>
        </div>

        {/* Derecha: Píldoras Selectoras TEMPO / TÉCNICA */}
        <div className="inline-flex items-center rounded-full bg-zinc-950/90 p-0.5 border border-zinc-800 shadow-md backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleModeChange("tempo");
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all min-h-[32px] flex items-center justify-center",
              viewMode === "tempo"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            style={viewMode === "tempo" ? { color: themeAccent } : undefined}
          >
            TEMPO
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleModeChange("tecnica");
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all min-h-[32px] flex items-center justify-center",
              viewMode === "tecnica"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            style={viewMode === "tecnica" ? { color: themeAccent } : undefined}
          >
            TÉCNICA
          </button>
        </div>
      </div>

      <RemotionPlayer
        component={ExerciseComposition}
        inputProps={{
          exerciseName,
          muscleGroup,
          videoUrl,
          mediaUrl,
          secondaryMediaUrl,
          viewMode,
          tempo,
          notes,
          isCluster,
          themeAccent,
        }}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={640}
        compositionHeight={360}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
        }}
        autoPlay
        loop
        controls={false}
        acknowledgeRemotionLicense={true}
      />
    </div>
  );
};
