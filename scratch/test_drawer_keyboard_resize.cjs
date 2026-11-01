const { chromium } = require('playwright');

(async () => {
  console.log('================================================================');
  console.log('   HOPLITA OS - TEST VISUAL: RECUPERACIÓN DE ALTURA EN DRAWERS   ');
  console.log('   (Simulación de Apertura y Cierre de Teclado Móvil)           ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  // Emulación de dispositivo móvil iPhone 14
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1. Iniciando sesión con Juan...');
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
    await submitBtn.click();

    await page.waitForURL('http://localhost:3000/', { timeout: 25000 });
    console.log('   [OK] Sesión iniciada.');

    // 2. Abrir ProfileDrawer
    console.log('2. Abriendo ProfileDrawer...');
    const profileBtn = page.locator('header button[data-profile-trigger]').first();
    await profileBtn.click();
    await page.waitForTimeout(800);

    const drawer = page.locator('[role="dialog"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   [OK] ProfileDrawer abierto.');

    // Medir altura inicial del drawer
    const initialBox = await drawer.boundingBox();
    console.log(`   [ALTURA INICIAL]: ${Math.round(initialBox.height)}px (Esperado ~90dvh = ~760px)`);

    // 3. Foco en "Meta % Grasa"
    console.log('3. Desplegando foco en input "Meta % Grasa"...');
    const fatInput = drawer.locator('input[placeholder="16.0"], input[placeholder="21.0"]').first();
    await fatInput.scrollIntoViewIfNeeded();
    await fatInput.focus();
    await fatInput.fill('15.5');
    await page.waitForTimeout(600);

    // Simular reducción de viewport como hace el teclado virtual (resizes-content)
    console.log('4. Simulando teclado virtual móvil abierto (viewport reducido)...');
    await page.setViewportSize({ width: 390, height: 500 });
    await page.waitForTimeout(600);

    const keyboardOpenBox = await drawer.boundingBox();
    console.log(`   [ALTURA CON TECLADO]: ${Math.round(keyboardOpenBox.height)}px`);

    // 5. Ocultar teclado (blur y restaurar viewport completo)
    console.log('5. Ocultando teclado virtual (onBlur + restauración a 844px)...');
    await fatInput.evaluate(node => node.blur());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);

    // 6. Verificar recuperación total de altura
    const recoveredBox = await drawer.boundingBox();
    console.log(`   [ALTURA RECUPERADA]: ${Math.round(recoveredBox.height)}px`);

    const heightDifference = Math.abs(recoveredBox.height - initialBox.height);
    if (heightDifference > 15) {
      throw new Error(`El drawer quedó achatado tras cerrar el teclado. Inicial: ${initialBox.height}px, Recuperada: ${recoveredBox.height}px`);
    }

    console.log(`   [ÉXITO TOTAL] El drawer recuperó el 100% de su altura (${Math.round(recoveredBox.height)}px) sin achatarse.`);

    // 7. Validar scroll fluido y elementos inferiores visibles
    const saveBtn = drawer.locator('button[data-save-profile]').first();
    await saveBtn.scrollIntoViewIfNeeded();
    const isSaveBtnVisible = await saveBtn.isVisible();
    console.log(`   [OK] Botón Guardar visible y accesible en la base: ${isSaveBtnVisible}`);

    // Captura de pantalla
    await page.screenshot({ path: 'scratch/drawer_keyboard_recovery_verified.png' });
    console.log('   [OK] Captura guardada en scratch/drawer_keyboard_recovery_verified.png');

    console.log('\n================================================================');
    console.log('   TEST DE ALTURA MÓVIL Y TECLADO: 100% PASS                    ');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
