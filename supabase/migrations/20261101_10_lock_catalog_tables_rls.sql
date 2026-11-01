-- ====================================================================
-- VECTOR OS - LOCK DOWN CATALOG TABLES RLS POLICIES
-- Migration: 20261101_10_lock_catalog_tables_rls.sql
-- ====================================================================

-- 1. Eliminar políticas públicas permisivas de escritura en tablas de catálogo
DROP POLICY IF EXISTS "Public write mr_coefficients" ON public.mr_coefficients;
DROP POLICY IF EXISTS "Public write exercises" ON public.exercises;
DROP POLICY IF EXISTS "Public write mesocycles" ON public.mesocycles;
DROP POLICY IF EXISTS "Public write workouts" ON public.workouts;
DROP POLICY IF EXISTS "Public write workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Public write logged_sets" ON public.logged_sets;
DROP POLICY IF EXISTS "Public write workout_sessions" ON public.workout_sessions;

-- 2. Asegurar que solo se permita SELECT para catálogo público y usuarios autenticados
DROP POLICY IF EXISTS "Public read mr_coefficients" ON public.mr_coefficients;
CREATE POLICY "Public read mr_coefficients" ON public.mr_coefficients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exercises" ON public.exercises;
CREATE POLICY "Public read exercises" ON public.exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read mesocycles" ON public.mesocycles;
CREATE POLICY "Public read mesocycles" ON public.mesocycles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read workouts" ON public.workouts;
CREATE POLICY "Public read workouts" ON public.workouts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read workout_exercises" ON public.workout_exercises;
CREATE POLICY "Public read workout_exercises" ON public.workout_exercises FOR SELECT USING (true);
