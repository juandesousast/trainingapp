const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone 12/13/14 format
  });
  const page = await context.newPage();

  console.log('1. Accediendo a la aplicación...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  console.log('2. Iniciando sesión con Juan...');
  await page.fill('input[type="email"]', 'juan@hoplita.app');
  await page.fill('input[type="password"]', 'Hoplita2026!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(4000);
  console.log('   URL tras login:', page.url());

  // Verificar si hay modal de bienvenida o si está en /login todavía
  const bodyText = await page.innerText('body');
  console.log('   Fragmento de texto en pantalla:', bodyText.substring(0, 200).replace(/\n/g, ' '));

  console.log('3. Navegando a la pestaña de Nutrición...');
  await page.goto('http://localhost:3000/nutricion');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  console.log('4. Buscando Comida 2...');
  const meal2Btn = page.locator('button').filter({ hasText: 'Comida 2' }).first();
  await meal2Btn.waitFor({ state: 'visible', timeout: 5000 });
  await meal2Btn.click();
  await page.waitForTimeout(600);

  console.log('5. Verificando chip de carbohidratos inicial en Comida 2...');
  const carbChip = page.locator('button').filter({ hasText: 'Arroz Basmati' }).first();
  const hasInitialCarb = await carbChip.count() > 0;
  console.log('   ¿Arroz Basmati visible inicialmente?:', hasInitialCarb);

  console.log('6. Abriendo Drawer de Intercambio para Carbohidratos...');
  const carbButton = page.locator('button').filter({ hasText: /Arroz Basmati|g C\)/ }).first();
  await carbButton.click();
  await page.waitForTimeout(800);

  console.log('7. Verificando opciones en FoodSwapDrawer...');
  const drawerHeader = page.locator('text=INTERCAMBIO DE ALIMENTOS').first();
  const isDrawerOpen = await drawerHeader.isVisible();
  console.log('   ¿Drawer abierto correctamente?:', isDrawerOpen);

  // Buscar opción de Patata
  const patataOption = page.locator('button').filter({ hasText: 'Patata' }).first();
  const patataWeight = await patataOption.innerText();
  console.log('   Opción Patata encontrada:', patataWeight.replace(/\n/g, ' '));

  console.log('8. Seleccionando Patata...');
  await patataOption.click();
  await page.waitForTimeout(600);

  console.log('9. Verificando actualización en tarjeta Comida 2...');
  const updatedCarbChip = page.locator('button').filter({ hasText: 'Patata' }).first();
  const isPatataSelected = await updatedCarbChip.count() > 0;
  const chipText = isPatataSelected ? await updatedCarbChip.innerText() : 'No encontrado';
  console.log('   ¿Patata seleccionada en Comida 2?:', isPatataSelected);
  console.log('   Texto del chip:', chipText.replace(/\n/g, ' '));

  console.log('10. Intercambiando Proteína: de Pollo a Atún al Natural...');
  const proteinButton = page.locator('button').filter({ hasText: /Pechuga de Pollo|g P\)/ }).first();
  await proteinButton.click();
  await page.waitForTimeout(800);

  const tunaOption = page.locator('button').filter({ hasText: 'Atún' }).first();
  console.log('   Seleccionando Atún...');
  await tunaOption.click();
  await page.waitForTimeout(600);

  const updatedProteinChip = page.locator('button').filter({ hasText: 'Atún' }).first();
  const isTunaSelected = await updatedProteinChip.count() > 0;
  console.log('   ¿Atún seleccionado en Comida 2?:', isTunaSelected);

  console.log('11. Verificando persistencia tras recarga de página...');
  await page.reload();
  await page.waitForTimeout(2000);

  // Abrir Comida 2 de nuevo
  const meal2BtnAfter = page.locator('button').filter({ hasText: 'Comida 2' }).first();
  await meal2BtnAfter.click();
  await page.waitForTimeout(600);

  const patataPersisted = await page.locator('button').filter({ hasText: 'Patata' }).count() > 0;
  const tunaPersisted = await page.locator('button').filter({ hasText: 'Atún' }).count() > 0;
  console.log('   ¿Persistió Patata?:', patataPersisted);
  console.log('   ¿Persistió Atún?:', tunaPersisted);

  await page.screenshot({ path: 'scratch/food_swap_verified.png' });
  console.log('12. Captura guardada en scratch/food_swap_verified.png');

  await browser.close();

  if (isPatataSelected && isTunaSelected && patataPersisted && tunaPersisted) {
    console.log('=== PRUEBA DE INTERCAMBIO INTELIGENTE SUPERADA CON ÉXITO ===');
    process.exit(0);
  } else {
    console.error('=== FALLO EN ALGUNA VALIDACIÓN ===');
    process.exit(1);
  }
})();