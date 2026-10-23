import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:4173';
const OUTPUT_DIR = new URL('../portfolio/screenshots/', import.meta.url);
const TODAY = '2026-10-22T12:00:00-06:00';

const medicinesCsv = [
  'nombre,nombreGenerico,dosis,forma,cantidad,unidad,vencimiento,notas',
  'Eutirox,Levotiroxina,100 mcg,tableta,2,cajas,2027-08-30,Ejemplo de inventario',
  'Paracetamol,Acetaminofén,500 mg,tableta,12,piezas,2026-11-10,',
  'Loratadina,Loratadina,10 mg,tableta,1,blísteres,2026-09-15,',
].join('\n');

const suppliesCsv = [
  'nombre,cantidad,unidad,notas',
  'Alcohol,2,litros,',
  'Algodón,1,paquetes,',
  'Curitas,1,cajas,',
  'Jeringas,5,piezas,5 ml',
].join('\n');

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'ignore', 'inherit'],
  env: {
    ...process.env,
    MEDICINES_CSV_URL: 'https://portfolio.invalid/medicines.csv',
    SUPPLIES_CSV_URL: 'https://portfolio.invalid/supplies.csv',
  },
});

let browser;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error(`No fue posible iniciar Vite en ${BASE_URL}.`);
}

async function preparePage(viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: viewport.width < 600 ? 2 : 1,
    isMobile: viewport.width < 600,
    hasTouch: viewport.width < 600,
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  });
  const page = await context.newPage();
  await page.clock.install({ time: new Date(TODAY) });
  await page.route('https://portfolio.invalid/**', async (route) => {
    const { pathname } = new URL(route.request().url());
    const csv = pathname.endsWith('/medicines.csv') ? medicinesCsv : suppliesCsv;
    await route.fulfill({ status: 200, contentType: 'text/csv; charset=utf-8', body: csv });
  });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Medicamentos', exact: true }).waitFor();
  await page.locator('.medicine-card').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

async function capture(page, filename, options = {}) {
  const { locator, ...screenshotOptions } = options;
  const takeScreenshot = locator ? locator.screenshot.bind(locator) : page.screenshot.bind(page);
  await takeScreenshot({ path: new URL(filename, OUTPUT_DIR).pathname, animations: 'disabled', ...screenshotOptions });
  console.log(`Captura lista: ${filename}`);
}

try {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  const desktop = await preparePage({ width: 1440, height: 1000 });
  const { page: desktopPage } = desktop;
  await capture(desktopPage, '01-hero-desktop.png', { locator: desktopPage.locator('#inicio') });
  await capture(desktopPage, '02-pagina-completa-desktop.png', { fullPage: true });
  await desktopPage.locator('#contenido').scrollIntoViewIfNeeded();
  await capture(desktopPage, '03-medicamentos-desktop.png', { locator: desktopPage.locator('#contenido') });
  await desktopPage.locator('.medicine-summary').first().click();
  await capture(desktopPage, '04-detalle-medicamento-desktop.png', { locator: desktopPage.locator('#contenido') });
  await desktopPage.getByRole('button', { name: 'Insumos', exact: true }).click();
  await capture(desktopPage, '05-insumos-desktop.png', { locator: desktopPage.locator('#contenido') });
  await desktop.context.close();

  const mobile = await preparePage({ width: 375, height: 812 });
  const { page: mobilePage } = mobile;
  await capture(mobilePage, '06-hero-movil-375.png', { locator: mobilePage.locator('#inicio') });
  await capture(mobilePage, '10-pagina-completa-movil-375.png', { fullPage: true });
  await mobilePage.locator('#contenido').scrollIntoViewIfNeeded();
  await capture(mobilePage, '07-medicamentos-movil-375.png', { locator: mobilePage.locator('#contenido') });
  await mobilePage.getByRole('button', { name: 'Insumos', exact: true }).click();
  await capture(mobilePage, '08-insumos-movil-375.png', { locator: mobilePage.locator('#contenido') });
  await mobilePage.getByRole('button', { name: 'Medicamentos', exact: true }).click();
  await mobilePage.getByRole('searchbox').fill('medicamento sin coincidencia');
  await capture(mobilePage, '09-busqueda-vacia-movil-375.png', { locator: mobilePage.locator('#contenido') });
  await mobile.context.close();
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
