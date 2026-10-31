-- ====================================================================
-- HOPLITA OS - SYNC M1 EXERCISE TEMPOS, TRI-SETS & PROFILE CORRECTIONS
-- Migration: 20261031_05_sync_m1_data_and_profiles.sql
-- ====================================================================

-- 1. CORRECCIÓN DE PERFILES Y ALTURA
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC;

-- Asignar altura de Juan (180 cm) y meta de grasa de Wendy (21.0%)
UPDATE public.profiles
SET height_cm = 180
WHERE slug = 'juan' OR id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles
SET target_body_fat_pct = 21.0
WHERE slug = 'wendy' OR id = '22222222-2222-2222-2222-222222222222';

-- Limpiar registro residual de prueba de Wendy en daily_habits
DELETE FROM public.daily_habits
WHERE profile_id = '22222222-2222-2222-2222-222222222222'
   OR user_id = 'b2222222-2222-4222-b222-222222222222';

-- 2. SINCRONIZACIÓN DE TEMPOS Y UNIFICACIÓN DEL TRI-SET B PARA M1
DO $$
DECLARE
    v_m1_juan_a UUID := '42a0fd16-5d1e-4fa9-b1fb-8b05bbe98378';
    v_m1_juan_b UUID := '60b60b0e-664b-42c0-a56c-968e5f47b2ec';
    v_m1_wendy_a UUID := 'c08aac9c-99e5-4203-b130-118b2142f579';
    v_m1_wendy_b UUID := 'd4bf1a72-376d-4669-8d38-89bcc6eb32d1';

    -- IDs de ejercicios en public.exercises
    v_box_squat UUID := 'b722e036-ec24-4de0-8d9a-ceb263c8433b';
    v_bench UUID := 'd4aa5b02-6743-4d3d-9fc9-9e5c11fe0bf1';
    v_seated_mil UUID := '3b1a2a9d-447e-41f0-9533-a43683e606b5';
    v_barbell_row UUID := 'e1e31e4b-89a8-4ab0-857e-770c252e3403';
    v_landmine_row UUID := '3d5c7bcd-e48e-421a-805b-59bb8a33c040';
    v_curl UUID := '97c1ccad-5fe9-4623-b933-01817c667662';
    v_hyper UUID := '9afe7ec8-f19b-4bf1-a821-53648662a9d8';
    v_calf UUID := 'fb4fc90b-9d2a-4b61-b269-b3e67818fbe3';

    v_deadlift UUID := 'f5216b32-5241-425a-bdcd-1d7a83bb289f';
    v_military UUID := '1cfd9b80-77f4-4c71-a35b-609e84ca7806';
    v_hip_thrust UUID := '8c2ae95f-5710-444c-ac6e-ecc51847cf51';
    v_pull_ups UUID := '780b1287-66f3-4fd8-ac4f-17930b10cfa0';
    v_crunch UUID := 'ff981aee-6421-4c33-a815-64abda2dc0af';
    v_leg_ext UUID := '79d47112-771d-4a19-8721-0979b934fb37';
    v_dips UUID := 'bc54675e-dcee-4bf2-bc18-518e26a70b4a';
