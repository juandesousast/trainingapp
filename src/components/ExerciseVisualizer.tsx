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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {/* Cabecera Interna Limpia: BIOMECÁNICA · GRUPO MUSCULAR y Nombre */}
      <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 truncate">
            BIOMECÁNICA · {muscleGroup || "FUERZA BIIO"}
          </span>
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-tight truncate">
            {exerciseName}
          </h4>
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
          viewMode: "tempo",
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
