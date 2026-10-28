-- ====================================================================
-- HOPLITA OS (TRINING APP) - SEED DATA MIGRATION
-- Migration: 20261028_02_seed_data.sql
-- ====================================================================

-- 1. INSERTAR PERFILES (HOPLITA Y HOPLITA GIRL)
INSERT INTO public.profiles (id, slug, display_name, gender, theme_accent, target_body_fat_pct, target_calories_daily, target_protein_daily_g)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'hoplita', 'Hoplita', 'male', '#CCFF00', 16.0, 2000, 175),
    ('22222222-2222-2222-2222-222222222222', 'hoplita_girl', 'Hoplita Girl', 'female', '#F43F5E', 20.0, 1700, 130)
ON CONFLICT (slug) DO UPDATE SET
    theme_accent = EXCLUDED.theme_accent,
    target_body_fat_pct = EXCLUDED.target_body_fat_pct;

-- 2. INSERTAR LÍNEA BASE BIOMÉTRICA EN AYUNAS (HOPLITA)
INSERT INTO public.biometric_logs (
    profile_id, measured_at, is_fasting, weight_kg, bmi, body_fat_pct, body_fat_kg,
    subcutaneous_fat_pct, visceral_fat_rating, fat_free_mass_kg, muscle_mass_kg,
    bone_mass_kg, skeletal_muscle_pct, body_water_pct, protein_pct, bmr_kcal, metabolic_age, notes
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    true,
    82.15,
    25.4,
    25.6,
    21.03,
    22.8,
    8.0,
    61.12,
    58.08,
    3.04,
    47.9,
    53.7,
    17.0,
    1683,
    37,
    'Línea base inicial en ayunas. Objetivo de recomposición corporal hacia 16% de grasa.'
);

-- 3. INSERTAR TABLA M&R (Mayhew & Robbins / Brzycki)
INSERT INTO public.mr_coefficients (reps, percentage, coeff_mayhew, coeff_brzycki, coeff_epley)
VALUES 
    (1,  1.0000, 1.0000, 1.0000, 1.0000),
    (2,  0.9500, 0.9550, 0.9670, 0.9670),
    (3,  0.9250, 0.9220, 0.9330, 0.9330),
    (4,  0.9000, 0.8920, 0.9000, 0.9000),
    (5,  0.8750, 0.8630, 0.8670, 0.8670),
    (6,  0.8500, 0.8360, 0.8330, 0.8330),
    (7,  0.8250, 0.8110, 0.8000, 0.8000),
    (8,  0.8000, 0.7860, 0.7670, 0.7670),
    (9,  0.7750, 0.7630, 0.7330, 0.7330),
    (10, 0.7500, 0.7400, 0.7000, 0.7000),
    (11, 0.7250, 0.7180, 0.6670, 0.6670),
    (12, 0.7000, 0.6970, 0.6330, 0.6330),
    (13, 0.6750, 0.6770, 0.6000, 0.6000),
    (14, 0.6500, 0.6580, 0.5670, 0.5670),
    (15, 0.6250, 0.6400, 0.5330, 0.5330)
ON CONFLICT (reps) DO UPDATE SET percentage = EXCLUDED.percentage;

