const { chromium } = require('playwright');

async function testRenphoLab() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  console.log('1. Autenticando con usuario Juan...');
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('form');
  await page.waitForTimeout(1000);

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
  await page.waitForTimeout(2000);
  console.log('   [OK] Sesión iniciada con éxito.');

  console.log('2. Abriendo ProfileDrawer...');
  const profileTrigger = page.locator('button[data-profile-trigger]');
  await profileTrigger.click();
  await page.waitForTimeout(1000);

  console.log('3. Verificando botón de acceso a Laboratorio Renpho BLE...');
  const labLink = page.locator('a[href="/renpho-lab"]');
  await labLink.waitFor({ state: 'visible' });
  const labLinkText = await labLink.textContent();
  console.log('   Texto del enlace:', labLinkText.trim());

  console.log('4. Navegando a /renpho-lab...');
  await labLink.click();
  await page.waitForURL('**/renpho-lab', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Verificaciones de la página
  const labH1 = page.locator('h1:has-text("LABORATORIO RENPHO BLE")');
  await labH1.waitFor({ state: 'visible' });
  const title = await labH1.textContent();
  console.log('   Título de la página:', title);

  // Verificar Modo Seguro
  const safeModeBanner = await page.textContent('div:has-text("Modo Seguro Activo")');
  console.log('   [OK] Banner de Modo Seguro detectado.');

  // Verificar Tarjetas de Métricas
  const pesoCard = page.locator('div:has-text("Peso Total")').first();
  await pesoCard.waitFor({ state: 'visible' });

  const fatCard = page.locator('div:has-text("% Grasa Corporal")').first();
  await fatCard.waitFor({ state: 'visible' });

  const impCard = page.locator('div:has-text("Impedancia Cruda")').first();
  await impCard.waitFor({ state: 'visible' });

  const muscleCard = page.locator('div:has-text("Masa Muscular")').first();
  await muscleCard.waitFor({ state: 'visible' });

  console.log('   [OK] Tarjetas métricas visuales renderizadas correctamente.');

  // Verificar Consola de Telemetría
  const consoleHeader = await page.textContent('div:has-text("Consola de Datos Crudos")');
  console.log('   [OK] Consola de Datos Crudos detectada.');

  // Verificar botón de escaneo
  const scanBtn = page.locator('button:has-text("Escanear Báscula Renpho")');
  await scanBtn.waitFor({ state: 'visible' });
  console.log('   [OK] Botón principal "Escanear Báscula Renpho" listo para interacción táctil.');

  // Probar cambio de perfil de atleta (Wendy / Juan)
  const wendyBtn = page.locator('button:has-text("Wendy (155 cm)")');
  await wendyBtn.click();
  await page.waitForTimeout(500);

  // Captura visual del laboratorio
  await page.screenshot({ path: 'scratch/renpho_lab_verified.png' });
  console.log('   [OK] Captura guardada en scratch/renpho_lab_verified.png');

  await browser.close();
  console.log('================================================================');
  console.log('   ✅ AUDITORÍA DE LABORATORIO RENPHO BLE 100% PASS             ');
  console.log('================================================================');
}

testRenphoLab().catch(err => {
  console.error('Error en auditoría Renpho Lab:', err);
  process.exit(1);
});
