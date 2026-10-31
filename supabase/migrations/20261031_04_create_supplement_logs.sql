-- ====================================================================
-- HOPLITA OS - SUPLEMENTACIÓN & RECUPERACIÓN SCHEMA MIGRATION
-- Migration: 20261031_04_create_supplement_logs.sql
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.daily_supplement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id TEXT NOT NULL,
    taken BOOLEAN NOT NULL DEFAULT true,
    value_numeric NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date, item_id)
);

ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily_supplement_logs" ON public.daily_supplement_logs FOR SELECT USING (true);
CREATE POLICY "Public write daily_supplement_logs" ON public.daily_supplement_logs FOR ALL USING (true);
