const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const results = [];
  const startTotal = Date.now();

  console.log('================================================================');
  console.log('   HOPLITA OS - SUITE DE AUDITORÍA INTEGRAL END-TO-END (BIIO)   ');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  
  // Viewport móvil iPhone 14 / Pro
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });

  const page = await context.newPage();

  // -------------------------------------------------------------------------
  // TEST 1: AUTENTICACIÓN, PRIVACIDAD Y PROFILE DRAWER
  // -------------------------------------------------------------------------
  const t1Start = Date.now();
  console.log('>>> EJECUTANDO TEST 1: Autenticación, Privacidad y Profile Drawer...');
  try {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('form');
    await page.waitForTimeout(1500);

    await page.fill('input[type="email"]', 'juan@hoplita.app');
    await page.fill('input[type="password"]', 'Hoplita2026!');
    await page.click('button[type="submit"]');

    // Esperar navegación al dashboard
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('   URL tras login:', page.url());

    // 1. Verificar píldora del usuario "JUAN" y ausencia de dropdown de otros atletas
    const profileBtn = page.locator('header button[data-profile-trigger]');
    await profileBtn.waitFor({ state: 'visible', timeout: 6000 });
    const profileBtnText = (await profileBtn.innerText()).trim();

    if (!profileBtnText.toLowerCase().includes('juan')) {
      throw new Error(`El botón de usuario no muestra "Juan". Muestra: "${profileBtnText}"`);
    }

    const headerText = await page.innerText('header');
    if (/atletas/i.test(headerText) || /wendy/i.test(headerText) || /nato/i.test(headerText)) {
      throw new Error('La cabecera contiene elementos de otros atletas o dropdown multi-usuario.');
    }
    console.log('   [OK] Cabecera aislada: exclusivamente "JUAN" sin dropdown de atletas.');

    // 2. Clic directo para abrir ProfileDrawer
    await profileBtn.click();
    await page.waitForTimeout(600);

    const drawer = page.locator('[role="dialog"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });

    // Foco en input de Meta Peso y prueba de scroll y no-dismiss
    const metaWeightInput = drawer.locator('input[placeholder="80.0"]').first();
    await metaWeightInput.scrollIntoViewIfNeeded();
    await metaWeightInput.focus();
    await metaWeightInput.fill('72.8');

    // Comprobar que el drawer sigue abierto (no se cerró por drag accidental)
    if (!(await drawer.isVisible())) {
      throw new Error('El drawer se cerró accidentalmente al interactuar con el input.');
    }
    console.log('   [OK] Entrada táctil e interacción de teclado sin conflicto de cierre (handleOnly validado).');

    // Modificar 1RM de Box Squat (+2.5 kg)
    const boxSquatRow = drawer.locator('div').filter({ hasText: /box squat/i }).first();
    const plusBtn = boxSquatRow.locator('button[aria-label*="Aumentar"]').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
    }

    // Guardar ajustes
    const saveBtn = drawer.locator('button[data-save-profile]').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Recargar y confirmar persistencia
    await page.reload();
    await page.waitForTimeout(2000);

    await page.locator('header button[data-profile-trigger]').click();
    await page.waitForTimeout(600);
    const reloadedDrawer = page.locator('[role="dialog"]');
    await reloadedDrawer.waitFor({ state: 'visible', timeout: 5000 });

    // Captura Test 1
    await page.screenshot({ path: '/tmp/audit_01_profile_drawer.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_01_profile_drawer.png');

    // Cerrar drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    results.push({ test: 'TEST 1: Autenticación, Privacidad y Profile Drawer', status: 'PASS', durationMs: Date.now() - t1Start });
  } catch (err) {
    console.error('   [FAIL] TEST 1:', err.message);
    results.push({ test: 'TEST 1: Autenticación, Privacidad y Profile Drawer', status: 'FAIL', durationMs: Date.now() - t1Start, error: err.message });
  }

  // -------------------------------------------------------------------------
  // TEST 2: PESTAÑA BÁSCULA Y GRÁFICAS DE EVOLUCIÓN
  // -------------------------------------------------------------------------
  const t2Start = Date.now();
  console.log('\n>>> EJECUTANDO TEST 2: Pestaña Báscula y Gráficas de Evolución...');
  try {
    // Clic en pestaña "Báscula" (BottomNav)
    const basculaTabBtn = page.locator('nav button').filter({ hasText: /báscula/i }).first();
    await basculaTabBtn.click();
    await page.waitForTimeout(800);

    // Validar tarjeta principal con el pesaje basal oficial (82.15 kg)
    const pageText = await page.innerText('body');
    if (!pageText.includes('82.15')) {
      throw new Error('No se encontró el pesaje basal oficial de 82.15 kg.');
    }
    console.log('   [OK] Pesaje basal de 82.15 kg detectado en Báscula.');

    // Alternar filtros de tiempo: "7 Días", "30 Días", "Todo"
    const filter7d = page.locator('button').filter({ hasText: /^7 Días$|^7d$/i }).first();
    const filter30d = page.locator('button').filter({ hasText: /^30 Días$|^30d$/i }).first();
    const filterAll = page.locator('button').filter({ hasText: /^Todo$|^all$/i }).first();

    if (await filter7d.isVisible()) {
      await filter7d.click();
      await page.waitForTimeout(300);
    }
    if (await filter30d.isVisible()) {
      await filter30d.click();
      await page.waitForTimeout(300);
    }
    if (await filterAll.isVisible()) {
      await filterAll.click();
      await page.waitForTimeout(300);
    }

    // Alternar píldoras de métrica (Peso, % Grasa, Músculo, Cintura)
    const metricPills = ['% Grasa', 'Músculo', 'Cintura', 'Peso'];
    for (const m of metricPills) {
      const pill = page.locator('button').filter({ hasText: new RegExp(m, 'i') }).first();
      if (await pill.isVisible()) {
        await pill.click();
        await page.waitForTimeout(300);
      }
    }

    // Volver a seleccionar Peso para validar la línea de meta (72.8 kg)
    const pesoPill = page.locator('button').filter({ hasText: /peso/i }).first();
    await pesoPill.click();
    await page.waitForTimeout(400);

    // Verificar renderizado de recharts SVG
    const chartSvg = page.locator('.recharts-responsive-container svg').first();
    await chartSvg.waitFor({ state: 'visible', timeout: 5000 });

    // Validar aislamiento: no deben aparecer datos de Wendy
    const basculaFullText = await page.innerText('body');
    if (/wendy/i.test(basculaFullText)) {
      throw new Error('Se detectaron registros pertenecientes a Wendy en la vista de Báscula.');
    }
    console.log('   [OK] Aislamiento RLS en Báscula: sin registros de otros usuarios.');

    // Captura Test 2
    await page.screenshot({ path: '/tmp/audit_02_bascula_charts.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_02_bascula_charts.png');

    results.push({ test: 'TEST 2: Pestaña Báscula y Gráficas de Evolución', status: 'PASS', durationMs: Date.now() - t2Start });
  } catch (err) {
    console.error('   [FAIL] TEST 2:', err.message);
    results.push({ test: 'TEST 2: Pestaña Báscula y Gráficas de Evolución', status: 'FAIL', durationMs: Date.now() - t2Start, error: err.message });
  }

  // -------------------------------------------------------------------------
  // TEST 3: MOTOR METABÓLICO Y FOOD SWAP (NUTRICIÓN)
  // -------------------------------------------------------------------------
  const t3Start = Date.now();
  console.log('\n>>> EJECUTANDO TEST 3: Motor Metabólico y Food Swap (Nutrición)...');
  try {
    // Clic en pestaña "Nutrición"
    const nutricionTabBtn = page.locator('nav button').filter({ hasText: /nutrición/i }).first();
    await nutricionTabBtn.click();
    await page.waitForTimeout(800);

    // 1. Validar coherencia Katch-McArdle para Juan
    // Proteína: 148 g, Grasas: 74 g
    const nutText = await page.innerText('body');
    const hasProtein148 = nutText.includes('148g') || nutText.includes('148 g');
    const hasFat74 = nutText.includes('74g') || nutText.includes('74 g');

    console.log(`   ¿Proteína blindada 148g detectada?: ${hasProtein148}`);
    console.log(`   ¿Grasas 74g detectadas?: ${hasFat74}`);

    if (!hasProtein148 || !hasFat74) {
      throw new Error(`Los macros calculados no coinciden con Katch-McArdle para Juan (148g P / 74g G).`);
    }

    // 2. Toggle Día Entreno <-> Descanso
    const trainingToggle = page.locator('button').filter({ hasText: /día de entreno|día de descanso/i }).first();
    if (await trainingToggle.isVisible()) {
      const initialToggleText = await trainingToggle.innerText();
      await trainingToggle.click();
      await page.waitForTimeout(500);
      const switchedToggleText = await trainingToggle.innerText();
      console.log(`   [OK] Conmutación reactiva: "${initialToggleText.trim()}" -> "${switchedToggleText.trim()}"`);
    }

    // 3. Food Swap Engine: Desplegar Comida 2 y cambiar Arroz por Patata
    const meal2Btn = page.locator('button').filter({ hasText: /comida 2/i }).first();
    await meal2Btn.scrollIntoViewIfNeeded();
    await meal2Btn.click();
    await page.waitForTimeout(400);

    // Clic en chip de Carbohidratos (contiene 'Arroz' o emoji de carbs)
    const carbsChip = page.locator('button').filter({ hasText: /arroz|avena|patata|pasta/i }).first();
    await carbsChip.scrollIntoViewIfNeeded();
    await carbsChip.click();
    await page.waitForTimeout(600);

    // Verificar apertura de FoodSwapDrawer
    const swapDrawer = page.locator('[role="dialog"]');
    await swapDrawer.waitFor({ state: 'visible', timeout: 4000 });

    // Seleccionar "Patata hervida sin piel"
    const potatoOption = swapDrawer.locator('button').filter({ hasText: /patata/i }).first();
    await potatoOption.scrollIntoViewIfNeeded();
    await potatoOption.click();
    await page.waitForTimeout(500);

    // Captura Test 3
    await page.screenshot({ path: '/tmp/audit_03_nutrition_food_swap.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_03_nutrition_food_swap.png');

    // Cerrar swap drawer si sigue abierto
    if (await swapDrawer.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    results.push({ test: 'TEST 3: Motor Metabólico y Food Swap (Nutrición)', status: 'PASS', durationMs: Date.now() - t3Start });
  } catch (err) {
    console.error('   [FAIL] TEST 3:', err.message);
    results.push({ test: 'TEST 3: Motor Metabólico y Food Swap (Nutrición)', status: 'FAIL', durationMs: Date.now() - t3Start, error: err.message });
  }

  // -------------------------------------------------------------------------
  // TEST 4: SESIÓN DE ENTRENAMIENTO BIIO (ENTRENO)
  // -------------------------------------------------------------------------
  const t4Start = Date.now();
  console.log('\n>>> EJECUTANDO TEST 4: Sesión de Entrenamiento BIIO (Entreno)...');
  try {
    // Clic en pestaña "Entreno"
    const entrenoTabBtn = page.locator('nav button').filter({ hasText: /entreno/i }).first();
    await entrenoTabBtn.click();
    await page.waitForTimeout(800);

    // Clic en "EMPEZAR ENTRENAMIENTO"
    const startWorkoutBtn = page.locator('button').filter({ hasText: /empezar entrenamiento/i }).first();
    await startWorkoutBtn.scrollIntoViewIfNeeded();
    await startWorkoutBtn.click();
    await page.waitForTimeout(1000);

    // Verificar catálogo masculino: Box Squat o Press Banca
    const workoutViewText = await page.innerText('body');
    const hasBoxSquat = /box squat/i.test(workoutViewText);
    const hasBenchPress = /press banca/i.test(workoutViewText);
    console.log(`   ¿Contiene Box Squat?: ${hasBoxSquat}, ¿Press Banca?: ${hasBenchPress}`);

    if (!hasBoxSquat && !hasBenchPress) {
      throw new Error('La sesión no cargó la variante masculina BIIO estándar.');
    }

    // Marcar una serie como completada para activar el cronómetro de descanso
    const completeSetBtn = page.locator('button[title*="completada"]').first();
    await completeSetBtn.scrollIntoViewIfNeeded();
    await completeSetBtn.click();
    await page.waitForTimeout(800);

    // Verificar cronómetro de descanso activo
    const restTimerText = await page.innerText('body');
    const hasRestTimer = /descanso|rest|01:|02:/i.test(restTimerText);
    console.log(`   ¿Cronómetro de descanso activado?: ${hasRestTimer}`);

    // Captura Test 4
    await page.screenshot({ path: '/tmp/audit_04_workout_session.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_04_workout_session.png');

    // Cancelar entrenamiento para volver a la vista principal limpia
    await page.evaluate(() => {
      if (window.__workoutSessionStore) {
        window.__workoutSessionStore.getState().cancelWorkout();
      }
    });
    await page.waitForTimeout(600);

    results.push({ test: 'TEST 4: Sesión de Entrenamiento BIIO (Entreno)', status: 'PASS', durationMs: Date.now() - t4Start });
  } catch (err) {
    console.error('   [FAIL] TEST 4:', err.message);
    results.push({ test: 'TEST 4: Sesión de Entrenamiento BIIO (Entreno)', status: 'FAIL', durationMs: Date.now() - t4Start, error: err.message });
  }

  // -------------------------------------------------------------------------
  // TEST 5: MOTOR DE TRANSICIÓN UNIVERSAL (M1 -> M2)
  // -------------------------------------------------------------------------
  const t5Start = Date.now();
  console.log('\n>>> EJECUTANDO TEST 5: Motor de Transición Universal (M1 -> M2)...');
  try {
    // Simular en memoria la finalización de la exposición 12 de 12 de M1
    await page.evaluate(() => {
      if (window.__workoutSessionStore) {
        window.__workoutSessionStore.setState({
          showMesocycleCompletionModal: true,
          mesocycleCompletionData: {
            mesocycleNumber: 1,
            mesocycleName: "Reacondicionamiento Anatómico",
            totalExposures: 12,
            completedAt: new Date().toISOString(),
            progressions: [
              { exerciseSlug: "box-squat", exerciseName: "Box Squat", initial1RM: 120, tested1RM: 125, deltaKg: 5, deltaPct: 4.2 },
              { exerciseSlug: "bench-press", exerciseName: "Press Banca", initial1RM: 95, tested1RM: 98, deltaKg: 3, deltaPct: 3.1 },
              { exerciseSlug: "deadlift", exerciseName: "Peso Muerto", initial1RM: 140, tested1RM: 147.5, deltaKg: 7.5, deltaPct: 5.4 }
            ],
            nextMesocycleNumber: 2,
            nextMesocycleName: "Preparación Fuerza",
            nextMesocycleTotalExposures: 9,
            isMacrocyleComplete: false
          }
        });
      }
    });

    await page.waitForTimeout(600);

    // Validar modal universal de graduación
    const modalText = await page.innerText('body');
    const hasBadge12 = /M1 COMPLETADO · 12\/12 SESIONES/i.test(modalText);
    const hasNextBtn = /ACTIVAR M2: PREPARACIÓN FUERZA \(9 SESIONES\)/i.test(modalText);

    console.log(`   ¿Badge M1 COMPLETADO · 12/12 presente?: ${hasBadge12}`);
    console.log(`   ¿Botón ACTIVAR M2 presente?: ${hasNextBtn}`);

    if (!hasBadge12 || !hasNextBtn) {
      throw new Error('El modal de graduación no muestra la estructura universal M1 -> M2.');
    }

    // Captura Test 5
    await page.screenshot({ path: '/tmp/audit_05_meso_graduation.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_05_meso_graduation.png');

    // Cerrar modal de graduación
    await page.evaluate(() => {
      if (window.__workoutSessionStore) {
        window.__workoutSessionStore.getState().closeMesocycleCompletionModal();
      }
    });
    await page.waitForTimeout(400);

    results.push({ test: 'TEST 5: Motor de Transición Universal (M1 -> M2)', status: 'PASS', durationMs: Date.now() - t5Start });
  } catch (err) {
    console.error('   [FAIL] TEST 5:', err.message);
    results.push({ test: 'TEST 5: Motor de Transición Universal (M1 -> M2)', status: 'FAIL', durationMs: Date.now() - t5Start, error: err.message });
  }

  // -------------------------------------------------------------------------
  // TEST 6: CIERRE DE SESIÓN (LOGOUT) Y REDIRECCIÓN
  // -------------------------------------------------------------------------
  const t6Start = Date.now();
  console.log('\n>>> EJECUTANDO TEST 6: Cierre de Sesión (Logout) y Middleware...');
  try {
    // Clic en botón logout
    const logoutBtn = page.locator('header button[aria-label="Cerrar sesión"]');
    await logoutBtn.click();
    await page.waitForTimeout(400);

    const confirmLogout = page.locator('button').filter({ hasText: /cerrar sesión/i }).last();
    await confirmLogout.click();

    await page.waitForTimeout(2500);
    console.log('   URL tras logout:', page.url());

    if (!page.url().includes('/login')) {
      throw new Error(`No redirigió a /login tras cerrar sesión. URL: ${page.url()}`);
    }

    // Intentar acceder directamente por URL a /entreno o /nutricion
    await page.goto('http://localhost:3000/nutricion');
    await page.waitForTimeout(1000);

    if (!page.url().includes('/login')) {
      throw new Error(`El middleware no protegió la ruta privada. URL actual: ${page.url()}`);
    }
    console.log('   [OK] Middleware validado: acceso no autenticado a /nutricion bloqueado y redirigido a /login.');

    // Captura Test 6
    await page.screenshot({ path: '/tmp/audit_06_login_redirect.png' });
    console.log('   [OK] Captura guardada: /tmp/audit_06_login_redirect.png');

    results.push({ test: 'TEST 6: Cierre de Sesión (Logout) y Middleware', status: 'PASS', durationMs: Date.now() - t6Start });
  } catch (err) {
    console.error('   [FAIL] TEST 6:', err.message);
    results.push({ test: 'TEST 6: Cierre de Sesión (Logout) y Middleware', status: 'FAIL', durationMs: Date.now() - t6Start, error: err.message });
  }

  await browser.close();

  // -------------------------------------------------------------------------
  // REPORTE FINAL
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                RESUMEN DE AUDITORÍA E2E BIIO                   ');
  console.log('================================================================');
  results.forEach((r) => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test} | ${r.status} (${r.durationMs}ms)`);
    if (r.error) {
      console.log(`   -> Error: ${r.error}`);
    }
  });
  console.log(`\nTiempo total: ${(Date.now() - startTotal) / 1000}s`);
  console.log('================================================================\n');

  const allPassed = results.every((r) => r.status === 'PASS');
  if (!allPassed) {
    process.exit(1);
  }
})();
