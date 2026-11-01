const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone mobile viewport
  });
  const page = await context.newPage();

  console.log('1. Accediendo a la aplicación y autenticando con Juan...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', 'juan@hoplita.app');
  await page.fill('input[type="password"]', 'Hoplita2026!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log('   URL tras login:', page.url());

  console.log('2. Verificando perfil inicial de Juan en la cabecera...');
  const headerAthleteBtn = page.locator('header button').filter({ hasText: /juan/i }).first();
  await headerAthleteBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('   Botón de atleta activo encontrado.');

  // Comprobar que en Dashboard se muestra la rutina masculina de M1
  const maleWorkoutText = await page.innerText('body');
  const hasMaleTemplate = maleWorkoutText.includes('Press Banca') || maleWorkoutText.includes('Banca');
  console.log('   ¿Rutina masculina BIIO activa (Press Banca)?:', hasMaleTemplate);

  console.log('3. Desplegando el conmutador dinámico de atletas...');
  await headerAthleteBtn.click();
  await page.waitForTimeout(600);

  // Verificar atletas disponibles en el menú
  const menuText = await page.innerText('header');
  console.log('   ¿María aparece en el conmutador de atletas?:', /maría|maria/i.test(menuText));
  console.log('   ¿Wendy aparece en el conmutador de atletas?:', /wendy/i.test(menuText));
  console.log('   ¿Nato aparece en el conmutador de atletas?:', /nato/i.test(menuText));

  console.log('4. Conmutando al nuevo perfil femenino dinámico: María...');
  const mariaOption = page.locator('button[data-athlete-option]').filter({ hasText: /maría|maria/i }).first();
  await mariaOption.click();
  await page.waitForTimeout(1000);

  // Verificar que el theme y el nombre cambiaron
  const activeHeaderAfterSwitch = await page.innerText('header');
  console.log('   Cabecera tras conmutar:', activeHeaderAfterSwitch.replace(/\n/g, ' '));
  const isMariaActive = /maría|maria/i.test(activeHeaderAfterSwitch);
  console.log('   ¿María es la atleta activa?:', isMariaActive);

  // Verificar que las rutinas BIIO cambiaron al template femenino (Militar Sentada / Remo Landmine / Hip Thrust)
  const dashboardTextAfterSwitch = await page.innerText('body');
  const hasFemaleTemplate =
    dashboardTextAfterSwitch.includes('Militar Sentada') ||
    dashboardTextAfterSwitch.includes('Landmine') ||
    dashboardTextAfterSwitch.includes('Hip Thrust');
  console.log('   ¿Template BIIO Femenino asignado automáticamente (Militar Sentada/Landmine)?:', hasFemaleTemplate);

  console.log('5. Navegando a Nutrición vía BottomNav para validar calibración de María (Suelo lipídico 1.0 g/kg)...');
  const nutritionNav = page.locator('button').filter({ hasText: 'Nutrición' }).first();
  await nutritionNav.click();
  await page.waitForTimeout(1200);

  // En Nutrición para María (58kg peso total):
  // Grasas esperadas = Math.round(58 * 1.0) = 58g
  const nutritionBody = await page.innerText('body');
  const hasFemaleLipidFloor = nutritionBody.includes('58g') || nutritionBody.includes('58G') || nutritionBody.includes('58 g');
  console.log('   ¿Suelo de grasas de 1.0 g/kg (58g para 58kg) aplicado?:', hasFemaleLipidFloor);

  console.log('6. Realizando Food Swap para María en Comida 2...');
  const meal2Btn = page.locator('button').filter({ hasText: 'Comida 2' }).first();
  await meal2Btn.click();
  await page.waitForTimeout(600);

  // Cambiar proteína a Salmón fresco
  const proteinChip = page.locator('button').filter({ hasText: /Pechuga de Pollo|g P\)/ }).first();
  await proteinChip.click();
  await page.waitForTimeout(800);

  const salmonOption = page.locator('button').filter({ hasText: 'Salmón fresco' }).first();
  await salmonOption.click();
  await page.waitForTimeout(600);

  const isSalmonInMaria = await page.locator('button').filter({ hasText: 'Salmón' }).count() > 0;
  console.log('   ¿Salmón asignado a Comida 2 para María?:', isSalmonInMaria);

  console.log('7. Conmutando de vuelta a Juan para verificar aislamiento total...');
  const headerBtnMaria = page.locator('header button').filter({ hasText: /maría|maria/i }).first();
  await headerBtnMaria.click();
  await page.waitForTimeout(600);

  const juanOption = page.locator('button[data-athlete-option]').filter({ hasText: /juan/i }).first();
  await juanOption.click();
  await page.waitForTimeout(1000);

  // Abrir Comida 2 para Juan y comprobar que NO tiene Salmón (aislado por UUID)
  const meal2BtnJuan = page.locator('button').filter({ hasText: 'Comida 2' }).first();
  await meal2BtnJuan.click();
  await page.waitForTimeout(600);

  const hasSalmonInJuan = await page.locator('button').filter({ hasText: 'Salmón' }).count() > 0;
  console.log('   ¿Comida de Juan está protegida (NO tiene el Salmón de María)?:', !hasSalmonInJuan);

  console.log('8. Abriendo ProfileDrawer para verificar selector de Sexo editable...');
  const headerBtnJuan = page.locator('header button').filter({ hasText: /juan/i }).first();
  await headerBtnJuan.click();
  await page.waitForTimeout(600);

  const settingsBtn = page.locator('button[data-profile-settings]').first();
  await settingsBtn.click();
  await page.waitForTimeout(1000);

  const sexSelectorTitle = page.locator('text=Sexo Fisiológico').first();
  await sexSelectorTitle.waitFor({ state: 'visible', timeout: 5000 });
  const hasSexSelector = await sexSelectorTitle.isVisible();
  console.log('   ¿Selector de Sexo Fisiológico visible en ProfileDrawer?:', hasSexSelector);

  await page.screenshot({ path: 'scratch/multiuser_universal_verified.png' });
  console.log('9. Captura guardada en scratch/multiuser_universal_verified.png');

  await browser.close();

  const success = isMariaActive && hasFemaleTemplate && hasFemaleLipidFloor && isSalmonInMaria && !hasSalmonInJuan && hasSexSelector;
  if (success) {
    console.log('=== VERIFICACIÓN MULTI-USUARIO UNIVERSAL EXITOSA ===');
    process.exit(0);
  } else {
    console.error('=== FALLO EN ALGUNA VALIDACIÓN ===');
    process.exit(1);
  }
})();