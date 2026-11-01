-- ====================================================================
-- HOPLITA OS - RESTORE STRICT RLS PRIVACY & ISOLATION
-- Migration: 20261101_09_restore_strict_rls_privacy.sql
-- ====================================================================

-- 1. Limpieza de datos residuales de prueba
DELETE FROM public.user_mesocycles 
WHERE profile_id IN (
    SELECT id FROM public.profiles 
    WHERE display_name ILIKE '%maría%' 
       OR display_name ILIKE '%maria%' 
       OR display_name ILIKE '%test%' 
       OR slug ILIKE '%test%'
);

DELETE FROM public.profiles 
WHERE display_name ILIKE '%maría%' 
   OR display_name ILIKE '%maria%' 
   OR display_name ILIKE '%test%' 
   OR slug ILIKE '%test%';

-- Asegurar sincronización de user_id en user_mesocycles con profiles
UPDATE public.user_mesocycles um
SET user_id = p.user_id
FROM public.profiles p
WHERE um.profile_id = p.id AND p.user_id IS NOT NULL;

-- 2. TABLA: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public write profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can update profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can delete profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can update profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner access profile" ON public.profiles;
DROP POLICY IF EXISTS "Strict user profile isolation" ON public.profiles;

CREATE POLICY "Strict user profile isolation" ON public.profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id)
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- 3. TABLA: biometric_logs
ALTER TABLE public.biometric_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read biometric_logs" ON public.biometric_logs;
DROP POLICY IF EXISTS "Public write biometric_logs" ON public.biometric_logs;
DROP POLICY IF EXISTS "Authenticated access biometric_logs" ON public.biometric_logs;
DROP POLICY IF EXISTS "Owner access biometric_logs" ON public.biometric_logs;
DROP POLICY IF EXISTS "Strict biometric logs isolation" ON public.biometric_logs;

CREATE POLICY "Strict biometric logs isolation" ON public.biometric_logs
    FOR ALL TO authenticated
    USING (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    );

-- 4. TABLA: user_maxes
ALTER TABLE public.user_maxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read user_maxes" ON public.user_maxes;
DROP POLICY IF EXISTS "Public write user_maxes" ON public.user_maxes;
DROP POLICY IF EXISTS "Authenticated access user_maxes" ON public.user_maxes;
DROP POLICY IF EXISTS "Owner access user_maxes" ON public.user_maxes;
DROP POLICY IF EXISTS "Strict user maxes isolation" ON public.user_maxes;

CREATE POLICY "Strict user maxes isolation" ON public.user_maxes
    FOR ALL TO authenticated
    USING (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    );

-- 5. TABLA: user_mesocycles
ALTER TABLE public.user_mesocycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated access user_mesocycles" ON public.user_mesocycles;
DROP POLICY IF EXISTS "Owner access user_mesocycles" ON public.user_mesocycles;
DROP POLICY IF EXISTS "Strict user mesocycles isolation" ON public.user_mesocycles;

CREATE POLICY "Strict user mesocycles isolation" ON public.user_mesocycles
    FOR ALL TO authenticated
    USING (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    );

-- 6. TABLA: workout_sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read workout_sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Public write workout_sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Owner access workout_sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Strict workout sessions isolation" ON public.workout_sessions;

CREATE POLICY "Strict workout sessions isolation" ON public.workout_sessions
    FOR ALL TO authenticated
    USING (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    );

-- 7. TABLA: logged_sets
ALTER TABLE public.logged_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read logged_sets" ON public.logged_sets;
DROP POLICY IF EXISTS "Public write logged_sets" ON public.logged_sets;
DROP POLICY IF EXISTS "Owner access logged_sets" ON public.logged_sets;
DROP POLICY IF EXISTS "Strict logged sets isolation" ON public.logged_sets;

CREATE POLICY "Strict logged sets isolation" ON public.logged_sets
    FOR ALL TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = logged_sets.session_id
              AND (
                  ws.user_id = auth.uid() 
                  OR ws.profile_id = auth.uid()
                  OR ws.profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
              )
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = logged_sets.session_id
              AND (
                  ws.user_id = auth.uid() 
                  OR ws.profile_id = auth.uid()
                  OR ws.profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
              )
        )
    );

-- 8. TABLA: daily_habits
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read daily_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "Public write daily_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "Authenticated access daily_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "Owner access daily_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "Strict daily habits isolation" ON public.daily_habits;

CREATE POLICY "Strict daily habits isolation" ON public.daily_habits
    FOR ALL TO authenticated
    USING (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = profile_id 
        OR auth.uid() = user_id 
        OR profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid())
    );

-- 9. TABLA: daily_supplement_logs
ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read daily_supplement_logs" ON public.daily_supplement_logs;
DROP POLICY IF EXISTS "Public write daily_supplement_logs" ON public.daily_supplement_logs;
DROP POLICY IF EXISTS "Strict supplement logs isolation" ON public.daily_supplement_logs;

CREATE POLICY "Strict supplement logs isolation" ON public.daily_supplement_logs
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
