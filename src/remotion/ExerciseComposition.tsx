"use client";

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

export interface ExerciseCompositionProps {
  exerciseName: string;
  muscleGroup?: string;
  videoUrl?: string;
  mediaUrl?: string;
  secondaryMediaUrl?: string;
  viewMode?: "tempo" | "tecnica";
  tempo?: string; // e.g. "3-1-X-1", "3-0-X-1", "2-1-2-1"
  notes?: string;
  isCluster?: boolean;
  themeAccent?: string;
}

export const ExerciseComposition: React.FC<ExerciseCompositionProps> = ({
  exerciseName = "Sentadilla BIIO",
  muscleGroup = "Piernas / Cuádriceps",
  videoUrl,
  mediaUrl,
  secondaryMediaUrl,
  viewMode = "tempo",
  tempo = "3-1-X-1",
  notes = '1" Pausa abajo · Control estricto',
  isCluster = false,
  themeAccent = "#CCFF00",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Parsear el tempo "E-PI-C-PA" (Excéntrica - Pausa Inf - Concéntrica - Pausa Sup)
  const tempoParts = (tempo || "3-1-1-1").split("-");
  const parseSecs = (val: string | undefined, defaultVal: number) => {
    if (!val) return defaultVal;
    if (val.toUpperCase() === "X") return 1; // Explosivo = 1s aprox
    const num = parseFloat(val);
    return isNaN(num) ? defaultVal : num;
  };

  const eccentricSecs = parseSecs(tempoParts[0], 3);
  const bottomPauseSecs = parseSecs(tempoParts[1], 1);
  const concentricSecs = parseSecs(tempoParts[2], 1);
  const topPauseSecs = parseSecs(tempoParts[3], 1);

  const totalCycleSecs =
    eccentricSecs + bottomPauseSecs + concentricSecs + topPauseSecs;
  const totalCycleFrames = Math.max(30, Math.round(totalCycleSecs * fps));

  // Loop de la repetición dentro del vídeo
  const currentCycleFrame = frame % totalCycleFrames;
  const currentCycleSecs = currentCycleFrame / fps;

  // Determinar la fase actual
  const eccentricEnd = eccentricSecs;
  const bottomPauseEnd = eccentricEnd + bottomPauseSecs;
  const concentricEnd = bottomPauseEnd + concentricSecs;

  let currentPhaseName = "EXCÉNTRICA";
  let currentPhaseDesc = "Bajada Controlada";
  let phaseProgress = 0;
  let phaseIdx = 0;

  if (currentCycleSecs < eccentricEnd) {
    currentPhaseName = "EXCÉNTRICA";
    currentPhaseDesc = "Bajada lenta y controlada";
    phaseProgress = currentCycleSecs / eccentricSecs;
    phaseIdx = 0;
  } else if (currentCycleSecs < bottomPauseEnd) {
    currentPhaseName = "PAUSA ISOMÉTRICA";
    currentPhaseDesc = "Tensión pura en el punto cero";
    phaseProgress = (currentCycleSecs - eccentricEnd) / bottomPauseSecs;
    phaseIdx = 1;
  } else if (currentCycleSecs < concentricEnd) {
    currentPhaseName = "CONCÉNTRICA";
    currentPhaseDesc = "Subida explosiva y concéntrica";
    phaseProgress = (currentCycleSecs - bottomPauseEnd) / concentricSecs;
    phaseIdx = 2;
  } else {
    currentPhaseName = "PAUSA SUPERIOR";
    currentPhaseDesc = "Bloqueo y respiración";
    phaseProgress =
      (currentCycleSecs - concentricEnd) /
      (totalCycleSecs - concentricEnd || 1);
    phaseIdx = 3;
  }

  // Animación del badge de notas
  const noteEntrance = spring({
    frame: frame % 120,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Animación metrónomo de pulso cinético
  const pulseScale = interpolate(
    Math.sin((currentCycleFrame / totalCycleFrames) * Math.PI * 2),
    [-1, 1],
    [0.92, 1.08]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#09090B",
        color: "#FAFAFA",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* 1. VÍDEO / ILUSTRACIÓN TÉCNICA O ANIMACIÓN VECTORIAL DE RESPALDO */}
      {viewMode === "tecnica" && (videoUrl || mediaUrl) ? (
        videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.75,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#09090B",
            }}
          >
            <img
              src={phaseIdx <= 1 ? mediaUrl : (secondaryMediaUrl || mediaUrl)}
              alt={exerciseName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "24px 0",
                filter: "contrast(1.05) brightness(0.92)",
              }}
            />
          </div>
        )
      ) : (
        /* Visualizador Vectorial Cinético cuando está en Modo Tempo o sin media */
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at center, #18181B 0%, #09090B 100%)",
          }}
        >
          {/* Anillos de pulso cinético sincronizados con el Tempo */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `2px dashed ${themeAccent}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${pulseScale})`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <div
              style={{
                width: 105,
                height: 105,
                borderRadius: "50%",
                backgroundColor: `${themeAccent}15`,
                border: `2px solid ${themeAccent}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 35px -5px ${themeAccent}44`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 900,
                  color: themeAccent,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                TEMPO
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontFamily: "monospace",
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                {tempo}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "#A1A1AA",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {muscleGroup.split("/")[0]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* GRADIENTE HUD OSCURO SUPERIOR E INFERIOR */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.1) 40%, rgba(9,9,11,0.2) 60%, rgba(9,9,11,0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 2. GRADIENTE HUD OSCURO SUPERIOR E INFERIOR */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.05) 30%, rgba(9,9,11,0.1) 60%, rgba(9,9,11,0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 3. TELEMETRÍA INFERIOR: NOTAS TÉCNICAS Y FASE ACTIVA */}
      <div
        style={{
          position: "absolute",
          bottom: 38,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          transform: `translateY(${(1 - noteEntrance) * 8}px)`,
          opacity: noteEntrance,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {notes && (
            <div
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.9)",
                border: "1px solid rgba(251, 191, 36, 0.5)",
                borderRadius: 10,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              <span style={{ fontSize: 10 }}>⚠️</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#FDE68A",
                  letterSpacing: -0.2,
                  whiteSpace: "nowrap",
                }}
              >
                {notes}
              </span>
            </div>
          )}

          {isCluster && (
            <div
              style={{
                backgroundColor: themeAccent,
                color: "#000000",
                borderRadius: 10,
                padding: "3px 6px",
                fontSize: 8,
                fontWeight: 900,
                fontFamily: "monospace",
                letterSpacing: 0.5,
              }}
            >
              CLUSTER
            </div>
          )}
        </div>

        {/* Indicador de Fase Activa en Vivo */}
        <div
          style={{
            backgroundColor: "rgba(24, 24, 27, 0.9)",
            border: `1px solid ${themeAccent}55`,
            borderRadius: 10,
            padding: "3px 8px",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              fontWeight: 900,
              color: themeAccent,
              letterSpacing: 0.5,
            }}
          >
            ● {currentPhaseName}
          </span>
        </div>
      </div>

      {/* 4. BARRA DE TEMPO CINÉTICA EN 4 FASES */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 14,
          right: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            width: "100%",
          }}
        >
          {/* Fase 1: Excéntrica */}
          <div
            style={{
              flex: eccentricSecs,
              height: 6,
              backgroundColor: "#27272A",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: phaseIdx === 0 ? `${phaseProgress * 100}%` : phaseIdx > 0 ? "100%" : "0%",
                backgroundColor: themeAccent,
                borderRadius: 3,
              }}
            />
          </div>

          {/* Fase 2: Pausa Abajo */}
          <div
            style={{
              flex: Math.max(0.5, bottomPauseSecs),
              height: 6,
              backgroundColor: "#27272A",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: phaseIdx === 1 ? `${phaseProgress * 100}%` : phaseIdx > 1 ? "100%" : "0%",
                backgroundColor: "#F59E0B",
                borderRadius: 3,
              }}
            />
          </div>

          {/* Fase 3: Concéntrica */}
          <div
            style={{
              flex: concentricSecs,
              height: 6,
              backgroundColor: "#27272A",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: phaseIdx === 2 ? `${phaseProgress * 100}%` : phaseIdx > 2 ? "100%" : "0%",
                backgroundColor: themeAccent,
                borderRadius: 3,
              }}
            />
          </div>

          {/* Fase 4: Pausa Arriba */}
          <div
            style={{
              flex: Math.max(0.5, topPauseSecs),
              height: 6,
              backgroundColor: "#27272A",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: phaseIdx === 3 ? `${phaseProgress * 100}%` : "0%",
                backgroundColor: "#F59E0B",
                borderRadius: 3,
              }}
            />
          </div>
        </div>

        {/* Etiquetas de Fase debajo de la barra */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 8,
            fontFamily: "monospace",
            color: "#71717A",
            fontWeight: 800,
          }}
        >
          <span style={{ color: phaseIdx === 0 ? themeAccent : undefined }}>
            BAJADA ({eccentricSecs}s)
          </span>
          <span style={{ color: phaseIdx === 1 ? "#F59E0B" : undefined }}>
            PAUSA ({bottomPauseSecs}s)
          </span>
          <span style={{ color: phaseIdx === 2 ? themeAccent : undefined }}>
            SUBIDA ({concentricSecs}s)
          </span>
          <span style={{ color: phaseIdx === 3 ? "#F59E0B" : undefined }}>
            ARRIBA ({topPauseSecs}s)
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
