import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const output = path.resolve('public/live');
await fs.mkdir(output, {recursive: true});

const products = [
  {slug: 'potatoes', target: 'product-potato.png', label: 'Potatoes'},
  {slug: 'tomatoes', target: 'product-tomato.png', label: 'Tomatoes'},
  {slug: 'cucumbers', target: 'product-cucumber.png', label: 'Cucumbers'},
  {slug: 'raw-cow-milk', target: 'product-raw-cow-milk.png', label: 'Raw cow milk'},
];

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
page.setDefaultTimeout(30000);

const saveRemote = async (url, target) => {
  const response = await context.request.get(url, {timeout: 60000});
  if (!response.ok()) throw new Error(`Failed ${url}: ${response.status()}`);
  await fs.writeFile(path.join(output, target), await response.body());
};

const goto = async (url) => {
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForTimeout(2400);
};

await goto('https://yugofarmia.com/en/prices');
await page.screenshot({path: path.join(output, 'homepage.png'), fullPage: false});

const logo = page.locator('[data-brand-logo="canonical"] img, img[alt="Yuga Farma"]').first();
await logo.waitFor({state: 'visible'});
const rawLogo = await logo.getAttribute('src');
await saveRemote(new URL(rawLogo, page.url()).href, 'yugofarmia-logo.png');

for (const product of products) {
  await goto(`https://yugofarmia.com/en/products/${product.slug}`);

  const candidates = await page.locator('img').evaluateAll((elements) =>
    elements.map((element, index) => {
      const rect = element.getBoundingClientRect();
      return {
        index,
        alt: element.alt || '',
        src: element.currentSrc || element.src,
        area: Math.max(0, rect.width) * Math.max(0, rect.height),
        width: rect.width,
        height: rect.height,
        top: rect.top,
        visible: rect.width > 0 && rect.height > 0,
      };
    }),
  );

  const label = product.label.toLowerCase();
  const candidate = candidates
    .filter((item) => item.visible && item.top > 70 && item.area > 20000)
    .sort((a, b) => {
      const aMatch = a.alt.toLowerCase().includes(label) ? 1 : 0;
      const bMatch = b.alt.toLowerCase().includes(label) ? 1 : 0;
      return bMatch - aMatch || b.area - a.area;
    })[0];

  if (!candidate) {
    throw new Error(`No visible product image found for ${product.label}`);
  }

  const image = page.locator('img').nth(candidate.index);
  await image.scrollIntoViewIfNeeded();
  await image.screenshot({
    path: path.join(output, product.target),
    omitBackground: true,
  });
}

await context.close();
await browser.close();