-- 4. INSERTAR EJERCICIOS MAESTROS
INSERT INTO public.exercises (slug, name, muscle_group, equipment, default_tempo, notes)
VALUES
    ('box_squat', 'Box Squat', 'Piernas / Glúteos', 'Barra y Cajón', '3-1-X-1', '1" Pausa en Box, controlar Butt Wink'),
    ('squat', 'Sentadilla Trasera (Squat)', 'Piernas / Cuádriceps', 'Barra olímpica', '3-0-X-1', 'Control espalda baja, profundidad completa'),
    ('bench_press', 'Press de Banca Plano', 'Pectoral / Tríceps', 'Barra olímpica', '3-1-X-1', '1" Pausa al Pecho, retracción escapular'),
    ('incline_press_45', 'Press Inclinado 45º', 'Pectoral Superior', 'Mancuernas / Barra', '3-0-X-0', 'Brazos en plano sagital'),
    ('military_press', 'Press Militar', 'Hombros / Tríceps', 'Barra olímpica', '3-0-X-1', 'Hasta las clavículas, core bloqueado'),
    ('seated_military_press', 'Press Militar Sentado', 'Hombros', 'Barra / Multipower', '3-0-X-1', 'Arrancadas sin rebote'),
    ('deadlift', 'Peso Muerto Convencional', 'Cadena Posterior', 'Barra olímpica', 'X-1-X-0', 'Espalda neutra, no rebotar abajo, concéntricas puras'),
    ('barbell_row', 'Remo con Barra / Seal Row', 'Dorsal / Espalda', 'Barra / Banco', '3-1-X-1', 'Espalda neutra, tirar con los codos'),
    ('landmine_row', 'Remo Landmine', 'Espalda', 'Barra Landmine', '3-1-X-1', 'Espalda recta, recorrido completo'),
    ('pull_ups', 'Dominadas (o Jalón al Pecho)', 'Espalda / Bíceps', 'Barra dominadas', '3-0-X-1', 'Tocando el pecho, extensión completa'),
    ('supine_pull_ups', 'Dominadas Supinas (Chin-ups)', 'Espalda / Bíceps', 'Barra dominadas', '3-0-X-1', 'Explosivo hasta el pecho'),
    ('biceps_curl', 'Curl con Barra', 'Bíceps', 'Barra Z / Olímpica', '3-0-X-1', 'Control de escápulas, codos estables'),
    ('dead_curl', 'Dead Curl', 'Bíceps', 'Barra en soporte', 'X-1-X-0', 'Arrancada desde parada sin inercia'),
    ('hyperextension_45', 'Hiperextensiones 45º', 'Lumbares / Glúteos', 'Banco 45º', '2-1-2-1', 'Alineación de columna'),
    ('calf_machine', 'Gemelos en Máquina o Prensa', 'Gemelos / Sóleo', 'Máquina', '2-2-X-2', 'Máximo estiramiento abajo y pausa arriba'),
    ('leg_press_45', 'Prensa 45º', 'Piernas', 'Prensa 45º', '3-0-X-0', 'No bloquear rodillas al extender'),
    ('reverse_crunch', 'Crunch Inverso', 'Abdomen', 'Esterilla / Banco', '2-1-2-0', 'Elevar pelvis contrayendo el core'),
    ('dips_triceps', 'Fondos de Tríceps (o en Paralelas)', 'Tríceps / Pectoral', 'Paralelas / Banco', '3-0-X-1', 'Codos cerrados, recorrido controlado'),
    ('close_grip_press', 'Press de Banca Agarre Estrecho', 'Tríceps / Pectoral', 'Barra olímpica', '3-0-X-1', 'Codos cerrados'),
    ('french_press', 'Press Francés', 'Tríceps', 'Barra Z', '3-0-X-0', 'Mantener codos verticales fijos'),
    ('lateral_raises', 'Elevaciones Laterales', 'Hombro Lateral', 'Mancuernas / Polea', '2-1-2-0', 'Brazos en plano escapular'),
    ('dumbbell_press', 'Press con Mancuernas', 'Hombro / Pecho', 'Mancuernas', '3-1-X-0', 'Recorrido completo, pausa abajo'),
    ('hip_thrust', 'Hip Thrust', 'Glúteos / Femorales', 'Barra con pad', '2-1-X-1', 'Pausa 1" arriba en máxima contracción'),
    ('leg_curl', 'Leg Curl (Femoral Tumbado o Sentado)', 'Isquiosurales', 'Máquina', '3-1-X-0', 'Lento y controlado'),
    ('leg_extension', 'Leg Extension', 'Cuádriceps', 'Máquina', '3-1-X-1', 'Extensión completa con pico de contracción'),
    ('glute_ham_raise', 'Glute Ham Raise', 'Isquiosurales / Glúteos', 'Banco GHR', '3-1-X-0', 'Fase excéntrica controlada')
ON CONFLICT (slug) DO NOTHING;

-- 5. CREACIÓN DE MESOCICLOS Y ENTRENOS CON LÓGICA HOPLITA
DO $$
DECLARE
    hoplita_id UUID := '11111111-1111-1111-1111-111111111111';
    girl_id UUID := '22222222-2222-2222-2222-222222222222';
    
    m1_hoplita UUID;
    m2_hoplita UUID;
    m3_hoplita UUID;
    m4_hoplita UUID;
    m5_hoplita UUID;
    
    m1_girl UUID;
    m2_girl UUID;
    m3_girl UUID;
    m4_girl UUID;
    m5_girl UUID;
    
    w_id UUID;
    
    -- IDs de ejercicios
    e_box_squat UUID;
    e_squat UUID;
    e_bench UUID;
    e_inc_press UUID;
    e_military UUID;
    e_seated_mil UUID;
    e_deadlift UUID;
    e_barbell_row UUID;
    e_landmine_row UUID;
    e_pull_ups UUID;
    e_supine_pull UUID;
    e_biceps_curl UUID;
    e_dead_curl UUID;
    e_hyper UUID;
    e_calf UUID;
    e_press45 UUID;
    e_rev_crunch UUID;
    e_dips UUID;
    e_close_press UUID;
    e_french UUID;
    e_lat_raises UUID;
    e_db_press UUID;
    e_hip_thrust UUID;
    e_leg_curl UUID;
    e_leg_ext UUID;
    e_ghr UUID;
