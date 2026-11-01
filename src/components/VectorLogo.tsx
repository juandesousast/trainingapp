import React from "react";

interface VectorLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  accentColor?: string;
  subtitle?: string;
}

export function VectorLogo({
  className = "",
  size = 32,
  showWordmark = false,
  accentColor = "var(--theme-accent, #CCFF00)",
  subtitle = "PERFORMANCE OS",
}: VectorLogoProps) {
  // Dimensiones según si muestra o no el wordmark
  const viewBoxWidth = showWordmark ? 280 : 100;
  const viewBoxHeight = 100;
  const aspectRatio = showWordmark ? 2.8 : 1;
  const calculatedWidth = size * aspectRatio;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        width={calculatedWidth}
        height={size}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-label="VECTOR"
      >
        <defs>
          <linearGradient id={`vectorPrimary-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={`vectorCyan-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id={`vectorMetal-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id={`vectorTextMetal-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <filter id={`vectorGlow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Emblema Vectorial V */}
        <g transform="translate(0, 0)">
          {/* Cuchillas internas cian */}
          <path
            d="M 28 38 L 47 54 L 45 60 L 25 43 Z"
            fill={`url(#vectorCyan-${size})`}
            opacity="0.9"
          />
          <path
            d="M 72 38 L 53 54 L 55 60 L 75 43 Z"
            fill={`url(#vectorCyan-${size})`}
            opacity="0.9"
          />

          {/* Punta de aguja inferior cian */}
          <polygon
            points="50,86 45,71 47,71 50,76 53,71 55,71"
            fill={`url(#vectorCyan-${size})`}
            filter={`url(#vectorGlow-${size})`}
          />

          {/* Alas principales exteriores (Volt / Accent) */}
          <g filter={`url(#vectorGlow-${size})`}>
            {/* Ala Izquierda */}
            <path
              d="M 14 22 L 37 24 L 48 52 L 48 57 L 39 74 L 32 64 L 25 78 L 20 70 L 26 50 Z"
              fill={`url(#vectorPrimary-${size})`}
            />
            {/* Ala Derecha */}
            <path
              d="M 86 22 L 63 24 L 52 52 L 52 57 L 61 74 L 68 64 L 75 78 L 80 70 L 74 50 Z"
              fill={`url(#vectorPrimary-${size})`}
            />
          </g>

          {/* Núcleo de Titanio Central */}
          <path
            d="M 39 28 L 50 36 L 61 28 L 50 54 Z"
            fill={`url(#vectorMetal-${size})`}
            stroke="#64748B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Muesca interior oscura */}
          <polygon
            points="50,42 45,35 55,35"
            fill="#090A0D"
            stroke="#475569"
            strokeWidth="0.8"
          />
        </g>

        {/* Wordmark Tipográfico (Opcional) */}
        {showWordmark && (
          <g transform="translate(102, 0)">
            {/* V en color acento lumínico */}
            <text
              x="0"
              y="63"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="44"
              fontWeight="900"
              fill={accentColor}
              letterSpacing="-0.03em"
            >
              V
            </text>

            {/* ECTOR en gradiente metálico */}
            <text
              x="32"
              y="63"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="44"
              fontWeight="900"
              fill={`url(#vectorTextMetal-${size})`}
              letterSpacing="0.04em"
            >
              ECTOR
            </text>

            {/* Subtítulo técnico */}
            <text
              x="33"
              y="81"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="9"
              fontWeight="700"
              fill="#64748B"
              letterSpacing="0.28em"
            >
              {subtitle}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
