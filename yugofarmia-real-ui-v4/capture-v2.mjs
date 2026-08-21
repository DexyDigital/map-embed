import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const OUT = path.resolve('yugofarmia-real-ui-v4/out-v2');
const VIDEO_DIR = path.join(OUT, 'video-tmp');
await fs.mkdir(OUT, {recursive: true});
await fs.mkdir(VIDEO_DIR, {recursive: true});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const browser = await chromium.launch({headless: true});

const snap = async (page, name, fullPage = false) => {
  await page.screenshot({path: path.join(OUT, `${name}.png`), fullPage});
};

const dump = async (page, name) => {
  const state = await page.evaluate(() => {
    const pack = (el, index) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        index,
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim(),
        value: 'value' in el ? el.value : null,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        href: el instanceof HTMLAnchorElement ? el.href : null,
        visible: r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden',
        rect: {x: r.x, y: r.y, width: r.width, height: r.height},
        html: el.outerHTML.slice(0, 2400),
      };
    };
    return {
      title: document.title,
      url: location.href,
      bodyText: document.body.innerText,
      controls: [...document.querySelectorAll('button, input, select, a, [role="button"], [role="option"], [role="combobox"]')].map(pack),
      labels: [...document.querySelectorAll('label')].map(pack),
      dataUi: [...document.querySelectorAll('[data-ui]')].map(pack),
    };
  });
  await fs.writeFile(path.join(OUT, `${name}.json`), JSON.stringify(state, null, 2));
  await fs.writeFile(path.join(OUT, `${name}.html`), await page.content());
};

const captureElement = async (locator, name) => {
  const target = locator.first();
  if (!(await target.count())) return false;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  if (!(await target.isVisible().catch(() => false))) return false;
  await target.screenshot({path: path.join(OUT, `${name}.png`)});
  return true;
};

