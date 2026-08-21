import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const OUT = path.resolve('yugofarmia-real-ui-v4/out');
const VIDEO_DIR = path.join(OUT, 'video-tmp');
await fs.mkdir(OUT, {recursive: true});
await fs.mkdir(VIDEO_DIR, {recursive: true});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safe = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const browser = await chromium.launch({headless: true});

const dumpState = async (page, name) => {
  const state = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('button, input, select, a, [role="button"], [role="option"], [role="combobox"]')]
      .map((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || '').trim();
        return {
          index,
          tag: el.tagName,
          role: el.getAttribute('role'),
          text,
          value: 'value' in el ? el.value : null,
          ariaLabel: el.getAttribute('aria-label'),
          placeholder: el.getAttribute('placeholder'),
          expanded: el.getAttribute('aria-expanded'),
          href: el instanceof HTMLAnchorElement ? el.href : null,
          visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
          rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
          html: el.outerHTML.slice(0, 1800),
        };
      });
    return {
      title: document.title,
      url: location.href,
      bodyText: document.body.innerText,
      controls,
    };
  });
  await fs.writeFile(path.join(OUT, `${name}.json`), JSON.stringify(state, null, 2));
  await fs.writeFile(path.join(OUT, `${name}.html`), await page.content());
};

const screenshot = async (page, name, fullPage = false) => {
  await page.screenshot({path: path.join(OUT, `${name}.png`), fullPage});
};

const moveClick = async (page, locator, pauseBefore = 350, pauseAfter = 650) => {
  const target = locator.first();
  await target.waitFor({state: 'visible'});
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (!box) throw new Error('No bounding box for click target');
  await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.52, {steps: 28});
  await sleep(pauseBefore);
  await page.mouse.down();
  await sleep(110);
  await page.mouse.up();
  await sleep(pauseAfter);
};

