const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogyhduxtfnrxhmqktcpm.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWhkdXh0Zm5yeGhtcWt0Y3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDcwODQsImV4cCI6MjEwODc4MzA4NH0.Y4uCn0voQJ-HH2dR1vbId16HCjpSnvFneV56TS3kVJ8';

(async () => {
  console.log('================================================================');
  console.log('   HOPLITA OS - TEST VISUAL E2E: REACTIVIDAD INMEDIATA BÁSCULA   ');
  console.log('   (Modo Headed / Visual con slowMo 400ms en Chromium)          ');
  console.log('================================================================\n');

  // Lanzar navegador en modo visual visible para el usuario
  const browser = await chromium.launch({
    headless: false,
    slowMo: 400,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // 1. Acceso a Login
    console.log('1. Accediendo a http://localhost:3000/login e iniciando sesión con Juan...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('form');
    await page.waitForTimeout(1500);

    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();
    await emailInput.fill('juan@hoplita.app');

    const pwdInput = page.locator('input[type="password"]');
    await pwdInput.click();
    await pwdInput.fill('Hoplita2026!');

    await page.waitForTimeout(500);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click();

    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('   [OK] Sesión iniciada correctamente.');

    // 2. Navegar a pestaña Báscula
    console.log('2. Navegando a la pestaña Báscula...');
    const basculaTab = page.locator('nav button').filter({ hasText: /báscula/i }).first();
    await basculaTab.click();
    await page.waitForTimeout(1000);

    // Verificar peso inicial
    const initialWeightEl = page.locator('[data-current-weight]').first();
    await initialWeightEl.waitFor({ state: 'visible', timeout: 5000 });
    const initialWeightText = (await initialWeightEl.innerText()).trim();
    console.log(`   [OK] Peso actual antes del pesaje: ${initialWeightText}`);

    // 3. Abrir Drawer de Pesaje ("Pesar")
    console.log('3. Abriendo cajón de Pesaje Matutino en Ayunas...');
    const weighBtn = page.locator('[data-open-weigh-in]').first();
    await weighBtn.click();
    await page.waitForTimeout(800);

    const drawer = page.locator('[role="dialog"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   [OK] BiometricsDrawer abierto con éxito.');

    // 4. Probar formato decimal con coma (ej. 82,5 kg)
    console.log('4. Introduciendo "82,5" (con coma decimal en input de texto)...');
    const weightInput = page.locator('input[data-weight-input]').first();
    await weightInput.scrollIntoViewIfNeeded();
    await weightInput.fill('');
    await weightInput.fill('82,5');
    await page.waitForTimeout(600);

    const inputValue = await weightInput.inputValue();
    console.log(`   [OK] Valor ingresado en el input: "${inputValue}"`);

    // 5. Guardar medición matutina
    console.log('5. Presionando "GUARDAR MEDICIÓN MATUTINA"...');
    const saveBtn = page.locator('button[data-save-biometrics]').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // Esperar cierre suave del drawer
    await page.waitForTimeout(1200);

    // 6. Verificar reactividad inmediata SIN recarga (F5)
    console.log('6. Verificando reactividad inmediata en tarjeta superior...');
    const updatedWeightText = (await initialWeightEl.innerText()).trim();
    console.log(`   [RESULTADO] Peso en tarjeta tras guardar (sin F5): "${updatedWeightText}"`);

    if (!updatedWeightText.includes('82.5')) {
      throw new Error(`La tarjeta de Peso Actual no se actualizó reactivamente a 82.5 kg. Muestra: "${updatedWeightText}"`);
    }

    console.log('   [ÉXITO TOTAL] La tarjeta superior se actualizó de inmediato a 82.5 kg sin recargar.');

    // Captura de pantalla de la prueba
    await page.screenshot({ path: 'scratch/visual_audit_reactivity_82_5.png' });
    console.log('   [OK] Captura guardada en scratch/visual_audit_reactivity_82_5.png');

    // 7. Limpieza preventiva del registro simulado de 82.5 kg para conservar la base de 82.15 kg
    console.log('7. Limpiando registro de prueba de 82.5 kg para mantener la línea base limpia...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'juan@hoplita.app',
      password: 'Hoplita2026!',
    });

    if (authData?.user) {
      const { error: delError } = await supabase
        .from('biometric_logs')
        .delete()
        .eq('user_id', authData.user.id)
        .eq('weight_kg', 82.5);

      if (delError) {
        console.warn('   Aviso al limpiar registro de prueba:', delError.message);
      } else {
        console.log('   [OK] Registro de prueba de 82.5 kg eliminado. Línea base intacta en 82.15 kg.');
      }
    }

    console.log('\n================================================================');
    console.log('   AUDITORÍA VISUAL COMPLETADA CON ÉXITO: 100% PASS             ');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[ERROR EN TEST VISUAL]:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