const pointerClick = async (page, locator, after = 650) => {
  const target = locator.first();
  await target.waitFor({state: 'visible'});
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (!box) throw new Error('Click target has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {steps: 26});
  await sleep(250);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
  await sleep(after);
};

const recordHome = async () => {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 900},
    deviceScaleFactor: 1,
    colorScheme: 'light',
    recordVideo: {dir: VIDEO_DIR, size: {width: 1440, height: 900}},
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  await page.goto('https://yugofarmia.com/en/prices', {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(4400);
  await pointerClick(page, page.locator('input[placeholder="Product"]'), 1100);
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(path.join(OUT, 'real-homepage-product-click.webm'));
};

await recordHome();

const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
page.setDefaultTimeout(45000);

const captureOptionRows = async (names, prefix) => {
  for (const name of names) {
    const option = page.locator('button[role="option"]').filter({hasText: new RegExp(name, 'i')}).first();
    await captureElement(option, `${prefix}-${slug(name)}`).catch(() => false);
  }
};

const softClick = async (locator, after = 550) => {
  try {
    if (!(await locator.count())) return false;
    if (!(await locator.first().isVisible().catch(() => false))) return false;
    await pointerClick(page, locator.first(), after);
    return true;
  } catch {
    return false;
  }
};

try {
  await page.goto('https://yugofarmia.com/en/prices', {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(3200);
  await snap(page, '01-homepage');
  await dump(page, '01-homepage');

  const productInput = page.locator('input[placeholder="Product"]').first();
  await pointerClick(page, productInput, 650);
  await snap(page, '02-product-dropdown');
  await dump(page, '02-product-dropdown');
  await captureOptionRows(['Potatoes', 'Carrots', 'Beetroot', 'Tomatoes', 'Cucumbers', 'Raw cow milk'], 'product-row');

  await productInput.fill('Cucumbers');
  await sleep(350);
  const cucumber = page.locator('button[role="option"]').filter({hasText: /^Cucumbers$/i}).first();
  await cucumber.click({force: true});
  await sleep(750);
  await snap(page, '03-product-selected');
  await dump(page, '03-product-selected');

  const countryInput = page.locator('input[placeholder="Country"]').first();
  await pointerClick(page, countryInput, 550);
  await snap(page, '04-country-dropdown');
  await dump(page, '04-country-dropdown');
  await captureOptionRows(['Croatia', 'Serbia', 'Slovenia'], 'country-row');

  const serbia = page.locator('button[role="option"]').filter({hasText: /Serbia/i}).first();
  await serbia.click({force: true});
  await sleep(650);
  await snap(page, '05-country-selected');
  await dump(page, '05-country-selected');

  const periodInput = page.locator('input[placeholder="Select period"]').first();
  await pointerClick(page, periodInput, 550);
  await snap(page, '06-period-dropdown');
  await dump(page, '06-period-dropdown');

  const periodLabels = page.locator('label').filter({has: page.locator('input[type="radio"]')});
  for (let i = 0; i < await periodLabels.count(); i++) {
    const label = periodLabels.nth(i);
    const text = (await label.innerText().catch(() => '')).trim();
    if (text) await captureElement(label, `period-row-${String(i + 1).padStart(2, '0')}-${slug(text)}`).catch(() => false);
  }

  const latest = page.locator('input[type="radio"][value="latest_available"]').first();
  await latest.check({force: true});
  await sleep(650);
  await snap(page, '07-period-selected');
  await dump(page, '07-period-selected');

  const showResults = page.getByRole('button', {name: /Show results/i}).first();
  await pointerClick(page, showResults, 1100);
  await sleep(3200);
  await snap(page, '08-results');
  await snap(page, '08-results-full', true);
  await dump(page, '08-results');

  const candidates = page.locator('button, select, input, label, [role="button"], [role="combobox"]');
  for (let i = 0; i < await candidates.count(); i++) {
    const el = candidates.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    const text = [
      await el.innerText().catch(() => ''),
      await el.getAttribute('aria-label'),
      await el.getAttribute('placeholder'),
      await el.inputValue().catch(() => ''),
    ].filter(Boolean).join(' ').trim();
    if (/filter|currency|unit|display|original|per\s*(kg|100)|eur|rsd/i.test(text)) {
      await captureElement(el, `results-control-${String(i).padStart(3, '0')}-${slug(text || 'control')}`).catch(() => false);
    }
  }

  const filterButton = page.getByRole('button', {name: /Filters?/i}).first();
  const filterText = page.getByText(/^Filters?$/i).first();
  if (await softClick(filterButton) || await softClick(filterText)) {
    await snap(page, '09-filters-open');
    await dump(page, '09-filters-open');
  } else {
    await fs.writeFile(path.join(OUT, '09-filter-control-not-found.txt'), 'No visible Filters control was found.');
  }

  const currencyControl = page.locator('button, [role="combobox"], select, input').filter({hasText: /Currency|Original currency|Display currency/i}).first();
  const currencyLabel = page.getByText(/Currency/i).first();
  if (await softClick(currencyControl) || await softClick(currencyLabel)) {
    await snap(page, '10-currency-open');
    await dump(page, '10-currency-open');
  }

  const eur = page.locator('button[role="option"], [role="option"], label, button').filter({hasText: /^EUR$|Euro/i}).first();
  if (await softClick(eur)) {
    await snap(page, '11-currency-selected');
    await dump(page, '11-currency-selected');
  }

  const unitControl = page.locator('button, [role="combobox"], select, input').filter({hasText: /Unit|Original unit|Display unit/i}).first();
  const unitLabel = page.getByText(/Unit/i).first();
  if (await softClick(unitControl) || await softClick(unitLabel)) {
    await snap(page, '12-unit-open');
    await dump(page, '12-unit-open');
  }

  const unitOption = page.locator('button[role="option"], [role="option"], label, button').filter({hasText: /100\s*kg|1\s*kg/i}).first();
  if (await softClick(unitOption)) {
    await snap(page, '13-unit-selected');
    await dump(page, '13-unit-selected');
  }

  await page.goto('https://yugofarmia.com/en/sources', {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(2600);
  await snap(page, '14-sources');
  await snap(page, '14-sources-full', true);
  await dump(page, '14-sources');
} catch (error) {
  await fs.writeFile(path.join(OUT, 'capture-error.txt'), String(error?.stack || error));
  await snap(page, 'capture-error').catch(() => {});
  await dump(page, 'capture-error-state').catch(() => {});
} finally {
  await context.close();
  await browser.close();
}
