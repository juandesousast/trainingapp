-- ====================================================================
-- HOPLITA OS (TRINING APP) - SEED MESOCYCLES 2 A 5 (AMBOS PERFILES)
-- Migration: 20261028_03_seed_mesocycles_2_to_5.sql
-- ====================================================================

DO $$
DECLARE
    hoplita_id UUID := '11111111-1111-1111-1111-111111111111';
    girl_id UUID := '22222222-2222-2222-2222-222222222222';
    
    m2_hoplita UUID; m3_hoplita UUID; m4_hoplita UUID; m5_hoplita UUID;
    m2_girl UUID; m3_girl UUID; m4_girl UUID; m5_girl UUID;
    w_id UUID;
    
    e_box_squat UUID; e_squat UUID; e_bench UUID; e_inc_press UUID;
    e_military UUID; e_seated_mil UUID; e_deadlift UUID; e_barbell_row UUID;
    e_landmine_row UUID; e_pull_ups UUID; e_supine_pull UUID; e_biceps_curl UUID;
    e_dead_curl UUID; e_hyper UUID; e_calf UUID; e_press45 UUID;
    e_rev_crunch UUID; e_dips UUID; e_close_press UUID; e_french UUID;
    e_lat_raises UUID; e_db_press UUID; e_hip_thrust UUID; e_leg_curl UUID;
    e_leg_ext UUID; e_ghr UUID;
