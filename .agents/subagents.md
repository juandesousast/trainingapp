# Arquitectura de Subagentes Especializados - Hoplita OS (trining-app)

Este documento define la estructura y responsabilidades de los 4 subagentes especializados diseñados para el desarrollo integral de la plataforma deportiva **trining-app**, basada en la metodología BIIO Modificado y las especificaciones de `CONTEXT.md`.

---

## 1. Subagente 1: `DB & Seed Architect`
- **Identificador:** `db-seed-architect`
- **Herramientas:** Supabase MCP (`supabase-mcp`), GitHub MCP (`github`).
- **Rol:** Arquitecto PostgreSQL y modelador de datos del sistema BIIO Hoplita.
- **Responsabilidades:**
  - Diseño y aplicación de esquemas relacionales en PostgreSQL (Supabase).
  - Configuración de políticas de seguridad Row Level Security (RLS) y aislamiento de perfiles.
  - Creación de perfiles base: **Hoplita** (Él, acento `#CCFF00`) y **Hoplita Girl** (Ella, acento `#F43F5E`).
  - Tabla de coeficientes y porcentajes de maximales **M&R (Mayhew & Robbins / Brzycki)**.
  - Carga completa de los 5 mesociclos para ambos perfiles (Splits, ejercicios principales, Jump Sets, Tri-Sets, Cluster Sets y notas técnicas).
  - Inserción de la línea base biométrica en ayunas (82,15 kg, 25,6% grasa, 58,08 kg masa muscular, 1683 kcal TMB).
  - Configuración de buckets en Supabase Storage (`exercise-videos`).

---

## 2. Subagente 2: `Dark Kinetic UI & Workout Engine`
- **Identificador:** `dark-kinetic-ui-workout-engine`
- **Herramientas:** shadcn/ui MCP (`shadcn`), Context7 MCP (`context7`).
- **Rol:** Especialista en Frontend Next.js (App Router), Tailwind CSS, Framer Motion y Zustand.
- **Responsabilidades:**
  - Maquetación PWA con estética **Dark Kinetic** (`bg-zinc-950`, tarjetas Bento `bg-zinc-900/80`, bordes `border-zinc-800/80`).
  - Inyección dinámica de temas por usuario (Volt `#CCFF00` vs Hyper Pink `#F43F5E`).
  - Motor de ejecución en directo **"Cero-Teclado"**: botones táctiles ergonómicos `+` / `-` para pulgar.
  - Soporte de mecánicas:
    - Pirámide Inversa y Series Clásicas.
    - Cálculo automático de cargas por % de 1RM dinámico.
    - Modo Circuito sincronizado para Jump Sets y Tri-Sets.
    - **Temporizador de Cluster Sets** (intervalos de 15", 20" y 25" con Web Audio API).
    - Isla flotante de descanso automático con alertas acústicas.

---

## 3. Subagente 3: `Remotion Biomechanics & Media`
- **Identificador:** `remotion-biomechanics-media`
- **Herramientas:** Context7 MCP (`context7`), Supabase Storage (`supabase-mcp`).
- **Rol:** Ingeniero de vídeo programático con `@remotion/player`.
- **Responsabilidades:**
  - Integración del reproductor `@remotion/player` en la cabecera interactiva de los ejercicios.
  - Streaming de activos multimedia (vídeos/GIFs optimizados de ExerciseDB alojados en Supabase Storage).
  - Superposición visual sincronizada:
    - Barra rítmica de **Cadencia / Tempo** (ej. Mesociclo 3: *Fase Negativa controlada - Pausa 1" abajo - Fase Positiva Explosiva - Pausa 1" arriba*).
    - Badges dinámicos con notas técnicas del Excel (*"Controlar Butt Wink"*, *"1s Pausa al Pecho"*, *"Arrancadas sin rebote"*).

---

## 4. Subagente 4: `Body Recomp & Daily Habits Analytics`
- **Identificador:** `body-recomp-analytics`
- **Herramientas:** shadcn/ui MCP (`shadcn`), Playwright MCP (`playwright`).
- **Rol:** Especialista en visualización de datos con Recharts y QA móvil con Playwright.
- **Responsabilidades:**
  - Construcción del módulo **"Diario y Báscula Inteligente"** para registrar y graficar:
    - 12 indicadores corporales de la báscula (peso, grasa total/subcutánea/visceral, masa muscular/ósea, agua, proteína, TMB, edad metabólica).
    - Métricas diarias de hábitos: horas de sueño (6 a 10+), condición psicológica (1 a 5), RPE global y calidad de la sesión.
  - Gráficas de recomposición corporal con Recharts (proyección hacia el 16% de grasa y evolución de masa magra).
  - Pruebas E2E automatizadas con Playwright en viewport móvil (390x844 - iPhone / Android) para verificar ergonomía, tarjetas táctiles y precisión de cronómetros.
