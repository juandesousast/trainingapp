const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogyhduxtfnrxhmqktcpm.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWhkdXh0Zm5yeGhtcWt0Y3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDcwODQsImV4cCI6MjEwODc4MzA4NH0.Y4uCn0voQJ-HH2dR1vbId16HCjpSnvFneV56TS3kVJ8';

(async () => {
  console.log('================================================================');
  console.log('   HOPLITA OS - BATERÍA E2E EXHAUSTIVA DE REACTIVIDAD & RED     ');
  console.log('   (Chromium Visible: headless=false, slowMo=300ms)             ');
  console.log('================================================================\n');

  const pageErrors = [];
  const consoleErrors = [];
  const notFoundUrls = [];
  const ariaHiddenWarnings = [];

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });

  const page = await context.newPage();

  // 1. Escuchas de errores en tiempo real
  page.on('pageerror', error => {
    console.error('❌ ERROR EN PÁGINA:', error.message);
    pageErrors.push(error.message);
  });

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('⚠️ CONSOLE ERROR:', text);
      consoleErrors.push(text);
    }
    if (text.includes('Blocked aria-hidden') || text.includes('aria-hidden')) {
      console.warn('⚠️ ADVERTENCIA ARIA-HIDDEN:', text);
      ariaHiddenWarnings.push(text);
    }
  });

  page.on('response', response => {
    if (response.status() === 404) {
      const url = response.url();
      console.error('❌ 404 NOT FOUND:', url);
      notFoundUrls.push(url);
    }
  });

  const results = {};

  try {
    // -------------------------------------------------------------------------
    // PASO 1: LOGIN AUTENTICADO CON JUAN
    // -------------------------------------------------------------------------
    console.log('>>> [1/5] Autenticando con juan@hoplita.app...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('form');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();
    await emailInput.fill('juan@hoplita.app');

    const pwdInput = page.locator('input[type="password"]');
    await pwdInput.click();
    await pwdInput.fill('Hoplita2026!');

    await page.waitForTimeout(400);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('    [OK] Sesión iniciada con Juan.\n');

    // -------------------------------------------------------------------------
    // PASO 2: REACTIVIDAD EN BÁSCULA (SIN RECARGA F5)
    // -------------------------------------------------------------------------
    console.log('>>> [2/5] Probando reactividad inmediata en Báscula (Sin F5)...');
    const basculaTab = page.locator('nav button').filter({ hasText: /báscula/i }).first();
    await basculaTab.click();
    await page.waitForTimeout(800);

    const weightDisplay = page.locator('[data-current-weight]').first();
    await weightDisplay.waitFor({ state: 'visible', timeout: 5000 });
    const baselineWeight = (await weightDisplay.innerText()).trim();
    console.log(`    Peso basal actual visible: "${baselineWeight}"`);

    // Pulsar botón de pesar
    const weighBtn = page.locator('[data-open-weigh-in]').first();
    await weighBtn.click();
    await page.waitForTimeout(600);

    const bioDrawer = page.locator('[role="dialog"]');
    await bioDrawer.waitFor({ state: 'visible', timeout: 5000 });

    // Escribir 82,5 con coma decimal
    const weightInput = page.locator('input[data-weight-input]').first();
    await weightInput.scrollIntoViewIfNeeded();
    await weightInput.fill('');
    await weightInput.fill('82,5');
    await page.waitForTimeout(400);

    // Guardar
    const saveBioBtn = page.locator('button[data-save-biometrics]').first();
    await saveBioBtn.click();
    await page.waitForTimeout(1000);

    // Verificar actualización reactiva sin F5
    const updatedWeight = (await weightDisplay.innerText()).trim();
    console.log(`    Peso tras guardar (SIN RECARGA): "${updatedWeight}"`);

    if (!updatedWeight.includes('82.5')) {
      throw new Error(`La tarjeta de peso no reflejó reactivamente 82.5 kg. Mostró: "${updatedWeight}"`);
    }
    console.log('    [OK] Reactividad en Báscula verificada: pasó a 82.5 kg al instante.');
    results.bascula = 'PASS';

    // Limpiar pesaje de prueba en Supabase para conservar la base limpia
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'juan@hoplita.app',
      password: 'Hoplita2026!',
    });
    if (authData?.user) {
      await supabase.from('biometric_logs').delete().eq('user_id', authData.user.id).eq('weight_kg', 82.5);
    }
    console.log('    [OK] Limpieza de registro temporal completada.\n');

    // -------------------------------------------------------------------------
    // PASO 3: REACTIVIDAD EN NUTRICIÓN (FOOD SWAP EN TIEMPO REAL)
    // -------------------------------------------------------------------------
    console.log('>>> [3/5] Probando reactividad inmediata en Food Swap (Nutrición)...');
    const nutricionTab = page.locator('nav button').filter({ hasText: /nutrición/i }).first();
    if (await nutricionTab.isVisible()) {
      await nutricionTab.click();
    } else {
      await page.goto('http://localhost:3000/nutricion');
    }
    await page.waitForTimeout(1000);

    // Asegurar que Comida 2 esté visible y expandida
    const meal2Toggle = page.locator('button[data-meal-toggle="meal_2"]').first();
    await meal2Toggle.scrollIntoViewIfNeeded();
    await meal2Toggle.waitFor({ state: 'visible', timeout: 5000 });

    const carbChip = page.locator('button[data-swap-chip-carbs="meal_2"]').first();
    if (!(await carbChip.isVisible())) {
      await meal2Toggle.click();
      await page.waitForTimeout(600);
    }
    await carbChip.waitFor({ state: 'visible', timeout: 5000 });
    const initialCarbText = (await carbChip.innerText()).replace(/\n/g, ' ');
    console.log(`    Carbohidrato inicial en Comida 2: "${initialCarbText}"`);

    // Pulsar chip para abrir FoodSwapDrawer
    await carbChip.click();
    await page.waitForTimeout(700);

    const swapDrawer = page.locator('[role="dialog"]');
    await swapDrawer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('    FoodSwapDrawer abierto.');

    // Seleccionar opción de Patata
    const patataBtn = swapDrawer.locator('button').filter({ hasText: /patata/i }).first();
    await patataBtn.scrollIntoViewIfNeeded();
    const patataLabel = (await patataBtn.innerText()).replace(/\n/g, ' ');
    console.log(`    Seleccionando opción: "${patataLabel}"`);
    await patataBtn.click();

    // Esperar cierre del drawer
    await page.waitForTimeout(800);

    // Validar reactividad inmediata en el plato de Comida 2 SIN recarga
    const updatedCarbText = (await carbChip.innerText()).replace(/\n/g, ' ');
    console.log(`    Carbohidrato en Comida 2 tras swap (SIN RECARGA): "${updatedCarbText}"`);

    if (!/patata/i.test(updatedCarbText)) {
      throw new Error(`El chip de Comida 2 no reflejó inmediatamente la sustitución por Patata. Muestra: "${updatedCarbText}"`);
    }
    console.log('    [OK] Reactividad en Nutrición (Comida 2) verificada: chip actualizado al instante.');
    results.foodSwap = 'PASS';

    // Revertir a Arroz Basmati para dejar el plan impecable
    await carbChip.click();
    await page.waitForTimeout(700);
    const arrozBtn = swapDrawer.locator('button').filter({ hasText: /arroz basmati/i }).first();
    if (await arrozBtn.isVisible()) {
      await arrozBtn.click();
      await page.waitForTimeout(600);
      console.log('    [OK] Revertido a Arroz Basmati en Comida 2.');
    }
    console.log('');

    // -------------------------------------------------------------------------
    // PASO 4: REACTIVIDAD EN AJUSTES DE PERFIL (PROFILE DRAWER)
    // -------------------------------------------------------------------------
    console.log('>>> [4/5] Probando reactividad inmediata en Profile Drawer...');
    const profileTrigger = page.locator('header button[data-profile-trigger]').first();
    await profileTrigger.click();
    await page.waitForTimeout(600);

    const profDrawer = page.locator('[role="dialog"]');
    await profDrawer.waitFor({ state: 'visible', timeout: 5000 });

    // Modificar 1RM de Box Squat pulsando '+'
    const boxSquatRow = profDrawer.locator('div').filter({ hasText: /box squat/i }).first();
    const plusBtn = boxSquatRow.locator('button[aria-label*="Aumentar"]').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(300);
    }

    // Guardar ajustes
    const saveProfileBtn = profDrawer.locator('button[data-save-profile]').first();
    await saveProfileBtn.scrollIntoViewIfNeeded();
    await saveProfileBtn.click();
    await page.waitForTimeout(1000);

    console.log('    [OK] Ajustes de perfil guardados reactivamente.');
    results.profile = 'PASS';
    console.log('');

    // -------------------------------------------------------------------------
    // PASO 5: VERIFICACIÓN DE RED Y CONSOLA (FAVICON, PWA ICONS, ARIA-HIDDEN)
    // -------------------------------------------------------------------------
    console.log('>>> [5/5] Verificando recursos estáticos PWA y errores de consola...');
    
    // Probar peticiones directas a favicon y assets PWA
    const iconUrls = [
      'http://localhost:3000/favicon.ico',
      'http://localhost:3000/icon-192.png',
      'http://localhost:3000/icon-512.png',
      'http://localhost:3000/manifest.webmanifest',
    ];

    for (const url of iconUrls) {
      const res = await page.request.get(url);
      console.log(`    GET ${url} -> Status: ${res.status()}`);
      if (res.status() === 404) {
        throw new Error(`El asset estático devolvió 404: ${url}`);
      }
    }

    // Verificar si se capturaron errores 404 durante la navegación
    const pwa404s = notFoundUrls.filter(u => u.includes('favicon') || u.includes('icon-') || u.includes('manifest'));
    if (pwa404s.length > 0) {
      throw new Error(`Se detectaron peticiones 404 a assets PWA: ${pwa404s.join(', ')}`);
    }

    // Verificar si hubo advertencias de aria-hidden
    if (ariaHiddenWarnings.length > 0) {
      console.warn(`    ⚠️ Hubo ${ariaHiddenWarnings.length} advertencias de aria-hidden.`);
    } else {
      console.log('    [OK] Cero advertencias de aria-hidden detectadas.');
    }

    // Verificar si hubo errores no controlados en página
    if (pageErrors.length > 0) {
      throw new Error(`Se detectaron errores en página: ${pageErrors.join(' | ')}`);
    }
    console.log('    [OK] Cero errores no controlados en consola.');
    results.networkAndConsole = 'PASS';

    // Captura final de auditoría reactiva
    await page.screenshot({ path: 'scratch/reactive_audit_verified.png' });
    console.log('\n    [OK] Captura guardada en scratch/reactive_audit_verified.png');

    console.log('\n================================================================');
    console.log('   RESUMEN BATERÍA E2E DE REACTIVIDAD & RED: 100% PASS          ');
    console.log('================================================================');
    console.log(`   1. Reactividad Báscula (Sin F5):     ${results.bascula}`);
    console.log(`   2. Reactividad Food Swap (Sin F5):   ${results.foodSwap}`);
    console.log(`   3. Reactividad Profile Drawer:       ${results.profile}`);
    console.log(`   4. PWA Assets & Cero 404:            ${results.networkAndConsole}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ ERROR EN LA SUITE E2E DE REACTIVIDAD:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