BEGIN
    SELECT id INTO m2_hoplita FROM public.mesocycles WHERE profile_id = hoplita_id AND number = 2;
    SELECT id INTO m3_hoplita FROM public.mesocycles WHERE profile_id = hoplita_id AND number = 3;
    SELECT id INTO m4_hoplita FROM public.mesocycles WHERE profile_id = hoplita_id AND number = 4;
    SELECT id INTO m5_hoplita FROM public.mesocycles WHERE profile_id = hoplita_id AND number = 5;

    SELECT id INTO m2_girl FROM public.mesocycles WHERE profile_id = girl_id AND number = 2;
    SELECT id INTO m3_girl FROM public.mesocycles WHERE profile_id = girl_id AND number = 3;
    SELECT id INTO m4_girl FROM public.mesocycles WHERE profile_id = girl_id AND number = 4;
    SELECT id INTO m5_girl FROM public.mesocycles WHERE profile_id = girl_id AND number = 5;

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
    -- MESOCICLO 2 HOPLITA (Split A + B + C)
    -- ================================================================
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m2_hoplita, 'A', 'Entreno A: Piernas, Hombros y Abdomen', 1) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_squat, 1, 'main_progression', 'Control Espalda Baja', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s (+1kg)", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_leg_curl, 2, 'main_progression', 'Lento y Controlado', 120, '{"m1": "3x10 p 2m", "m2": "3x8 p 2m", "m3": "2x6 p 3m"}'::jsonb),
        (w_id, e_military, 3, 'main_progression', 'Hasta las Clavículas', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_db_press, 4, 'main_progression', 'Recorrido Completo', 120, '{"m1": "3x10 p 2m", "m2": "3x8 p 2m", "m3": "2x6 p 3m"}'::jsonb),
        (w_id, e_calf, 5, 'jump_set', 'Gemelos (Jump Set)', 60, '{"m1": "3x20 p 1m", "m2": "4x20 p 45s", "m3": "2x20 p 30s"}'::jsonb),
        (w_id, e_rev_crunch, 6, 'jump_set', 'Crunch Inverso (Jump Set)', 60, '{"m1": "3x20 p 1m", "m2": "4x20 p 45s", "m3": "2x20 p 30s"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m2_hoplita, 'B', 'Entreno B: Pecho, Tríceps y Recall Piernas', 2) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_bench, 1, 'main_progression', '1" Pausa al Pecho', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_inc_press, 2, 'main_progression', 'Brazos en Plano Sagital', 120, '{"m1": "3x10 p 2m", "m2": "3x8 p 2m", "m3": "2x6 p 3m"}'::jsonb),
        (w_id, e_dips, 3, 'main_progression', 'Codos cerrados', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_box_squat, 4, 'main_progression', 'Controlar Butt Wink', 60, '{"m1": "6x2 @ 8RM p 2s (1m)", "m2": "6x2 @ 8RM p 2s (1m)", "m3": "1xMAX @ 8RM sin pausa"}'::jsonb),
        (w_id, e_hyper, 5, 'jump_set', 'Hiperextensión 45º (Jump Set)', 60, '{"m1": "3x12 p 1m", "m2": "4x12 p 45s", "m3": "2x12 p 30s"}'::jsonb),
        (w_id, e_calf, 6, 'jump_set', 'Gemelos en Prensa (Jump Set)', 60, '{"m1": "3x12 p 1m", "m2": "4x12 p 45s", "m3": "2x12 p 30s"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m2_hoplita, 'C', 'Entreno C: Espalda, Bíceps y Cuádriceps', 3) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_deadlift, 1, 'main_progression', 'No rebotar abajo - Concéntricas - Espalda Neutra', 120, '{"m1": "4x8/6/4/2 p 2m", "m2": "4x8/6/4/2 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_pull_ups, 2, 'main_progression', 'Tocar el Pecho', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_biceps_curl, 3, 'main_progression', 'Control Escápulas', 120, '{"m1": "3x8/6/4 p 2m", "m2": "3x8/6/4 p 2m30s", "m3_descarga": "8x3 @ 8RM p 1m"}'::jsonb),
        (w_id, e_rev_crunch, 4, 'tri_set', 'Tri-Set 1: Crunch Invertido', 45, '{"m1": "3x12 p 45s", "m2": "4x12 p 30s", "m3": "2x12 p 15s"}'::jsonb),
        (w_id, e_leg_ext, 5, 'tri_set', 'Tri-Set 2: Leg Extension', 45, '{"m1": "3x12 p 45s", "m2": "4x12 p 30s", "m3": "2x12 p 15s"}'::jsonb),
        (w_id, e_barbell_row, 6, 'tri_set', 'Tri-Set 3: Remo con Barra', 45, '{"m1": "3x12 p 45s", "m2": "4x12 p 30s", "m3": "2x12 p 15s"}'::jsonb);

    -- ================================================================
    -- MESOCICLO 3 HOPLITA (Split A + B - Tempo y % 1RM)
    -- ================================================================
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m3_hoplita, 'A', 'Entreno A: Peso Muerto y Militar al % 1RM', 1) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, tempo, rest_seconds, scheme_config) VALUES
        (w_id, e_deadlift, 1, 'main_progression', 'Prog. % 1RM: 75% a 85%', '3-1-X-1', 90, '{"exp1": "8x3 @ 75% (1m)", "exp2": "7x4 @ 75% (1m15)", "exp3": "6x5 @ 75% (1m30)", "exp4": "8x3 @ 80% (1m)", "exp5": "7x4 @ 80% (1m15)", "exp6": "6x5 @ 80% (1m30)", "exp7_descarga": "8x2 @ 85% (1m30)"}'::jsonb),
        (w_id, e_military, 2, 'main_progression', 'Prog. % 1RM: 75% a 85%', '3-1-X-1', 90, '{"exp1": "8x3 @ 75% (1m)", "exp2": "7x4 @ 75% (1m15)", "exp3": "6x5 @ 75% (1m30)", "exp4": "8x3 @ 80% (1m)", "exp5": "7x4 @ 80% (1m15)", "exp6": "6x5 @ 80% (1m30)", "exp7_descarga": "8x2 @ 85% (1m30)"}'::jsonb),
        (w_id, e_barbell_row, 3, 'jump_set', 'Remo Mancuerna / T (Jump Set 1)', '2-1-2-1', 45, '{"exp_1_3_5": "4x8 p 45s", "exp_2_4_6": "3x10 p 45s", "exp_7": "2x12 p 60s"}'::jsonb),
        (w_id, e_dips, 4, 'jump_set', 'Fondos Tríceps (Jump Set 1)', '2-1-2-1', 45, '{"exp_1_3_5": "4x8 p 45s", "exp_2_4_6": "3x10 p 45s", "exp_7": "2x12 p 60s"}'::jsonb),
        (w_id, e_calf, 5, 'tri_set', 'Gemelos (Tri-Set 2)', '2-2-X-2', 30, '{"reps": 20, "sets": "3x (1-6 exp), 1x (7 exp)"}'::jsonb),
        (w_id, e_press45, 6, 'tri_set', 'Prensa 45º (Tri-Set 2)', '3-0-X-0', 30, '{"reps": 10, "sets": "3x (1-6 exp), 1x (7 exp)"}'::jsonb),
        (w_id, e_biceps_curl, 7, 'tri_set', 'Curl con Barra (Tri-Set 2)', '3-0-X-1', 30, '{"reps": 8, "reps_exp7": 10, "sets": "3x (1-6 exp), 1x (7 exp)"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m3_hoplita, 'B', 'Entreno B: Sentadilla y Press Banca al % 1RM', 2) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, tempo, rest_seconds, scheme_config) VALUES
        (w_id, e_squat, 1, 'main_progression', 'Prog. % 1RM: 75% a 85%', '3-1-X-1', 90, '{"exp1": "8x3 @ 75% (1m)", "exp2": "7x4 @ 75% (1m15)", "exp3": "6x5 @ 75% (1m30)", "exp4": "8x3 @ 80% (1m)", "exp5": "7x4 @ 80% (1m15)", "exp6": "6x5 @ 80% (1m30)", "exp7_descarga": "8x2 @ 85% (1m30)"}'::jsonb),
        (w_id, e_bench, 2, 'main_progression', 'Prog. % 1RM: 75% a 85%', '3-1-X-1', 90, '{"exp1": "8x3 @ 75% (1m)", "exp2": "7x4 @ 75% (1m15)", "exp3": "6x5 @ 75% (1m30)", "exp4": "8x3 @ 80% (1m)", "exp5": "7x4 @ 80% (1m15)", "exp6": "6x5 @ 80% (1m30)", "exp7_descarga": "8x2 @ 85% (1m30)"}'::jsonb),
        (w_id, e_french, 3, 'jump_set', 'Press Francés (Jump Set 1)', '2-1-2-1', 45, '{"exp_1_3_5": "4x8 p 45s", "exp_2_4_6": "3x10 p 45s", "exp_7": "2x12 p 60s"}'::jsonb),
        (w_id, e_pull_ups, 4, 'jump_set', 'Dominadas (Jump Set 1)', '2-1-2-1', 45, '{"exp_1_3_5": "4x8 p 45s", "exp_2_4_6": "3x10 p 45s", "exp_7": "2x12 p 60s"}'::jsonb),
        (w_id, e_rev_crunch, 5, 'jump_set', 'Crunch Inverso (Jump Set 2)', '2-1-2-0', 45, '{"reps": 20, "sets": "3x (1-6 exp), 1x (7 exp)"}'::jsonb),
        (w_id, e_leg_curl, 6, 'jump_set', 'Glute Ham Raise / Leg Curl (Jump Set 2)', '3-1-X-0', 45, '{"reps": 10, "sets": "3x (1-6 exp), 1x (7 exp)"}'::jsonb);

    -- ================================================================
    -- MESOCICLO 4 HOPLITA (Fuerza 1 - 4x4)
    -- ================================================================
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m4_hoplita, 'A', 'Entreno A: Sentadilla, Banca, Remo (4x4)', 1) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_squat, 1, 'main_progression', 'Control Excéntrico - Subir Explosivo', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_bench, 2, 'main_progression', '1" Pausa - Subida Explosiva', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_barbell_row, 3, 'main_progression', 'Espalda neutra - Explosivo', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_rev_crunch, 4, 'tri_set', 'Tri-Set @ RPE 10: Crunch Inverso', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb),
        (w_id, e_hyper, 5, 'tri_set', 'Tri-Set @ RPE 10: Hiperextensión / Leg Curl', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb),
        (w_id, e_biceps_curl, 6, 'tri_set', 'Tri-Set @ RPE 10: Curl con Barra', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m4_hoplita, 'B', 'Entreno B: Peso Muerto, Militar, Dominadas (4x4)', 2) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_deadlift, 1, 'main_progression', 'Arrancadas - No rebote', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_seated_mil, 2, 'main_progression', 'Arrancadas - No rebote', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_supine_pull, 3, 'main_progression', 'Explosivo Hasta Pecho', 180, '{"exp1": "4x4 @ 80% RPE 7-8", "exp2": "4x4 @ 82.5% RPE 8-9", "exp3": "4x4 @ 85% RPE 9-10", "exp4": "4x4 @ 87.5% RPE 10", "exp5_descarga": "8x3 @ 75% p 1m"}'::jsonb),
        (w_id, e_press45, 4, 'tri_set', 'Tri-Set @ RPE 10: Prensa 45º / Leg Ext', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb),
        (w_id, e_calf, 5, 'tri_set', 'Tri-Set @ RPE 10: Gemelos', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb),
        (w_id, e_dips, 6, 'tri_set', 'Tri-Set @ RPE 10: Fondos Tríceps', 30, '{"exp_1_3": "3x12", "exp_4": "2x12", "exp_5": "1x12"}'::jsonb);

    -- ================================================================
    -- MESOCICLO 5 HOPLITA (Fuerza 2 - Cluster Sets)
    -- ================================================================
    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m5_hoplita, 'A', 'Entreno A: Cluster Sentadilla & Banca', 1) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_squat, 1, 'cluster_set', 'Cluster: 1 rep cada 15"/20"/25" hasta 8 reps totales', 240, '{"m1": "2-3x8 @ 87.5% (Rest Pause 15s)", "m2": "3x8 @ 90% (Rest Pause 20s)", "m3": "2x8 @ 92.5% (Rest Pause 25s)", "m4_descarga": "10x1 @ 95% Normal (p 2m)"}'::jsonb),
        (w_id, e_bench, 2, 'cluster_set', 'Cluster: 1 rep cada 15"/20"/25" hasta 8 reps totales', 240, '{"m1": "2-3x8 @ 87.5% (Rest Pause 15s)", "m2": "3x8 @ 90% (Rest Pause 20s)", "m3": "2x8 @ 92.5% (Rest Pause 25s)", "m4_descarga": "10x1 @ 95% Normal (p 2m)"}'::jsonb),
        (w_id, e_biceps_curl, 3, 'jump_set', 'Curl con Barra (Jump Set)', 30, '{"m1": "5x8 RPE 8", "m2": "5x8 RPE 9", "m3": "4x8 RPE 10", "m4": "2xMAX al fallo"}'::jsonb),
        (w_id, e_leg_ext, 4, 'jump_set', 'Leg Extension / Prensa (Jump Set)', 30, '{"m1": "5x8 RPE 8", "m2": "5x8 RPE 9", "m3": "4x8 RPE 10", "m4": "2xMAX al fallo"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m5_hoplita, 'B', 'Entreno B: Cluster Peso Muerto & Dominadas', 2) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_deadlift, 1, 'cluster_set', 'Cluster: 1 rep cada 15"/20"/25" hasta 8 reps totales', 240, '{"m1": "2-3x8 @ 87.5% (Rest Pause 15s)", "m2": "3x8 @ 90% (Rest Pause 20s)", "m3": "2x8 @ 92.5% (Rest Pause 25s)", "m4_descarga": "10x1 @ 95% Normal (p 2m)"}'::jsonb),
        (w_id, e_supine_pull, 2, 'cluster_set', 'Cluster: 1 rep cada 15"/20"/25" hasta 8 reps totales', 240, '{"m1": "2-3x8 @ 87.5% (Rest Pause 15s)", "m2": "3x8 @ 90% (Rest Pause 20s)", "m3": "2x8 @ 92.5% (Rest Pause 25s)", "m4_descarga": "10x1 @ 95% Normal (p 2m)"}'::jsonb),
        (w_id, e_leg_curl, 3, 'jump_set', 'Leg Curl (Jump Set)', 30, '{"m1": "5x8", "m2": "5x8", "m3": "4x8", "m4": "2xMAX"}'::jsonb),
        (w_id, e_rev_crunch, 4, 'jump_set', 'Crunch Invertido (Jump Set)', 30, '{"m1": "5x8", "m2": "5x8", "m3": "4x8", "m4": "2xMAX"}'::jsonb);

    INSERT INTO public.workouts (mesocycle_id, letter, name, order_index)
    VALUES (m5_hoplita, 'C', 'Entreno C: Cluster Militar & Tríceps + Test Maximales', 3) RETURNING id INTO w_id;
    INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, block_type, technical_notes, rest_seconds, scheme_config) VALUES
        (w_id, e_seated_mil, 1, 'cluster_set', 'Cluster Militar Sentado', 240, '{"m1": "2-3x8 @ 87.5% (Rest Pause 15s)", "m2": "3x8 @ 90% (Rest Pause 20s)", "m3": "2x8 @ 92.5% (Rest Pause 25s)", "m4_descarga": "10x1 @ 95% Normal"}'::jsonb),
        (w_id, e_close_press, 2, 'cluster_set', 'Cluster Press Estrecho', 240, '{"m1": "2-3x8 @ 85%", "m2": "3x8 @ 87.5%", "m3": "2x8 @ 90%", "m4": "10x1 @ 92.5%"}'::jsonb),
        (w_id, e_calf, 3, 'jump_set', 'Gemelos en Prensa 12RM (Jump Set)', 30, '{"m1_2": "5 series", "m3": "4 series", "m4": "2 series"}'::jsonb),
        (w_id, e_box_squat, 4, 'jump_set', 'Box Squat 2" pausa (Jump Set)', 30, '{"m1_2": "4 reps @ 70%", "m4": "5 reps @ 70%"}'::jsonb);

END $$;
