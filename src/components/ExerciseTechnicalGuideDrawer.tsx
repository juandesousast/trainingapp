"use client";

import React, { useEffect, useState } from "react";
import { Drawer } from "vaul";
import {
  BookOpen,
  X,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  fetchExerciseGuide,
  ExerciseTechnicalGuide,
} from "@/lib/exercise-lookup";

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
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen && exerciseName) {
      setLoading(true);
      setErrorState(null);

      fetchExerciseGuide(exerciseName, exerciseSlug)
        .then((data) => {
          if (!isMounted) return;
          if (data) {
            setGuide(data);
          } else {
            setGuide(null);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn("[ExerciseTechnicalGuideDrawer] Error:", err);
          setErrorState("No fue posible conectar con la guía en vivo.");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, exerciseName, exerciseSlug]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 transition-opacity" />
        <Drawer.Content className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] p-6 max-w-lg mx-auto outline-none max-h-[92vh] overflow-y-auto">
          {/* Manija de arrastre */}
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-5 shrink-0" />

          {/* Botón cerrar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-5">
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
                  {guide?.name || exerciseName}
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

          {/* ESTADO: CARGANDO (Skeleton Shimmer) */}
          {loading && (
            <div className="space-y-4 animate-pulse py-2">
              <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
              <div className="h-20 bg-zinc-900/80 rounded-2xl border border-zinc-850" />
              <div className="flex gap-2">
                <div className="h-6 bg-zinc-900 rounded-full w-20" />
                <div className="h-6 bg-zinc-900 rounded-full w-24" />
                <div className="h-6 bg-zinc-900 rounded-full w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-900 rounded w-full" />
                <div className="h-4 bg-zinc-900 rounded w-5/6" />
                <div className="h-4 bg-zinc-900 rounded w-4/6" />
              </div>
              <div className="h-24 bg-zinc-900/60 rounded-2xl" />
            </div>
          )}

          {/* CONTENIDO PRINCIPAL */}
          {!loading && (
            <div className="space-y-5">
              {/* Badges de Categoría, Nivel y Mecánica */}
              <div className="flex flex-wrap items-center gap-1.5">
                {guide?.category && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase text-zinc-300">
                    {guide.category}
                  </span>
                )}
                {guide?.mechanic && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase text-zinc-300">
                    Mecánica: {guide.mechanic}
                  </span>
                )}
                {guide?.level && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase text-zinc-400">
                    Nivel: {guide.level}
                  </span>
                )}
                {guide?.equipment && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase text-zinc-400">
                    Equipo: {guide.equipment}
                  </span>
                )}
                {muscleGroup && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[10px] font-mono text-zinc-500">
                    {muscleGroup}
                  </span>
                )}
              </div>

              {/* OVERVIEW / BIOMECÁNICA */}
              {guide?.overview ? (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: themeAccent }} />
                    <span>Patrón de Movimiento</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {guide.overview}
                  </p>
                </div>
              ) : technicalNotes ? (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: themeAccent }} />
                    <span>Notas Técnicas del Entrenador</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {technicalNotes}
                  </p>
                </div>
              ) : null}

              {/* VÍDEO MP4 OFICIAL (si viene disponible de ExerciseAPI.dev) */}
              {guide?.videos && guide.videos.length > 0 && guide.videos[0].url && (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-video relative">
                  <video
                    src={guide.videos[0].url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-[9px] font-mono text-zinc-400">
                    {guide.videos[0].resolution || "HD"}
                  </div>
                </div>
              )}

              {/* MÚSCULOS TRABAJADOS */}
              {((guide?.primaryMuscles && guide.primaryMuscles.length > 0) ||
                (guide?.secondaryMuscles && guide.secondaryMuscles.length > 0)) && (
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-zinc-400 mb-2 tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Músculos Involucrados</span>
                  </h4>
                  <div className="space-y-2">
                    {guide?.primaryMuscles && guide.primaryMuscles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 mr-1 uppercase">
                          Primarios:
                        </span>
                        {guide.primaryMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all"
                            style={{
                              backgroundColor: `${themeAccent}15`,
                              borderColor: `${themeAccent}40`,
                              color: themeAccent,
                            }}
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}

                    {guide?.secondaryMuscles && guide.secondaryMuscles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 mr-1 uppercase">
                          Secundarios:
                        </span>
                        {guide.secondaryMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 uppercase"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INSTRUCCIONES PASO A PASO */}
              {guide?.instructions && guide.instructions.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-zinc-400 mb-2.5 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ejecución Paso a Paso</span>
                  </h4>
                  <ol className="space-y-2.5">
                    {guide.instructions.map((step, idx) => (
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
              )}

              {/* CONSEJOS CLAVE (exerciseTips) */}
              {guide?.exerciseTips && guide.exerciseTips.length > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-mono font-black text-emerald-400 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Consejos de Palanca y Alineación</span>
                  </div>
                  <ul className="space-y-1.5">
                    {guide.exerciseTips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed"
                      >
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ERRORES COMUNES (commonMistakes) */}
              {guide?.commonMistakes && guide.commonMistakes.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Errores Frecuentes y Compensaciones</span>
                  </div>
                  <ul className="space-y-1.5">
                    {guide.commonMistakes.map((mistake, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed"
                      >
                        <span className="text-amber-400 font-bold">⚠️</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* INFORMACIÓN DE SEGURIDAD (safetyInfo) */}
              {guide?.safetyInfo && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-mono font-black text-red-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    <span>Seguridad y Cuidado Articular</span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    {guide.safetyInfo}
                  </p>
                </div>
              )}

              {/* VARIACIONES */}
              {guide?.variations && guide.variations.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-zinc-400 mb-2 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variantes Biomecánicas</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.variations.map((variant) => (
                      <span
                        key={variant}
                        className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                      >
                        {variant}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* FALLBACK CUANDO NO HAY COINCIDENCIA DIRECTA */}
              {!guide && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Pautas del Programa Hoplita</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {technicalNotes ||
                      "Mantén tensión continua, control estricto de la fase excéntrica y postura neutra de la columna en cada repetición."}
                  </p>
                  {errorState && (
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      Nota: {errorState}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

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
