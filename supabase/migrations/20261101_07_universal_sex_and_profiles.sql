-- ====================================================================
-- HOPLITA OS - UNIVERSAL MULTI-USER & PHYSIOLOGICAL SEX MIGRATION
-- Migration: 20261101_07_universal_sex_and_profiles.sql
-- ====================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male' CHECK (sex IN ('male', 'female'));

-- Actualizar perfiles existentes
UPDATE public.profiles SET sex = 'male' WHERE slug = 'juan' OR id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET sex = 'male' WHERE slug = 'nato' OR id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET sex = 'female', target_body_fat_pct = 21.0 WHERE slug = 'wendy' OR id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET sex = CASE WHEN gender = 'female' OR role = 'hoplita_girl' THEN 'female' ELSE 'male' END WHERE sex IS NULL;
