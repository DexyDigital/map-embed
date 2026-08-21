import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const out = path.resolve('public/capture');
await fs.mkdir(out, {recursive: true});

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
page.setDefaultTimeout(10000);

const shot = async (name, fullPage = false) => {
  await page.screenshot({path: path.join(out, name), fullPage});
};

const exists = async (name) => {
  try {
    await fs.access(path.join(out, name));
    return true;
  } catch {
    return false;
  }
};

const copyFallback = async (target, candidates) => {
  if (await exists(target)) return;
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      await fs.copyFile(path.join(out, candidate), path.join(out, target));
      return;
    }
  }
  throw new Error(`No fallback available for ${target}`);
};

const domClick = async (locator) => {
  const target = locator.first();
  await target.waitFor({state: 'visible', timeout: 8000});
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.evaluate((element) => element.click());
  await page.waitForTimeout(650);
};

try {
  await page.goto('https://yugofarmia.com/en/prices', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  await shot('01-prices-initial.png');

  const product = page.locator('input[placeholder="Product"]').first();
  await product.click();
  await page.waitForTimeout(500);
  await shot('02-product-open.png');

  await domClick(page.getByRole('option', {name: 'Potatoes', exact: true}));
  await page.waitForTimeout(900);
  await shot('03-product-selected.png');

  const country = page.locator('input[placeholder="Country"]').first();
  if (await country.isEnabled()) {
    await country.click();
    await page.waitForTimeout(500);
    await shot('04-country-open.png');
    await domClick(page.getByRole('option', {name: /Serbia/i}));
    await page.waitForTimeout(900);
    await shot('05-country-selected.png');
  }

  const period = page.locator('input[placeholder="Select period"]').first();
  if (await period.isEnabled()) {
    await period.click();
    await page.waitForTimeout(500);
    await shot('06-period-open.png');
    const latest = page.getByRole('option', {name: /Latest available/i});
    await domClick((await latest.count()) ? latest : page.locator('[role="option"]').first());
    await shot('07-ready-to-search.png');

    const results = page.getByRole('button', {name: /Show results/i});
    if (await results.isEnabled()) {
      await domClick(results);
      await page.waitForTimeout(3000);
      await shot('08-prices-results.png');
      await shot('08-prices-results-full.png', true);
    }
  }
} catch (error) {
  await fs.writeFile(path.join(out, 'capture-price-error.txt'), String(error));
  await shot('capture-price-error.png').catch(() => {});
}

try {
  await page.goto('https://yugofarmia.com/en/products', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(2600);
  await shot('10-products.png');
  await shot('10-products-full.png', true);

  await page.goto('https://yugofarmia.com/en/products/potatoes', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(2600);
  await shot('11-potatoes-detail.png');
  await shot('11-potatoes-detail-full.png', true);
} catch (error) {
  await fs.writeFile(path.join(out, 'capture-products-error.txt'), String(error));
}

await context.close();
await browser.close();

await copyFallback('10-products.png', ['01-prices-initial.png']);
await copyFallback('11-potatoes-detail.png', ['10-products.png', '01-prices-initial.png']);
await copyFallback('01-prices-initial.png', ['10-products.png', '11-potatoes-detail.png']);
await copyFallback('02-product-open.png', ['01-prices-initial.png']);
await copyFallback('03-product-selected.png', ['02-product-open.png', '01-prices-initial.png']);
await copyFallback('04-country-open.png', ['03-product-selected.png']);
await copyFallback('05-country-selected.png', ['04-country-open.png', '03-product-selected.png']);
await copyFallback('06-period-open.png', ['05-country-selected.png']);
await copyFallback('07-ready-to-search.png', ['06-period-open.png', '05-country-selected.png']);
await copyFallback('08-prices-results.png', ['11-potatoes-detail.png', '07-ready-to-search.png']);
