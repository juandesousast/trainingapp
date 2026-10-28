# CONTEXTO MAESTRO DEL PROYECTO: "TRINING APP" (HOPLITA OS)

## 1. VISIÓN Y ESTÉTICA (INSPIRACIÓN: NIKE TRAINING CLUB + APPLE FITNESS+)
Aplicación PWA (Mobile-First) para seguimiento de entrenamiento de fuerza, recomposición corporal y hábitos diarios para dos usuarios: **Él (Perfil Hoplita)** y **Ella (Perfil Hoplita Girl)**.

### Sistema de Diseño ("Nike Training Club Dark Kinetic"):
- **Paleta Base:** Fondo `bg-zinc-950` (#09090B), superficies Bento `bg-zinc-900/80` con bordes `border-zinc-800/80` y `backdrop-blur-md`.
- **Acentos Dinámicos por Usuario:**
  - Perfil Hoplita (Él): Volt / Verde Lima Nike (`#CCFF00` / `lime-400`).
  - Perfil Hoplita Girl (Ella): Hyper Pink / Coral (`#F43F5E` / `rose-500`).
- **Tipografía yJerarquía:** Títulos atléticos contundentes (`font-extrabold tracking-tight uppercase` estilo Nike Futura/Inter) y números monoespaciados (`font-mono tabular-nums`) para kilos, repeticiones, porcentajes de 1RM y cronómetros.
- **Experiencia de Usuario (Cero Fricción):**
  - Interfaz "Cero-Teclado": Botones táctiles grandes (`+` / `-`) para subir/bajar kilos y repeticiones con el pulgar.
  - Referencia histórica siempre visible: Muestra debajo de cada serie lo logrado en la exposición anterior.
  - Isla Flotante de Descanso: Al marcar una serie como completada, se activa automáticamente el cronómetro con la pausa exacta estipulada en el mesociclo y emite un aviso sonoro (Web Audio API).

---

## 2. INFRAESTRUCTURA Y VARIABLES DE ENTORNO
- **Proyecto en GitHub, Vercel y Supabase:** `trining-app`
- **Stack:** Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui + Framer Motion + Zustand (estado local persistente del entreno) + Recharts (gráficas corporales) + `@remotion/player` (guía visual de ejercicios y tempo).
- **Variables de entorno (`.env.local` - NUNCA commitear valores reales):**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (Configurada en entorno seguro)

---

## 3. DATOS BIOMÉTRICOS Y NUTRICIONALES DE PARTIDA (BASELINE)
El módulo de "Báscula Inteligente y Diario" parte de estos valores base medidos en ayunas para el usuario masculino (Hoplita):
- **Peso en ayunas:** 82,15 kg (IMC: 25,4)
- **Grasa corporal:** 25,6% (21,03 kg de grasa) | **Grasa subcutánea:** 22,8% | **Grasa visceral:** 8
- **Masa libre de grasa:** 61,12 kg (Masa muscular: 58,08 kg | Masa ósea: 3,04 kg | Músculo esquelético: 47,9%)
- **Agua corporal:** 53,7% | **Proteína:** 17,0%
- **Tasa Metabólica Basal:** 1.683 kcal (Edad metabólica: 37)
- **Objetivo Recomposición Corporal:** Bajar hacia el 16% de grasa ganando masa muscular (~1.950–2.050 kcal/día, 165–180 g de proteína/día).
- **Hábitos diarios a registrar (Pestaña DIARIO de todos los Excels):** Horas de sueño (6 o menos, 7, 8, 9, 10+), Peso en ayunas, Condición psicológica (1 Óptima a 5 Muy negativa), RPE global de la sesión (1-10), Calidad del entrenamiento (1-10), Hora inicio/fin.

---

## 4. LÓGICA DE ENTRENAMIENTO Y MOTOR DE REMOTION
La app debe soportar 4 mecánicas específicas extraídas de los Excels del sistema BIIO Modificado:
1. **Pirámide Inversa / Series Clásicas (Mesociclos 1 y 2):** Ej. `3 x 15-12-10` o `3 x 8-6-4`.
2. **Entrenamiento por % de 1RM y RPE (Mesociclos 3, 4 y 5):** Calcula automáticamente el peso en kg multiplicando el porcentaje indicado (ej. `0.75`, `0.80`, `0.875`) por el `1RM` del usuario guardado en la tabla de Maximales o estimado mediante la tabla de coeficientes `M&R`.
3. **Jump Sets / Circuitos (Todos los Mesociclos):** Bloques finales donde se alternan 2 o 3 ejercicios (`Alterno con` / `en JUMP SET con`) con pausas cortas de `15"`, `30"`, `45"` o `60"`. La UI debe agruparlos en una tarjeta de circuito.
4. **Cluster Sets con Rest-Pause (Mesociclo 5):** Cada serie consta de **1 repetición cada 15", 20" o 25" dejando la barra** hasta completar 8 repeticiones totales (o bloques de 2 reps en Hip Thrust). Incluye un temporizador especial de Cluster.
5. **Visualizador `@remotion/player`:** Superpone sobre el vídeo/GIF del ejercicio (alojado en Supabase Storage a partir del dataset estático de ExerciseDB) las notas técnicas del Excel y la barra de Tempo (especialmente en el Mesociclo 3: *"Fase Negativa controlada - Pausa isométrica 1" abajo - Fase Positiva Explosiva - Pausa 1" arriba"*).

---

## 5. ESPECIFICACIÓN COMPLETA DE LOS 5 MESOCICLOS (HOPLITA & HOPLITA GIRL)

### MESOCICLO 1: REACONDICIONAMIENTO (Split A + B | 6 Exposiciones por entreno = 12 sesiones)
- **Progresión de series principales (Exposiciones 1º a 6º):**
  - Exp 1º y 2º: `3 x 15 / 12 / 10` (Pausa `1'30"`)
  - Exp 3º y 4º: `3 x 12 / 10 / 8` (Pausa `1'45"`)
  - Exp 5º y 6º: `3 x 10 / 8 / 6` (Pausa `2'00"`)
- **Progresión del Tri-Set final (Alterno con, pausa `30"` entre ejercicios):**
  - Exp 1º: `2 x 12` | Exp 2º a 6º: `3 x 12`

#### 1A. Perfil HOPLITA (Él):
- **Entreno A:**
  1. `BOX SQUAT` (Nota: *1" Pausa en Box*) -> Prog. Principal
  2. `PRESS BANCA` (Nota: *1" Pausa al Pecho*) -> Prog. Principal
  3. `REMO o SEAL ROW` (Nota: *Espalda Recta*) -> Prog. Principal
  4. **Tri-Set (Pausa 30"):** `CURL con BARRA` + `HIPEREXTENSION` + `CALF MACHINE` (`2x12` en 1º, `3x12` de 2º a 6º)
- **Entreno B:**
  1. `PESO MUERTO` (Nota: *Espalda Neutra*) -> Prog. Principal
  2. `PRESS MILITAR` (Nota: *Hasta las Clavículas*) -> Prog. Principal
  3. `DOMINADAS (o LAT MACHINE)` (Nota: *Tocando el Pecho*) -> Prog. Principal
  4. **Tri-Set (Pausa 30"):** `PRENSA 45º` + `CRUNCH INVERSO` + `FONDOS TRICEPS` (`2x12` en 1º, `3x12` de 2º a 6º)

#### 1B. Perfil HOPLITA GIRL (Ella):
- **Entreno A:**
  1. `BOX SQUAT` (Nota: *1" Pausa en Box*) -> Prog. Principal
  2. `PRESS MILITAR SENTADA` (Nota: *Hasta las Clavículas*) -> Prog. Principal
  3. `REMO LANDMINE o SEAL ROW` (Nota: *Espalda Recta*) -> Prog. Principal
  4. **Tri-Set (Pausa 30"):** `CURL con BARRA` + `HIPEREXTENSION` + `CALF MACHINE` (`2x12` en 1º, `3x12` de 2º a 6º)
- **Entreno B:**
  1. `PESO MUERTO` (Nota: *Espalda Neutra*) -> Prog. Principal
  2. `HIP THRUST` (Nota: *Pausa 1" arriba*) -> Prog. Principal
  3. `DOMINADAS (o LAT MACHINE)` (Nota: *Tocando el Pecho*) -> Prog. Principal
  4. **Tri-Set (Pausa 30"):** `PRENSA 45º` + `CRUNCH INVERSO` + `PRESS ESTRECHO (TRICEPS)` (`2x12` en 1º, `3x12` de 2º a 6º)

---

### MESOCICLO 2: PREPARACIÓN FUERZA (Split A + B + C | 3 Microciclos: 1º y 2º RIR 0 Al Fallo, 3º Descarga Técnica)
- **Regla de progresión:** En el 2º microciclo, añadir 1 kg o más si en la primera serie del 1º micro se alcanzaron las repeticiones target.

#### 2A. Perfil HOPLITA (Él):
- **Entreno A (Piernas - Femorales - Hombros - Abdomen - Gemelos):**
  1. `SQUAT` (Nota: *Control Espalda Baja*): 1º `3 x 8/6/4` (Pausa `2'00"`) | 2º `3 x 8/6/4` (Pausa `2'30"`) | 3º Descarga `8 x 3 @ 8RM` (Pausa `1'00"`)
  2. `LEG CURL` (Nota: *Lento y Controlado*): 1º `3 x 10` (`2'00"`) | 2º `3 x 8` (`2'00"`) | 3º `2 x 6` (`3'00"`)
  3. `PRESS MILITAR` (Nota: *Hasta las Clavículas*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  4. `PRESS con MANCUERNAS` (Nota: *Recorrido Completo*): 1º `3 x 10` (`2'00"`) | 2º `3 x 8` (`2'00"`) | 3º `2 x 6` (`3'00"`)
  5. **Jump Set:** `CALF MACHINE` + `CRUNCH INVERSO`: 1º `3 x 20` (Pausa `1'00"`) | 2º `4 x 20` (Pausa `45"`) | 3º `2 x 20` (Pausa `30"`)
- **Entreno B (Pecho - Tríceps - Gemelos - Piernas Recall):**
  1. `PRESS BANCA` (Nota: *1" Pausa al Pecho*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  2. `PRESS INCLINADO 45º` (Nota: *Brazos en Plano Sagital*): 1º `3 x 10` (`2'00"`) | 2º `3 x 8` (`2'00"`) | 3º `2 x 6` (`3'00"`)
  3. `PRESS TRICEPS o FONDOS` (Nota: *Codos cerrados*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  4. `BOX SQUAT` (Nota: *Controlar Butt Wink*): 1º `6 x 2 @ 8RM Pausa 2"` (`1'00"`) | 2º `6 x 2 @ 8RM Pausa 2"` (`1'00"`) | 3º `1 x MAX @ 8RM Sin Pausa`
  5. **Jump Set:** `HIPEREXTENSION 45º` + `CALF en PRENSA`: 1º `3 x 12` (`1'00"`) | 2º `4 x 12` (`45"`) | 3º `2 x 12` (`30"`)
- **Entreno C (Espalda - Bíceps - Abdomen - Cuádriceps):**
  1. `PESO MUERTO` (Nota: *No rebotar abajo - Concéntricas - Espalda Neutra*): 1º `4 x 8/6/4/2` (`2'00"`) | 2º `4 x 8/6/4/2` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  2. `DOMINADAS` (Nota: *Tocar el Pecho*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  3. `CURL con BARRA` (Nota: *Control Escápulas*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  4. **Jump Set (Tri-Set):** `CRUNCH INVERTIDO` + `LEG EXTENSION` + `REMO BARRA o SEAL ROW`: 1º `3 x 12` (`45"`) | 2º `4 x 12` (`30"`) | 3º `2 x 12` (`15"`)

#### 2B. Perfil HOPLITA GIRL (Ella):
- **Entreno A:**
  1. `PRESS MILITAR` (Nota: *Hasta las Clavículas*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  2. `SQUAT` (Nota: *Control Espalda Baja*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  3. `LEG CURL` (Nota: *Lento y Controlado*): 1º `3 x 10` (`2'00"`) | 2º `3 x 8` (`2'00"`) | 3º `2 x 6` (`3'00"`)
  4. `HIP THRUST [1" PEAK]` (Nota: *Pausa Arriba 1"*): 1º `3 x 12` (`2'00"`) | 2º `3 x 10` (`2'00"`) | 3º `2 x 8` (`3'00"`)
  5. **Jump Set:** `CALF MACHINE` + `CRUNCH INVERSO`: 1º `3 x 20` (`1'00"`) | 2º `4 x 20` (`45"`) | 3º `2 x 20` (`30"`)
- **Entreno B:**
  1. `ELEVACIÓN LATERAL` (Nota: *Brazos en Plano Escapular*): 1º `3 x 12` (`1'30"`) | 2º `3 x 10` (`1'30"`) | 3º `2 x 8` (`1'30"`)
  2. `PRESS MANCUERNAS` (Nota: *1" Pausa abajo*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  3. `PRESS ESTRECHO [RIR 1 o RIR 2]` (Nota: *Codos cerrados*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  4. `BOX SQUAT` (Nota: *Controlar Butt Wink*): 1º `6 x 2 @ 8RM Pausa 2"` (`1'00"`) | 2º `6 x 2 @ 8RM Pausa 2"` (`1'00"`) | 3º `1 x MAX @ 8RM Sin Pausa`
  5. **Jump Set:** `REMO TRX o SEAL ROW` + `FRENCH PRESS`: 1º `3 x 12` (`1'00"`) | 2º `4 x 12` (`45"`) | 3º `2 x 12` (`30"`)
- **Entreno C:**
  1. `PESO MUERTO` (Nota: *No rebotar abajo - Espalda Neutra*): 1º `4 x 8/6/4/2` (`2'00"`) | 2º `4 x 8/6/4/2` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  2. `DOMINADAS` (Nota: *Tocar el Pecho*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  3. `CURL con BARRA` (Nota: *Control Escápulas*): 1º `3 x 8/6/4` (`2'00"`) | 2º `3 x 8/6/4` (`2'30"`) | 3º `8 x 3 @ 8RM` (`1'00"`)
  4. **Jump Set (Tri-Set):** `CRUNCH INVERTIDO` + `LEG EXTENSION o PRENSA 45º` + `HIPEREXTENSION 45º`: 1º `3 x 12` (`45"`) | 2º `4 x 12` (`30"`) | 3º `2 x 12` (`15"`)

---

### MESOCICLO 3: ESPECIALIZACIÓN TÉCNICA (Split A + B | 7 Exposiciones: 1º a 6º Carga, 7º Descarga Técnica)
- **Cadencia / Tempo Obligatorio (Remotion):** *Fase Negativa controlada - Pausa isométrica 1" abajo - Fase Positiva Explosiva - Pausa 1" arriba*.
- **Progresión de Ejercicios Principales (1º a 7º):**
  - 1º: `8 x 3 @ 75%` (Pausa `1'00"`)
  - 2º: `7 x 4 @ 75%` (Pausa `1'15"`)
  - 3º: `6 x 5 @ 75%` (Pausa `1'30"`)
  - 4º: `8 x 3 @ 80%` (Pausa `1'00"`)
  - 5º: `7 x 4 @ 80%` (Pausa `1'15"`)
  - 6º: `6 x 5 @ 80%` (Pausa `1'30"`)
  - 7º (Descarga): `8 x 2 @ 85%` (Pausa `1'30"`)
- **Progresión de Jump Sets secundarios (1º a 7º, Pausa `45"` en 1º-6º y `60"` en 7º):**
  - 1º, 3º, 5º: `4 x 8` | 2º, 4º, 6º: `3 x 10` | 7º: `2 x 12`

#### 3A. Perfil HOPLITA (Él):
- **Entreno A:**
  1. `PESO MUERTO` -> Prog. Principal (75% a 85%)
  2. `PRESS MILITAR` -> Prog. Principal (75% a 85%)
  3. **Jump Set 1 (Pausa 45"/60"):** `REMO BARRA "T" o MANCUERNA` + `FONDOS DE TRICEPS` (`4x8` / `3x10` / `2x12`)
  4. **Jump Set 2 (Tri-Set, Pausa 30"):** `CALF MACHINE o en PRENSA` (`20 reps`) + `PRENSA 45º o LUNGE` (`10 reps`) + `CURL con BARRA` (`8 reps`, `10` en 7º) -> `3 series` (1º a 6º), `1 serie` (7º)
- **Entreno B:**
  1. `SQUAT` -> Prog. Principal (75% a 85%)
  2. `PRESS BANCA` -> Prog. Principal (75% a 85%)
  3. **Jump Set 1 (Pausa 45"/60"):** `PRESS FRANCES` + `DOMINADAS` (`4x8` / `3x10` / `2x12`)
  4. **Jump Set 2 (Pausa 45"/60"):** `CRUNCH INVERSO` (`20 reps`) + `GLUTE HAM RAISE o LEG CURL` (`10 reps`) -> `3 series` (1º a 6º), `1 serie` (7º)

#### 3B. Perfil HOPLITA GIRL (Ella):
- **Entreno A:**
  1. `PESO MUERTO` -> Prog. Principal (75% a 85%)
  2. `REMO LANDMINE o SEAL ROW` -> Prog. Principal (75% a 85%)
  3. **Jump Set 1 (Pausa 45"/60"):** `ELEVACIONES LATERALES` + `PRESS ESTRECHO (TRICEPS)` (`4x8` / `3x10` / `2x12`)
  4. **Jump Set 2 (Tri-Set, Pausa 30"):** `CALF MACHINE o en PRENSA` (`20 reps`) + `PRENSA 45º o LEG EXTENSION` (`10 reps`) + `CURL con BARRA` (`8 reps`, `10` en 7º) -> `3 series` (1º a 6º), `1 serie` (7º)
- **Entreno B:**
  1. `SQUAT` -> Prog. Principal (75% a 85%)
  2. `PRESS MILITAR SENTADA` -> Prog. Principal (75% a 85%)
  3. **Jump Set 1 (Pausa 45"/60"):** `PRESS FRANCES` + `LAT MACHINE (SUPINA)` (`4x8` / `3x10` / `2x12`)
  4. **Jump Set 2 (Tri-Set, Pausa 30"):** `CRUNCH INVERTIDO` (`20 reps`) + `GLUTE HAM RAISE o LEG CURL` (`10 reps`) + `HIP THRUST o HIPEREXTENSION 45º` (`12 reps`) -> `3 series` (1º a 6º), `1 serie` (7º)

---

### MESOCICLO 4: FUERZA 1 (Split A + B | 5 Exposiciones: 1º a 4º Carga, 5º Descarga Técnica)
- **Progresión de Ejercicios Principales (1º a 5º):**
  - 1º (RPE 7/8): `4 x 4 @ 80%` (Pausa `3'00"`)
  - 2º (RPE 8/9): `4 x 4 @ 82.5%` (Pausa `3'00"`)
  - 3º (RPE 9/10): `4 x 4 @ 85%` (Pausa `3'00"`)
  - 4º (RPE 10): `4 x 4 @ 87.5%` (Pausa `3'00"`)
  - 5º (Descarga Técnica): `8 x 3 @ 75%` (Pausa `1'00"`)
- **Progresión de Jump Set Final (Tri-Set @ RPE 10, Pausa `30"` entre ejercicios):**
  - 1º, 2º, 3º: `3 x 12` | 4º: `2 x 12` | 5º: `1 x 12`

#### 4A. Perfil HOPLITA (Él):
- **Entreno A:**
  1. `SQUAT` (Nota: *Control Exc - Subir Explosivo*) -> Prog. Principal (`4x4`)
  2. `PRESS BANCA` (Nota: *1" Pausa - Subida Explosiva*) -> Prog. Principal (`4x4`)
  3. `REMO o SEAL ROW` (Nota: *Espalda neutra - Explosivo*) -> Prog. Principal (`4x4`)
  4. **Jump Set (Pausa 30"):** `CRUNCH INVERSO` + `HIPEREXTENSION o LEG CURL` + `CURL CON BARRA`
- **Entreno B:**
  1. `PESO MUERTO` (Nota: *Arrancadas - No rebote*) -> Prog. Principal (`4x4`)
  2. `PRESS MILITAR SENTADO` (Nota: *Arrancadas - No rebote*) -> Prog. Principal (`4x4`)
  3. `DOMINADAS SUPINAS` (Nota: *Explosivo Hasta Pecho*) -> Prog. Principal (`4x4`)
  4. **Jump Set (Pausa 30"):** `PRENSA 45º o LEG EXTENSION` + `CALF MACHINE o DONKEY` + `FONDOS TRICEPS`

#### 4B. Perfil HOPLITA GIRL (Ella):
- **Entreno A:**
  1. `SQUAT` -> Prog. Principal (`4x4`)
  2. `PRESS MILITAR` -> Prog. Principal (`4x4`)
  3. `REMO o SEAL ROW` -> Prog. Principal (`4x4`)
  4. **Jump Set (Pausa 30"):** `CRUNCH INVERSO` + `HIPEREXTENSION o LEG CURL` + `CURL CON BARRA`
- **Entreno B:**
  1. `PESO MUERTO` -> Prog. Principal (`4x4`)
  2. `HIP THRUST` (Nota: *Arrancadas - No rebote*) -> Prog. Principal (`4x4`)
  3. `DOMINADAS SUPINAS` -> Prog. Principal (`4x4`)
  4. **Jump Set (Pausa 30"):** `PRENSA 45º o LEG EXTENSION` + `CALF MACHINE o DONKEY` + `PRESS ESTRECHO o FONDOS TRICEPS`

---

### MESOCICLO 5: FUERZA 2 + SESIONES DE MAXIMALES (Split A + B + C | 4 Microciclos + Test 1RM)
- **Mecánica Cluster Set (Ejercicios Principales):** Cada serie consta de **1 repetición cada 15" (Micro 1), 20" (Micro 2) o 25" (Micro 3)** dejando la barra hasta completar **8 repeticiones por serie**. Pausa entre series Cluster: `4'00"`.
  - Micro 1º: `2 o 3 series x 8 reps totales @ 87.5% (Rest Pause 15")`
  - Micro 2º: `3 series x 8 reps totales @ 90% (Rest Pause 20")`
  - Micro 3º: `2 series x 8 reps totales @ 92.5% (Rest Pause 25")`
  - Micro 4º (Descarga): `10 x 1 @ 95% Normal` (Pausa `2'00"`)

#### 5A. Perfil HOPLITA (Él):
- **Entreno A:**
  1. `SQUAT` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `PRESS BANCA` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  3. **Jump Set (Pausa 30", 60" en 4º):** `CURL con BARRA` + `LEG EXTENSION o PRENSA 45º` (1º `5x8 RPE 8` | 2º `5x8 RPE 9` | 3º `4x8 RPE 10` | 4º `2xMAX al fallo`)
- **Entreno B:**
  1. `PESO MUERTO` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `DOMINADAS SUPINAS` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  3. **Jump Set (Pausa 30", 60" en 4º):** `LEG CURL o GLUTE HAM RAISE` + `CRUNCH INVERTIDO` (`5x8` / `5x8` / `4x8` / `2xMAX`)
- **Entreno C:**
  1. `PRESS MILITAR SENTADO` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `PRESS AGARRE ESTRECHO o FONDOS TRICEPS` -> Cluster Set al `85%` (1º), `87.5%` (2º), `90%` (3º), `10x1 @ 92.5%` (4º)
  3. **Jump Set (Pausa 30", 60" en 4º):** `CALF en PRENSA` (`12 RM`) + `BOX SQUAT (2" pausa)` (`4 reps @ 70%`, `5 reps @ 70%` en 4º) -> `5 series` (1º y 2º), `4 series` (3º), `2 series` (4º)
- **Sesiones de Maximales (Test 1RM con Ramping: x3 @ RPE 8, x2 @ RPE 8, x1 @ RPE 8, x1 @ RPE 9, x1 @ RPE 10):**
  - Sesión 1: `SQUAT`, `PRESS MILITAR SENTADO`, `PRESS ESTRECHO o FONDOS TRICEPS` + complementos (`GEMELOS EN PRENSA 1x15`, `CRUNCH INVERSO 2x20`).
  - Sesión 2: `PESO MUERTO`, `JALONES INVERTIDOS o REMO o SEAL ROW`, `DEAD CURL`, `PRESS BANCA`.

#### 5B. Perfil HOPLITA GIRL (Ella):
- **Entreno A:**
  1. `PRESS MILITAR SENTADA` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `SQUAT` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  3. **Jump Set (Pausa 30", 60" en 4º):** `PRESS ESTRECHO o FONDOS` + `LEG EXTENSION o PRENSA 45º` (`5x8` / `5x8` / `4x8` / `2xMAX`)
- **Entreno B:**
  1. `JALONES SUPINOS o DOMINADAS` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `PESO MUERTO` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  3. **Jump Set (Pausa 30", 60" en 4º):** `LEG CURL o GLUTE HAM RAISE` + `CRUNCH INVERTIDO` (`5x8` / `5x8` / `4x8` / `2xMAX`)
- **Entreno C:**
  1. `SEAL ROW o BENT OVER ROW` -> Cluster Set (`87.5%` / `90%` / `92.5%` / `10x1 @ 95%`)
  2. `HIP THRUST (pausa 1")` -> Cluster Set realizando **2 repeticiones en cada Cluster**: 1º `2-3 x (2) @ 85% Rest Pause 10"` | 2º `3 x (2) @ 87.5% Rest Pause 15"` | 3º `2 x (2) @ 90% Rest Pause 20"` | 4º `2 x AMRAP @ 80%`
  3. **Jump Set (Tri-Set, Pausa 30", 60" en 4º):** `CALF en PRENSA` (`12 RM`) + `DEAD CURL (BICEPS)` (`5 @ 75%`, `AMRAP` en 4º) + `ELEVACIONES LATERALES` (`12 RM`) -> `5 series` (1º y 2º), `4 series` (3º), `2 series` (4º)
- **Sesiones de Maximales (Test 1RM con Ramping):**
  - Sesión 1: `SQUAT`, `PRESS MILITAR SENTADO`, `SEAL ROW o REMO` + complementos (`GEMELOS EN PRENSA 1x15`, `CRUNCH INVERSO 2x20`).
  - Sesión 2: `PESO MUERTO`, `HIP THRUST`, `DEAD CURL`, `DOMINADAS SUPINAS o JALONES SUPINOS`.