const recordHomepage = async () => {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 900},
    deviceScaleFactor: 1,
    colorScheme: 'light',
    recordVideo: {dir: VIDEO_DIR, size: {width: 1440, height: 900}},
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  await page.goto('https://yugofarmia.com/en/prices', {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(4200);
  const productInput = page.locator('input[placeholder="Product"]').first();
  await moveClick(page, productInput, 500, 1200);
  const video = page.video();
  await context.close();
  if (video) {
    await video.saveAs(path.join(OUT, 'real-homepage-and-product-click.webm'));
  }
};

const captureElement = async (locator, filename) => {
  const target = locator.first();
  if (!(await target.count())) return false;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  if (!(await target.isVisible().catch(() => false))) return false;
  await target.screenshot({path: path.join(OUT, filename)});
  return true;
};

const captureProductRows = async (page) => {
  const names = ['Potatoes', 'Carrots', 'Beetroot', 'Tomatoes', 'Cucumbers', 'Raw cow milk'];
  for (const name of names) {
    const exact = page.getByRole('button', {name, exact: true});
    const fallback = page.locator('button').filter({hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')});
    const ok = await captureElement((await exact.count()) ? exact : fallback, `product-row-${safe(name)}.png`);
    if (!ok) {
      await fs.writeFile(path.join(OUT, `missing-product-row-${safe(name)}.txt`), `Could not capture ${name}`);
    }
  }
};

const findVisibleControl = async (page, regex) => {
  const controls = page.locator('button, input, select, [role="button"], [role="combobox"]');
  const count = await controls.count();
  for (let i = 0; i < count; i++) {
    const locator = controls.nth(i);
    if (!(await locator.isVisible().catch(() => false))) continue;
    const label = [
      await locator.innerText().catch(() => ''),
      await locator.getAttribute('aria-label'),
      await locator.getAttribute('placeholder'),
      await locator.getAttribute('title'),
      await locator.inputValue().catch(() => ''),
    ].filter(Boolean).join(' ').trim();
    if (regex.test(label)) return locator;
  }
  return null;
};

const tryOpenAndCapture = async (page, regex, openName, optionNames = []) => {
  const control = await findVisibleControl(page, regex);
  if (!control) {
    await fs.writeFile(path.join(OUT, `missing-${openName}.txt`), `No visible control matching ${regex}`);
    return false;
  }
  await moveClick(page, control, 250, 600);
  await screenshot(page, openName);
  await dumpState(page, openName);
  for (const optionName of optionNames) {
    const byRole = page.getByRole('button', {name: new RegExp(`^${optionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')});
    const roleOption = page.getByRole('option', {name: new RegExp(optionName, 'i')});
    const locator = (await byRole.count()) ? byRole : roleOption;
    await captureElement(locator, `${openName}-row-${safe(optionName)}.png`).catch(() => false);
  }
  return true;
};

await recordHomepage();

const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
page.setDefaultTimeout(45000);

try {
  await page.goto('https://yugofarmia.com/en/prices', {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(3200);
  await screenshot(page, '01-real-homepage');
  await dumpState(page, '01-real-homepage');

  const productInput = page.locator('input[placeholder="Product"]').first();
  await moveClick(page, productInput, 250, 700);
  await screenshot(page, '02-real-product-dropdown');
  await dumpState(page, '02-real-product-dropdown');
  await captureProductRows(page);

  const cucumber = page.getByRole('button', {name: 'Cucumbers', exact: true});
  await moveClick(page, cucumber, 250, 900);
  await screenshot(page, '03-real-product-selected');
  await dumpState(page, '03-real-product-selected');

  const countryInput = page.locator('input[placeholder="Country"]').first();
  await moveClick(page, countryInput, 250, 600);
  await screenshot(page, '04-real-country-dropdown');
  await dumpState(page, '04-real-country-dropdown');
  for (const country of ['Croatia', 'Serbia', 'Slovenia']) {
    const exact = page.getByRole('button', {name: new RegExp(`^${country}$`, 'i')});
    await captureElement(exact, `country-row-${safe(country)}.png`).catch(() => false);
  }

  const serbia = page.getByRole('button', {name: /Serbia/i, exact: true});
  await moveClick(page, serbia, 200, 700);
  await screenshot(page, '05-real-country-selected');
  await dumpState(page, '05-real-country-selected');

  const periodInput = page.locator('input[placeholder="Select period"]').first();
  await moveClick(page, periodInput, 250, 600);
  await screenshot(page, '06-real-period-dropdown');
  await dumpState(page, '06-real-period-dropdown');
  const latest = page.getByRole('button', {name: /Latest available/i});
  await captureElement(latest, 'period-row-latest-available.png').catch(() => false);
  const periodButtons = page.locator('button:visible');
  const periodButtonCount = await periodButtons.count();
  for (let i = 0; i < Math.min(periodButtonCount, 35); i++) {
    const btn = periodButtons.nth(i);
    const text = (await btn.innerText().catch(() => '')).trim();
    if (/latest|2026|2025|2024|period|range|year|month/i.test(text)) {
      await captureElement(btn, `period-option-${String(i).padStart(2, '0')}-${safe(text.slice(0, 42))}.png`).catch(() => false);
    }
  }

  if (await latest.count()) {
    await moveClick(page, latest, 180, 700);
  } else {
    const latestFallback = page.locator('button').filter({hasText: /Latest/i}).first();
    await moveClick(page, latestFallback, 180, 700);
  }
  await screenshot(page, '07-real-period-selected');
  await dumpState(page, '07-real-period-selected');

  const showResults = page.getByRole('button', {name: /Show results/i});
  await moveClick(page, showResults, 300, 1000);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await sleep(3200);
  await screenshot(page, '08-real-results');
  await screenshot(page, '08-real-results-full', true);
  await dumpState(page, '08-real-results');

  const filterOpened = await tryOpenAndCapture(page, /filter/i, '09-real-filters-open');
  if (!filterOpened) {
    const textFilters = page.getByText(/Filters/i, {exact: true}).first();
    if (await textFilters.count() && await textFilters.isVisible().catch(() => false)) {
      await moveClick(page, textFilters, 200, 600);
      await screenshot(page, '09-real-filters-open');
      await dumpState(page, '09-real-filters-open');
    }
  }

  await tryOpenAndCapture(page, /currency|original currency|display currency/i, '10-real-currency-open', ['Original', 'EUR', 'RSD']);
  const eurOption = page.getByRole('button', {name: /^EUR$/i}).or(page.getByRole('option', {name: /^EUR$/i}));
  if (await eurOption.count() && await eurOption.first().isVisible().catch(() => false)) {
    await moveClick(page, eurOption.first(), 160, 650);
    await screenshot(page, '11-real-currency-selected');
    await dumpState(page, '11-real-currency-selected');
  }

  await tryOpenAndCapture(page, /unit|original unit|display unit/i, '12-real-unit-open', ['Original', '1 kg', '100 kg']);
  const unitOption = page.getByRole('button', {name: /100 kg|1 kg/i}).or(page.getByRole('option', {name: /100 kg|1 kg/i}));
  if (await unitOption.count() && await unitOption.first().isVisible().catch(() => false)) {
    await moveClick(page, unitOption.first(), 160, 650);
    await screenshot(page, '13-real-unit-selected');
    await dumpState(page, '13-real-unit-selected');
  }

  const sourcesLink = page.getByRole('link', {name: /Sources\s*&\s*Currency|Sources/i}).first();
  if (await sourcesLink.count()) {
    await moveClick(page, sourcesLink, 250, 900);
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await sleep(2200);
  } else {
    await page.goto('https://yugofarmia.com/en/sources', {waitUntil: 'domcontentloaded', timeout: 60000}).catch(() => {});
    await sleep(2200);
  }
  await screenshot(page, '14-real-sources');
  await screenshot(page, '14-real-sources-full', true);
  await dumpState(page, '14-real-sources');
} catch (error) {
  await fs.writeFile(path.join(OUT, 'capture-error.txt'), `${error.stack || error}`);
  await screenshot(page, 'capture-error').catch(() => {});
  await dumpState(page, 'capture-error-state').catch(() => {});
} finally {
  await context.close();
  await browser.close();
}