BEGIN
    -- =========================================================================
    -- A) JUAN M1 ENTRENO A
    -- =========================================================================
    UPDATE public.workout_exercises SET tempo = '3-1-X-1', technical_notes = '1" Pausa en Box · Controlar Butt Wink'
    WHERE workout_id = v_m1_juan_a AND order_index = 1;

    UPDATE public.workout_exercises SET tempo = '3-1-X-1', technical_notes = '1" Pausa al Pecho'
    WHERE workout_id = v_m1_juan_a AND order_index = 2;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Espalda Recta · Tracción con codos'
    WHERE workout_id = v_m1_juan_a AND order_index = 3;

    UPDATE public.workout_exercises SET tempo = '2-0-2-0', technical_notes = 'Tri-Set 1 · Sin balanceo'
    WHERE workout_id = v_m1_juan_a AND order_index = 4;

    UPDATE public.workout_exercises SET tempo = '2-1-2-1', technical_notes = 'Tri-Set 2 · Cadena posterior'
    WHERE workout_id = v_m1_juan_a AND order_index = 5;

    UPDATE public.workout_exercises SET tempo = '2-2-X-2', technical_notes = 'Tri-Set 3 · Rango completo'
    WHERE workout_id = v_m1_juan_a AND order_index = 6;

    -- =========================================================================
    -- B) WENDY M1 ENTRENO A
    -- =========================================================================
    UPDATE public.workout_exercises SET tempo = '3-1-X-1', technical_notes = '1" Pausa en Box · Controlar Butt Wink'
    WHERE workout_id = v_m1_wendy_a AND order_index = 1;

    UPDATE public.workout_exercises SET tempo = '3-1-X-1', technical_notes = 'Hasta las Clavículas'
    WHERE workout_id = v_m1_wendy_a AND order_index = 2;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Espalda Recta · Tracción con codos'
    WHERE workout_id = v_m1_wendy_a AND order_index = 3;

    UPDATE public.workout_exercises SET tempo = '2-0-2-0', technical_notes = 'Tri-Set 1 · Sin balanceo'
    WHERE workout_id = v_m1_wendy_a AND order_index = 4;

    UPDATE public.workout_exercises SET tempo = '2-1-2-1', technical_notes = 'Tri-Set 2 · Cadena posterior'
    WHERE workout_id = v_m1_wendy_a AND order_index = 5;

    UPDATE public.workout_exercises SET tempo = '2-2-X-2', technical_notes = 'Tri-Set 3 · Rango completo'
    WHERE workout_id = v_m1_wendy_a AND order_index = 6;

    -- =========================================================================
    -- C) JUAN M1 ENTRENO B (Unificar Tri-Set B: #4 Crunch, #5 Leg Ext, #6 Fondos)
    -- =========================================================================
    UPDATE public.workout_exercises SET tempo = 'X-1-X-0', technical_notes = 'Espalda Neutra · Sin rebote abajo'
    WHERE workout_id = v_m1_juan_b AND order_index = 1;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Hasta las Clavículas'
    WHERE workout_id = v_m1_juan_b AND order_index = 2;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Tocar el pecho · Codos hacia abajo'
    WHERE workout_id = v_m1_juan_b AND order_index = 3;

    UPDATE public.workout_exercises
    SET exercise_id = v_crunch, tempo = '2-0-2-0', technical_notes = 'Tri-Set 1 · Control'
    WHERE workout_id = v_m1_juan_b AND order_index = 4;

    UPDATE public.workout_exercises
    SET exercise_id = v_leg_ext, tempo = '2-1-2-1', technical_notes = 'Tri-Set 2 · Cuádriceps'
    WHERE workout_id = v_m1_juan_b AND order_index = 5;

    UPDATE public.workout_exercises
    SET exercise_id = v_dips, tempo = '2-0-2-0', technical_notes = 'Tri-Set 3 · Tríceps (o Press Agarre Estrecho)'
    WHERE workout_id = v_m1_juan_b AND order_index = 6;

    -- =========================================================================
    -- D) WENDY M1 ENTRENO B (Unificar Tri-Set B: #4 Crunch, #5 Leg Ext, #6 Fondos)
    -- =========================================================================
    UPDATE public.workout_exercises SET tempo = 'X-1-X-0', technical_notes = 'Espalda Neutra · Sin rebote abajo'
    WHERE workout_id = v_m1_wendy_b AND order_index = 1;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Pausa 1" arriba en pico'
    WHERE workout_id = v_m1_wendy_b AND order_index = 2;

    UPDATE public.workout_exercises SET tempo = '3-0-X-1', technical_notes = 'Tocar el pecho · Codos hacia abajo'
    WHERE workout_id = v_m1_wendy_b AND order_index = 3;

    UPDATE public.workout_exercises
    SET exercise_id = v_crunch, tempo = '2-0-2-0', technical_notes = 'Tri-Set 1 · Control'
    WHERE workout_id = v_m1_wendy_b AND order_index = 4;

    UPDATE public.workout_exercises
    SET exercise_id = v_leg_ext, tempo = '2-1-2-1', technical_notes = 'Tri-Set 2 · Cuádriceps'
    WHERE workout_id = v_m1_wendy_b AND order_index = 5;

    UPDATE public.workout_exercises
    SET exercise_id = v_dips, tempo = '2-0-2-0', technical_notes = 'Tri-Set 3 · Tríceps (o Press Agarre Estrecho)'
    WHERE workout_id = v_m1_wendy_b AND order_index = 6;
END $$;
