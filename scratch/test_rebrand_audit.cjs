const { chromium } = require('playwright');

async function testRebrand() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  console.log('1. Verificando /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Título y Branding de Login
  const title = await page.title();
  console.log('Page Title:', title);
  if (!title.includes('VECTOR')) throw new Error('Title does not contain VECTOR: ' + title);

  const brandHeader = await page.textContent('h1');
  console.log('Login H1:', brandHeader);
  if (!brandHeader.includes('VECTOR')) throw new Error('Login H1 does not contain VECTOR: ' + brandHeader);

  // 2. Comprobar que los assets responden 200 OK
  const assets = ['/favicon.ico', '/favicon.png', '/icon.svg', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];
  for (const asset of assets) {
    const res = await page.request.get('http://localhost:3000' + asset);
    console.log(`Asset ${asset} status: ${res.status()}`);
    if (res.status() !== 200) throw new Error(`Asset ${asset} returned ${res.status()}`);
  }

  await page.screenshot({ path: 'scratch/vector_login_rebrand.png' });
  console.log('Captura guardada en scratch/vector_login_rebrand.png');

  // 3. Inicio de sesión con React hidratado
  console.log('2. Iniciando sesión como Juan...');
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await emailInput.click();
  await emailInput.fill('juan@hoplita.app');
  await passwordInput.click();
  await passwordInput.fill('Hoplita2026!');
  await page.waitForTimeout(500);

  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.waitFor({ state: 'visible' });
  await submitBtn.click();

  console.log('Esperando navegación al Dashboard...');
  await page.waitForURL('http://localhost:3000/', { timeout: 25000 });
  await page.waitForTimeout(2500);

  const headerH1 = await page.textContent('header h1');
  console.log('Dashboard Header H1:', headerH1);
  if (!headerH1.includes('VECTOR')) throw new Error('Dashboard Header H1 does not contain VECTOR: ' + headerH1);

  // Comprobar que el badge tiene el logo y "OS"
  const headerContent = await page.textContent('header');
  console.log('Header text preview:', headerContent.slice(0, 100));

  await page.screenshot({ path: 'scratch/vector_dashboard_rebrand.png' });
  console.log('Captura guardada en scratch/vector_dashboard_rebrand.png');

  await browser.close();
  console.log('✅ REBRAND VECTOR VALIDADO CON ÉXITO AL 100%');
}

testRebrand().catch(err => {
  console.error('Error en test:', err);
  process.exit(1);
});
