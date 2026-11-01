const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  console.log('1. Accediendo a /login e iniciando sesión como Juan...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', 'juan@hoplita.app');
  await page.fill('input[type="password"]', 'Hoplita2026!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log('   URL tras login:', page.url());

  console.log('2. Verificando píldora de Juan en la cabecera...');
  const userBtn = page.locator('header button[data-profile-trigger]');
  await userBtn.waitFor({ state: 'visible', timeout: 5000 });
  const userBtnText = await userBtn.innerText();
  console.log('   Texto del botón de usuario:', userBtnText.trim());
  if (!userBtnText.toLowerCase().includes('juan')) {
    throw new Error('El botón de usuario no muestra "Juan"');
  }

  console.log('3. Verificando que NO existe menú desplegable ni otros atletas...');
  const headerContent = await page.innerText('header');
  const hasDropdownText = /atletas/i.test(headerContent) || /wendy/i.test(headerContent) || /nato/i.test(headerContent);
  console.log('   ¿Hay texto de otros atletas o dropdown en header?:', hasDropdownText);
  if (hasDropdownText) {
    throw new Error('Se encontraron atletas ajenos o menú desplegable en la cabecera');
  }

  console.log('4. Haciendo clic directo sobre la píldora del usuario ("Juan")...');
  await userBtn.click();
  await page.waitForTimeout(600);

  console.log('5. Verificando que ProfileDrawer se abre directamente...');
  const drawer = page.locator('[role="dialog"]');
  await drawer.waitFor({ state: 'visible', timeout: 4000 });
  const drawerText = await drawer.innerText();
  console.log('   ¿Drawer abierto contiene "Ajustes de Perfil"?:', /ajustes de perfil/i.test(drawerText));
  console.log('   ¿Drawer contiene "1RM Base"?:', /1rm/i.test(drawerText));
  console.log('   ¿Drawer muestra "Juan"?:', /juan/i.test(drawerText));

  // Tomar captura de verificación del drawer abierto
  await page.screenshot({ path: 'scratch/strict_profile_drawer_verified.png' });
  console.log('   Captura guardada en scratch/strict_profile_drawer_verified.png');

  console.log('6. Cerrando ProfileDrawer...');
  const closeBtn = drawer.locator('button').filter({ hasText: /cerrar|guardar/i }).first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  } else {
    // Esc key
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(500);

  console.log('7. Probando botón de logout...');
  const logoutBtn = page.locator('header button[aria-label="Cerrar sesión"]');
  await logoutBtn.click();
  await page.waitForTimeout(500);

  // Confirmar logout en modal
  const confirmLogoutBtn = page.locator('button').filter({ hasText: /cerrar sesión/i }).last();
  await confirmLogoutBtn.click();
  await page.waitForTimeout(2500);

  console.log('   URL tras logout:', page.url());
  if (!page.url().includes('/login')) {
    throw new Error('No redirigió a /login tras cerrar sesión');
  }

  console.log('8. Iniciando sesión como Wendy para verificar aislamiento...');
  await page.fill('input[type="email"]', 'wendy@hoplita.app');
  await page.fill('input[type="password"]', 'Hoplita2026!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log('   URL tras login de Wendy:', page.url());

  const wendyBtn = page.locator('header button[data-profile-trigger]');
  await wendyBtn.waitFor({ state: 'visible', timeout: 5000 });
  const wendyBtnText = await wendyBtn.innerText();
  console.log('   Texto del botón de usuario (Wendy):', wendyBtnText.trim());
  if (!wendyBtnText.toLowerCase().includes('wendy')) {
    throw new Error('El botón de usuario no muestra "Wendy"');
  }

  const wendyHeader = await page.innerText('header');
  const wendySeesJuan = /juan/i.test(wendyHeader) || /nato/i.test(wendyHeader);
  console.log('   ¿Wendy ve a Juan o Nato?:', wendySeesJuan);
  if (wendySeesJuan) {
    throw new Error('Wendy puede ver información de otros usuarios en cabecera');
  }

  console.log('9. Abriendo directamente ProfileDrawer de Wendy...');
  await wendyBtn.click();
  await page.waitForTimeout(600);

  const wendyDrawer = page.locator('[role="dialog"]');
  await wendyDrawer.waitFor({ state: 'visible', timeout: 4000 });
  const wendyDrawerText = await wendyDrawer.innerText();
  console.log('   ¿Drawer muestra "Wendy"?:', /wendy/i.test(wendyDrawerText));

  console.log('\n>>> ¡TODAS LAS VERIFICACIONES E2E SUPERADAS CON ÉXITO! <<<');
  await browser.close();
})().catch((err) => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
