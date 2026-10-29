"use client";

import React, { useEffect, useState } from "react";
import { Drawer } from "vaul";
import {
  BookOpen,
  X,
  AlertTriangle,
  Dumbbell,
  CheckCircle2,
  Film,
} from "lucide-react";
import {
  fetchExerciseGuide,
  ExerciseTechnicalGuide,
} from "@/lib/exercise-lookup";
import { getExerciseVisual } from "@/lib/exercise-media";

interface ExerciseTechnicalGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  exerciseSlug?: string;
  muscleGroup?: string;
  technicalNotes?: string;
  themeAccent?: string;
}

export const ExerciseTechnicalGuideDrawer: React.FC<ExerciseTechnicalGuideDrawerProps> = ({
  isOpen,
  onClose,
  exerciseName,
  exerciseSlug,
  muscleGroup,
  technicalNotes,
  themeAccent = "#CCFF00",
}) => {
  const [guide, setGuide] = useState<ExerciseTechnicalGuide | null>(null);
  const [frameIdx, setFrameIdx] = useState<0 | 1>(0);

  // Obtener asset visual estático inmediato (ExerciseDB / Free-Exercise-DB)
  const visual = getExerciseVisual(exerciseName, exerciseSlug);

  // Vídeo oficial (si está en el catálogo estático o en la API)
  const videoUrl = visual?.videoUrl || (guide?.videos && guide.videos[0]?.url);

  // Alternancia fluida de fotogramas (0.jpg <-> 1.jpg) en bucle si no hay vídeo
  useEffect(() => {
    if (!isOpen || videoUrl) return;
    const interval = setInterval(() => {
      setFrameIdx((prev) => (prev === 0 ? 1 : 0));
    }, 750);
    return () => clearInterval(interval);
  }, [isOpen, videoUrl]);

  // Carga complementaria de datos de la API (músculos y detalles)
  useEffect(() => {
    let isMounted = true;
    if (isOpen && exerciseName) {
      fetchExerciseGuide(exerciseName, exerciseSlug)
        .then((data) => {
          if (isMounted && data) {
            setGuide(data);
          }
        })
        .catch(() => {
          // Fallback silencioso
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, exerciseName, exerciseSlug]);

  // Derivar músculos primarios y secundarios de la API o del grupo muscular
  const primaryMuscles =
    guide?.primaryMuscles && guide.primaryMuscles.length > 0
      ? guide.primaryMuscles
      : muscleGroup
      ? [muscleGroup.split("/")[0].trim()]
      : ["Músculo Principal"];

  const secondaryMuscles =
    guide?.secondaryMuscles && guide.secondaryMuscles.length > 0
      ? guide.secondaryMuscles
      : muscleGroup && muscleGroup.includes("/")
      ? [muscleGroup.split("/")[1].trim()]
      : [];

  // 3 o 4 instrucciones clave
  const keyInstructions =
    guide?.instructions && guide.instructions.length >= 3
      ? guide.instructions.slice(0, 4)
      : [
          "Postura Inicial: Adopta una base sólida, activa el core y asegura un agarre firme y estable.",
          "Fase Excéntrica: Desciende controlando la carga en todo el recorrido según la cadencia estipulada.",
          "Fase Concéntrica: Aplica fuerza explosiva y constante manteniendo la trayectoria biomecánica neutra.",
          "Bloqueo y Respiración: Pausa en el punto superior, exhala y recupera la tensión antes de la siguiente repetición.",
        ];

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 transition-opacity" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-5 sm:p-6 max-w-lg mx-auto outline-none max-h-[92vh] overflow-y-auto">
          {/* Manija de arrastre */}
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-4 shrink-0" />

          {/* Cabecera del Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: `${themeAccent}15`,
                  borderColor: `${themeAccent}40`,
                }}
              >
                <BookOpen className="w-4 h-4" style={{ color: themeAccent }} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  GUÍA TÉCNICA & BIOMECÁNICA
                </span>
                <h3 className="text-base font-black uppercase text-white tracking-tight leading-tight">
                  {exerciseName}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Cerrar guía técnica"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* 1. VISOR DE ANIMACIÓN EN BUCLE (ExerciseDB / Free-Exercise-DB) */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black relative shadow-2xl flex items-center justify-center">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : visual?.mediaUrl ? (
                <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
                  <img
                    src={
                      frameIdx === 0
                        ? visual.mediaUrl
                        : visual.secondaryMediaUrl || visual.mediaUrl
                    }
                    alt={exerciseName}
                    className="w-full h-full object-contain p-2"
                  />
                  {/* Badge animado en vivo */}
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-300 backdrop-blur-sm flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: themeAccent }}
                    />
                    <span>ANIMACIÓN EN BUCLE</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
                  <Film className="w-8 h-8" />
                  <span className="text-xs font-mono">Visualizador Activo</span>
                </div>
              )}
            </div>

            {/* 2. BADGES DE MÚSCULOS */}
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-zinc-400 mb-2 tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Músculos Involucrados</span>
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Primarios resaltados con el color temático */}
                {primaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all"
                    style={{
                      backgroundColor: `${themeAccent}18`,
                      borderColor: `${themeAccent}50`,
                      color: themeAccent,
                    }}
                  >
                    ● {muscle}
                  </span>
                ))}

                {/* Secundarios en gris claro */}
                {secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 uppercase"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. INSTRUCCIONES CLAVE DE EJECUCIÓN (3 o 4 pasos claros) */}
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-zinc-400 mb-2.5 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instrucciones Clave de Ejecución</span>
              </h4>
              <ol className="space-y-2">
                {keyInstructions.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${themeAccent}25`,
                        color: themeAccent,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* 4. NOTAS DEL ENTRENADOR HOPLITA (Único bloque sin duplicados) */}
            {technicalNotes && (
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Notas del Entrenador Hoplita</span>
                </div>
                <p className="text-xs text-amber-200/90 font-mono leading-relaxed">
                  {technicalNotes}
                </p>
              </div>
            )}
          </div>

          {/* BOTÓN CERRAR INFERIOR */}
          <div className="mt-6 pt-4 border-t border-zinc-900 relative z-20 pointer-events-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-black tracking-wider uppercase transition-colors active:scale-98"
            >
              ENTENDIDO · VOLVER AL ENTRENO
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
