-- ====================================================================
-- HOPLITA OS (TRINING APP) - POSTGRESQL SCHEMA MIGRATION
-- Migration: 20261028_01_create_schema.sql
-- ====================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: profiles (Hoplita y Hoplita Girl)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    theme_accent TEXT NOT NULL, -- Volt '#CCFF00' para él, Hyper Pink '#F43F5E' para ella
    target_body_fat_pct NUMERIC(4,2) DEFAULT 16.0,
    target_calories_daily INTEGER DEFAULT 2000,
    target_protein_daily_g INTEGER DEFAULT 170,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: biometric_logs (Registro Báscula Inteligente en ayunas)
CREATE TABLE IF NOT EXISTS public.biometric_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_fasting BOOLEAN DEFAULT TRUE,
    weight_kg NUMERIC(5,2) NOT NULL,
    bmi NUMERIC(4,1),
    body_fat_pct NUMERIC(4,1),
    body_fat_kg NUMERIC(5,2),
    subcutaneous_fat_pct NUMERIC(4,1),
    visceral_fat_rating NUMERIC(4,1),
    fat_free_mass_kg NUMERIC(5,2),
    muscle_mass_kg NUMERIC(5,2),
    bone_mass_kg NUMERIC(5,2),
    skeletal_muscle_pct NUMERIC(4,1),
    body_water_pct NUMERIC(4,1),
    protein_pct NUMERIC(4,1),
    bmr_kcal INTEGER,
    metabolic_age INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: daily_habits (Diario de hábitos: sueño, RPE, condición psicológica)
CREATE TABLE IF NOT EXISTS public.daily_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_hours NUMERIC(3,1),
    morning_weight_kg NUMERIC(5,2),
    psychological_condition INTEGER CHECK (psychological_condition BETWEEN 1 AND 5), -- 1: Óptima a 5: Muy negativa
    session_rpe INTEGER CHECK (session_rpe BETWEEN 1 AND 10),
    workout_quality INTEGER CHECK (workout_quality BETWEEN 1 AND 10),
    start_time TIME,
    end_time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, log_date)
);

-- 4. TABLA: mr_coefficients (Tabla de conversión Mayhew, Robbins, Brzycki & Epley)
CREATE TABLE IF NOT EXISTS public.mr_coefficients (
    reps INTEGER PRIMARY KEY,
    percentage NUMERIC(5,4) NOT NULL,
    coeff_mayhew NUMERIC(6,4),
    coeff_brzycki NUMERIC(6,4),
    coeff_epley NUMERIC(6,4)
);

-- 5. TABLA: exercises (Catálogo maestro de ejercicios)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    video_path TEXT,
    thumbnail_path TEXT,
    default_tempo TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: user_maxes (1RM registrado o calculado por usuario y ejercicio)
CREATE TABLE IF NOT EXISTS public.user_maxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    one_rm_kg NUMERIC(5,2) NOT NULL,
    source_reps INTEGER DEFAULT 1,
    source_weight_kg NUMERIC(5,2),
    calculation_method TEXT DEFAULT 'tested', -- 'tested', 'mayhew', 'brzycki'
    tested_at DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, exercise_id)
);

-- 7. TABLA: mesocycles (Los 5 Mesociclos del sistema BIIO Hoplita)
CREATE TABLE IF NOT EXISTS public.mesocycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 5),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    split_structure TEXT NOT NULL,
    target_goal TEXT,
    total_exposures INTEGER,
    progression_rules TEXT,
    tempo_cadence TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, number)
);

-- 8. TABLA: workouts (Entrenos dentro de cada Mesociclo: A, B, C)
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesocycle_id UUID NOT NULL REFERENCES public.mesocycles(id) ON DELETE CASCADE,
    letter TEXT NOT NULL, -- 'A', 'B', 'C'
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mesocycle_id, letter)
);

-- 9. TABLA: workout_exercises (Ejercicios asignados a un entreno con lógica BIIO)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    block_type TEXT NOT NULL CHECK (block_type IN ('main_progression', 'jump_set', 'tri_set', 'cluster_set', 'accessory')),
    group_tag TEXT, -- Identificador de grupo para Jump Sets / Tri-Sets
    technical_notes TEXT, -- '1" Pausa en Box', 'Control Espalda Baja', etc.
    tempo TEXT,
    rest_seconds INTEGER,
    scheme_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Esquema por exposición o microciclo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: workout_sessions (Sesiones ejecutadas por el usuario)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exposure_number INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    session_rpe NUMERIC(3,1),
    notes TEXT
);

-- 11. TABLA: logged_sets (Series registradas en tiempo real sin teclado)
CREATE TABLE IF NOT EXISTS public.logged_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    target_reps INTEGER,
    target_weight_kg NUMERIC(5,2),
    actual_reps INTEGER NOT NULL,
    actual_weight_kg NUMERIC(5,2) NOT NULL,
    rpe NUMERIC(3,1),
    rest_seconds_taken INTEGER,
    is_completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- CREAR BUCKET DE STORAGE PARA VIDEOS Y GIFS BIOMECÁNICOS
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exercise-videos',
    'exercise-videos',
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ====================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mr_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_maxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logged_sets ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura pública o autenticada para desarrollo ágil y subagentes
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public read biometric_logs" ON public.biometric_logs FOR SELECT USING (true);
CREATE POLICY "Public write biometric_logs" ON public.biometric_logs FOR ALL USING (true);

CREATE POLICY "Public read daily_habits" ON public.daily_habits FOR SELECT USING (true);
CREATE POLICY "Public write daily_habits" ON public.daily_habits FOR ALL USING (true);

CREATE POLICY "Public read mr_coefficients" ON public.mr_coefficients FOR SELECT USING (true);
CREATE POLICY "Public write mr_coefficients" ON public.mr_coefficients FOR ALL USING (true);

CREATE POLICY "Public read exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Public write exercises" ON public.exercises FOR ALL USING (true);

CREATE POLICY "Public read user_maxes" ON public.user_maxes FOR SELECT USING (true);
CREATE POLICY "Public write user_maxes" ON public.user_maxes FOR ALL USING (true);

CREATE POLICY "Public read mesocycles" ON public.mesocycles FOR SELECT USING (true);
CREATE POLICY "Public write mesocycles" ON public.mesocycles FOR ALL USING (true);

CREATE POLICY "Public read workouts" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Public write workouts" ON public.workouts FOR ALL USING (true);

CREATE POLICY "Public read workout_exercises" ON public.workout_exercises FOR SELECT USING (true);
CREATE POLICY "Public write workout_exercises" ON public.workout_exercises FOR ALL USING (true);

CREATE POLICY "Public read workout_sessions" ON public.workout_sessions FOR SELECT USING (true);
CREATE POLICY "Public write workout_sessions" ON public.workout_sessions FOR ALL USING (true);

CREATE POLICY "Public read logged_sets" ON public.logged_sets FOR SELECT USING (true);
CREATE POLICY "Public write logged_sets" ON public.logged_sets FOR ALL USING (true);

-- Storage bucket access
CREATE POLICY "Public Access Exercise Videos" ON storage.objects
FOR SELECT USING (bucket_id = 'exercise-videos');

CREATE POLICY "Upload Exercise Videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'exercise-videos');
