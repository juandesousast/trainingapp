-- ====================================================================
-- HOPLITA OS - MULTI-USER RLS POLICIES FOR SHARED ATHLETES
-- Migration: 20261101_08_open_rls_for_multiuser.sql
-- ====================================================================

-- 1. Profiles
DROP POLICY IF EXISTS "Owner read profile" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read profiles" ON public.profiles FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Authenticated can update profile" ON public.profiles;
CREATE POLICY "Authenticated can update profile" ON public.profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can insert profile" ON public.profiles;
CREATE POLICY "Authenticated can insert profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Biometrics & Habits
DROP POLICY IF EXISTS "Owner access biometric_logs" ON public.biometric_logs;
CREATE POLICY "Authenticated access biometric_logs" ON public.biometric_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Owner access daily_habits" ON public.daily_habits;
CREATE POLICY "Authenticated access daily_habits" ON public.daily_habits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Maxes & Mesocycles
DROP POLICY IF EXISTS "Owner access user_maxes" ON public.user_maxes;
CREATE POLICY "Authenticated access user_maxes" ON public.user_maxes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Owner access user_mesocycles" ON public.user_mesocycles;
CREATE POLICY "Authenticated access user_mesocycles" ON public.user_mesocycles FOR ALL TO authenticated USING (true) WITH CHECK (true);
