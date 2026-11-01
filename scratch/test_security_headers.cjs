const { chromium } = require('playwright');

async function testSecurityHeaders() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('1. Realizando petición HTTP a /login para inspeccionar cabeceras...');
  let response = null;
  for (let i = 0; i < 15; i++) {
    try {
      response = await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 3000 });
      if (response) break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (!response) {
    throw new Error('No se pudo conectar a http://localhost:3000');
  }

  const headers = response.headers();
  console.log('Cabeceras HTTP recibidas:');
  console.log(' - X-Frame-Options:', headers['x-frame-options']);
  console.log(' - X-Content-Type-Options:', headers['x-content-type-options']);
  console.log(' - Referrer-Policy:', headers['referrer-policy']);
  console.log(' - Permissions-Policy:', headers['permissions-policy']);

  if (headers['x-frame-options'] !== 'DENY') {
    throw new Error('X-Frame-Options no coincide con DENY: ' + headers['x-frame-options']);
  }
  if (headers['x-content-type-options'] !== 'nosniff') {
    throw new Error('X-Content-Type-Options no coincide con nosniff: ' + headers['x-content-type-options']);
  }
  if (headers['referrer-policy'] !== 'strict-origin-when-cross-origin') {
    throw new Error('Referrer-Policy no coincide: ' + headers['referrer-policy']);
  }
  if (!headers['permissions-policy'] || !headers['permissions-policy'].includes('camera=()')) {
    throw new Error('Permissions-Policy no coincide: ' + headers['permissions-policy']);
  }

  console.log('2. Probando intento no autenticado en ruta de API protegida (/api/exercises/search?q=box)...');
  const apiRes = await page.request.get('http://localhost:3000/api/exercises/search?q=box');
  console.log(' - Status API sin auth:', apiRes.status());
  if (apiRes.status() !== 401) {
    throw new Error(`Se esperaba 401 Unauthorized en API route sin auth, pero se recibió ${apiRes.status()}`);
  }

  console.log('✅ TODAS LAS CABECERAS DE SEGURIDAD Y PROTECCIONES HTTP VERIFICADAS CON ÉXITO AL 100%');
  await browser.close();
}

testSecurityHeaders().catch(err => {
  console.error('Error en test de cabeceras:', err);
  process.exit(1);
});