BEGIN
    -- Seleccionar ejercicios
    SELECT id INTO e_box_squat FROM public.exercises WHERE slug = 'box_squat';
    SELECT id INTO e_squat FROM public.exercises WHERE slug = 'squat';
    SELECT id INTO e_bench FROM public.exercises WHERE slug = 'bench_press';
    SELECT id INTO e_inc_press FROM public.exercises WHERE slug = 'incline_press_45';
    SELECT id INTO e_military FROM public.exercises WHERE slug = 'military_press';
    SELECT id INTO e_seated_mil FROM public.exercises WHERE slug = 'seated_military_press';
    SELECT id INTO e_deadlift FROM public.exercises WHERE slug = 'deadlift';
    SELECT id INTO e_barbell_row FROM public.exercises WHERE slug = 'barbell_row';
    SELECT id INTO e_landmine_row FROM public.exercises WHERE slug = 'landmine_row';
    SELECT id INTO e_pull_ups FROM public.exercises WHERE slug = 'pull_ups';
    SELECT id INTO e_supine_pull FROM public.exercises WHERE slug = 'supine_pull_ups';
    SELECT id INTO e_biceps_curl FROM public.exercises WHERE slug = 'biceps_curl';
    SELECT id INTO e_dead_curl FROM public.exercises WHERE slug = 'dead_curl';
    SELECT id INTO e_hyper FROM public.exercises WHERE slug = 'hyperextension_45';
    SELECT id INTO e_calf FROM public.exercises WHERE slug = 'calf_machine';
    SELECT id INTO e_press45 FROM public.exercises WHERE slug = 'leg_press_45';
    SELECT id INTO e_rev_crunch FROM public.exercises WHERE slug = 'reverse_crunch';
    SELECT id INTO e_dips FROM public.exercises WHERE slug = 'dips_triceps';
    SELECT id INTO e_close_press FROM public.exercises WHERE slug = 'close_grip_press';
    SELECT id INTO e_french FROM public.exercises WHERE slug = 'french_press';
    SELECT id INTO e_lat_raises FROM public.exercises WHERE slug = 'lateral_raises';
    SELECT id INTO e_db_press FROM public.exercises WHERE slug = 'dumbbell_press';
    SELECT id INTO e_hip_thrust FROM public.exercises WHERE slug = 'hip_thrust';
    SELECT id INTO e_leg_curl FROM public.exercises WHERE slug = 'leg_curl';
    SELECT id INTO e_leg_ext FROM public.exercises WHERE slug = 'leg_extension';
    SELECT id INTO e_ghr FROM public.exercises WHERE slug = 'glute_ham_raise';

    -- ================================================================
    -- MESOCICLOS HOPLITA (ÉL)
    -- ================================================================
    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (hoplita_id, 1, 'Reacondicionamiento', 'M1', 'Split A + B', 'Adaptación anatómica, pirámide inversa', 12, 1)
    RETURNING id INTO m1_hoplita;
    
    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (hoplita_id, 2, 'Preparación Fuerza', 'M2', 'Split A + B + C', 'Sobrecarga progresiva, 3 microciclos con descarga', 9, 2)
    RETURNING id INTO m2_hoplita;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (hoplita_id, 3, 'Especialización Técnica', 'M3', 'Split A + B', 'Tempo estricto, % de 1RM (75% a 85%)', 14, 3)
    RETURNING id INTO m3_hoplita;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (hoplita_id, 4, 'Fuerza 1', 'M4', 'Split A + B', 'Cargas altas 80-87.5% 4x4 y descarga 8x3 @ 75%', 10, 4)
    RETURNING id INTO m4_hoplita;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (hoplita_id, 5, 'Fuerza 2 + Maximales', 'M5', 'Split A + B + C', 'Cluster Sets (1 rep cada 15"/20"/25") y test 1RM', 12, 5)
    RETURNING id INTO m5_hoplita;

    -- Entrenos Mesociclo 1 Hoplita (Split A + B)
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m1_hoplita, 'A', 'Entreno A: Box Squat, Banca, Remo y Tri-Set', 1) RETURNING id INTO w_id;
    
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config)
    VALUES 
        (w_id, e_box_squat, 1, 'main_progression', '1" Pausa en Box', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_bench, 2, 'main_progression', '1" Pausa al Pecho', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_barbell_row, 3, 'main_progression', 'Espalda Recta', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_biceps_curl, 4, 'tri_set', 'Tri-Set Alterno 1', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_hyper, 5, 'tri_set', 'Tri-Set Alterno 2', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_calf, 6, 'tri_set', 'Tri-Set Alterno 3', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m1_hoplita, 'B', 'Entreno B: Peso Muerto, Militar, Dominadas y Tri-Set', 2) RETURNING id INTO w_id;

    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config)
    VALUES 
        (w_id, e_deadlift, 1, 'main_progression', 'Espalda Neutra, sin rebote', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_military, 2, 'main_progression', 'Hasta las Clavículas', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_pull_ups, 3, 'main_progression', 'Tocando el Pecho', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_press45, 4, 'tri_set', 'Tri-Set Alterno 1', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_rev_crunch, 5, 'tri_set', 'Tri-Set Alterno 2', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_dips, 6, 'tri_set', 'Tri-Set Alterno 3', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb);

    -- ================================================================
    -- MESOCICLOS HOPLITA GIRL (ELLA)
    -- ================================================================
    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (girl_id, 1, 'Reacondicionamiento', 'M1', 'Split A + B', 'Adaptación anatómica, glúteo y fuerza base', 12, 1)
    RETURNING id INTO m1_girl;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (girl_id, 2, 'Preparación Fuerza', 'M2', 'Split A + B + C', 'Sobrecarga progresiva, énfasis cadera y tren inferior', 9, 2)
    RETURNING id INTO m2_girl;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (girl_id, 3, 'Especialización Técnica', 'M3', 'Split A + B', 'Tempo controlado, % de 1RM (75% a 85%)', 14, 3)
    RETURNING id INTO m3_girl;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (girl_id, 4, 'Fuerza 1', 'M4', 'Split A + B', 'Fuerza submáxima y Tri-Set final', 10, 4)
    RETURNING id INTO m4_girl;

    INSERT INTO public.mesocycles (profile_id, number, name, code, split_structure, target_goal, total_exposures, order_index)
    VALUES (girl_id, 5, 'Fuerza 2 + Maximales', 'M5', 'Split A + B + C', 'Cluster Sets y maximales Hip Thrust/Squat', 12, 5)
    RETURNING id INTO m5_girl;

    -- Entrenos Mesociclo 1 Hoplita Girl
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m1_girl, 'A', 'Entreno A: Box Squat, Militar Sentada, Remo Landmine y Tri-Set', 1) RETURNING id INTO w_id;

    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config)
    VALUES 
        (w_id, e_box_squat, 1, 'main_progression', '1" Pausa en Box', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_seated_mil, 2, 'main_progression', 'Hasta las Clavículas', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_landmine_row, 3, 'main_progression', 'Espalda Recta', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_biceps_curl, 4, 'tri_set', 'Tri-Set Alterno 1', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_hyper, 5, 'tri_set', 'Tri-Set Alterno 2', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_calf, 6, 'tri_set', 'Tri-Set Alterno 3', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m1_girl, 'B', 'Entreno B: Peso Muerto, Hip Thrust, Dominadas y Tri-Set', 2) RETURNING id INTO w_id;

    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config)
    VALUES 
        (w_id, e_deadlift, 1, 'main_progression', 'Espalda Neutra', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_hip_thrust, 2, 'main_progression', 'Pausa 1" arriba en pico', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_pull_ups, 3, 'main_progression', 'Tocando el Pecho', 90, '{"exp_1_2": "3x15/12/10 p 1m30s", "exp_3_4": "3x12/10/8 p 1m45s", "exp_5_6": "3x10/8/6 p 2m00s"}'::jsonb),
        (w_id, e_press45, 4, 'tri_set', 'Tri-Set Alterno 1', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_rev_crunch, 5, 'tri_set', 'Tri-Set Alterno 2', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb),
        (w_id, e_close_press, 6, 'tri_set', 'Tri-Set Alterno 3 (Press Estrecho)', 30, '{"sets_exp_1": "2x12", "sets_exp_2_6": "3x12"}'::jsonb);

END $$;
