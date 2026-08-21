import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const OUT = path.resolve('yugofarmia-real-ui-v4/out-v2');
const resultsState = JSON.parse(await fs.readFile(path.join(OUT, '08-results.json'), 'utf8'));

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
page.setDefaultTimeout(45000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const snap = (name, fullPage = false) => page.screenshot({path: path.join(OUT, `${name}.png`), fullPage});
const captureElement = async (locator, name) => {
  const target = locator.first();
  if (!(await target.count())) return false;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  if (!(await target.isVisible().catch(() => false))) return false;
  await target.screenshot({path: path.join(OUT, `${name}.png`)});
  return true;
};
const dump = async (name) => {
  const state = await page.evaluate(() => ({
    url: location.href,
    bodyText: document.body.innerText,
    controls: [...document.querySelectorAll('button, input, select, a, [role="option"], [role="combobox"]')].map((el, index) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        index,
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: (el.innerText || el.getAttribute('aria-label') || '').trim(),
        value: 'value' in el ? el.value : null,
        ariaLabel: el.getAttribute('aria-label'),
        visible: r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden',
        rect: {x: r.x, y: r.y, width: r.width, height: r.height},
        html: el.outerHTML.slice(0, 1800),
      };
    }),
  }));
  await fs.writeFile(path.join(OUT, `${name}.json`), JSON.stringify(state, null, 2));
};

try {
  await page.goto(resultsState.url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await sleep(3600);
  await snap('08b-results-controls-ready');

  const currency = page.getByRole('combobox', {name: /Currency:/i}).first();
  await currency.click();
  await sleep(500);
  await snap('10-currency-open');
  await dump('10-currency-open');
  await captureElement(page.getByRole('option', {name: /Currency: € EUR/i}), 'currency-row-eur');
  await captureElement(page.getByRole('option', {name: /Original currency: RSD/i}), 'currency-row-original-rsd');
  await captureElement(page.getByRole('option', {name: /Currency: KM BAM/i}), 'currency-row-bam');

  const eur = page.getByRole('option', {name: /Currency: € EUR/i}).first();
  await eur.click();
  await sleep(1600);
  await snap('11-currency-selected-eur');
  await dump('11-currency-selected-eur');

  const unit = page.getByRole('combobox', {name: /Unit:/i}).first();
  await unit.click();
  await sleep(500);
  await snap('12-unit-open');
  await dump('12-unit-open');
  await captureElement(page.getByRole('option', {name: '100 kg', exact: true}), 'unit-row-100-kg');
  await captureElement(page.getByRole('option', {name: 'kg', exact: true}), 'unit-row-kg');
  await captureElement(page.getByRole('option', {name: 'tonne', exact: true}), 'unit-row-tonne');

  const hundred = page.getByRole('option', {name: '100 kg', exact: true}).first();
  await hundred.click();
  await sleep(1600);
  await snap('13-unit-selected-100kg');
  await dump('13-unit-selected-100kg');
} catch (error) {
  await fs.writeFile(path.join(OUT, 'controls-capture-error.txt'), String(error?.stack || error));
  await snap('controls-capture-error').catch(() => {});
  await dump('controls-capture-error-state').catch(() => {});
} finally {
  await context.close();
  await browser.close();
}
