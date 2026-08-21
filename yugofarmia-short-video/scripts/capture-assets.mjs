import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const output = path.resolve('public/live');
await fs.mkdir(output, {recursive: true});

const products = [
  ['product-potato.png', 'https://pub-eb14fd08703241aa925aee68f39c35c7.r2.dev/product-potato.png'],
  ['product-tomato.png', 'https://pub-eb14fd08703241aa925aee68f39c35c7.r2.dev/product-tomato.png'],
  ['product-cucumber.png', 'https://pub-eb14fd08703241aa925aee68f39c35c7.r2.dev/product-cucumber.png'],
  ['product-raw-cow-milk.png', 'https://pub-eb14fd08703241aa925aee68f39c35c7.r2.dev/product-raw-cow-milk.png'],
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

await page.goto('https://yugofarmia.com/en/prices', {waitUntil: 'domcontentloaded', timeout: 60000});
await page.waitForTimeout(2600);
await page.screenshot({path: path.join(output, 'homepage.png'), fullPage: false});

const logo = page.locator('[data-brand-logo="canonical"] img, img[alt="Yuga Farma"]').first();
await logo.waitFor({state: 'visible'});
const rawLogo = await logo.getAttribute('src');
await saveRemote(new URL(rawLogo, page.url()).href, 'yugofarmia-logo.png');

for (const [target, url] of products) {
  await saveRemote(url, target);
}

await context.close();
await browser.close();
