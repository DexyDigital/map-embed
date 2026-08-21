import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const out = path.resolve('yugofarmia-short/out');
await fs.mkdir(out, {recursive: true});

const products = [
  {slug: 'potatoes', label: 'Potatoes'},
  {slug: 'tomatoes', label: 'Tomatoes'},
  {slug: 'cucumbers', label: 'Cucumbers'},
  {slug: 'raw-cow-milk', label: 'Raw cow milk'},
];

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1, colorScheme: 'light'});
const page = await context.newPage();
page.setDefaultTimeout(15000);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value = '') => value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
const safeName = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const goto = async (targetPage, url) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await targetPage.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
      await delay(2400);
      return;
    } catch (error) {
      lastError = error;
      await delay(attempt * 1200);
    }
  }
  throw lastError;
};

const saveRemote = async (url, destination) => {
  const response = await context.request.get(url, {timeout: 60000});
  if (!response.ok()) throw new Error(`Unable to fetch ${url}: ${response.status()}`);
  await fs.writeFile(destination, await response.body());
};

const parseCoverage = (text, href) => {
  const lines = text.split('\n').map(clean).filter(Boolean);
  const countries = ['Croatia', 'Serbia', 'Slovenia'];
  const country = countries.find((candidate) => lines.includes(candidate)) ?? 'Country';
  const observations = lines.find((line) => /\bobservations?\b/i.test(line)) ?? '';
  const dateLines = lines.filter((line) => /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/i.test(line));
  const source = lines.find((line) =>
    line !== country && line !== observations && !dateLines.includes(line) &&
    !/^(Explore prices|Latest median|→)$/i.test(line) &&
    !/^(EUR|RSD|HRK|SIT)\s/i.test(line) &&
    !/^🇭🇷|^🇷🇸|^🇸🇮/.test(line)
  ) ?? '';
  const latestIndex = lines.findIndex((line) => /^Latest median$/i.test(line));
  const latestMedian = latestIndex >= 0 ? (lines[latestIndex + 1] ?? '') : '';
  return {country, observations, source, periodStart: dateLines[0] ?? '', periodEnd: dateLines[1] ?? dateLines[0] ?? '', latestMedian, href, rawText: text};
};

const extractPriceStrings = (text) => {
  const normalized = text.replace(/\u00a0/g, ' ');
  const matches = normalized.match(/\b(?:EUR|RSD|HRK|SIT)\s*[0-9][0-9.,]*\s*\/\s*(?:1\s*)?(?:kg|l|L|piece|pieces|100 kg)\b/g) ?? [];
  return [...new Set(matches.map(clean))];
};

const report = {capturedAt: new Date().toISOString(), site: 'https://yugofarmia.com', homepage: {}, products: [], sources: {}};

try {
  await goto(page, 'https://yugofarmia.com/en/prices');
  await page.screenshot({path: path.join(out, 'homepage.png'), fullPage: false});
  report.homepage.title = await page.title();
  report.homepage.bodyText = await page.locator('body').innerText();
  const logo = page.locator('[data-brand-logo="canonical"] img, img[alt="Yuga Farma"]').first();
  await logo.waitFor({state: 'visible'});
  const rawLogoSrc = await logo.getAttribute('src');
  const logoSrc = new URL(rawLogoSrc, page.url()).href;
  report.homepage.logoSrc = logoSrc;
  await saveRemote(logoSrc, path.join(out, 'yugofarmia-logo.png'));
  await logo.screenshot({path: path.join(out, 'yugofarmia-logo-element.png'), omitBackground: true});

  for (const product of products) {
    await goto(page, `https://yugofarmia.com/en/products/${product.slug}`);
    const bodyText = await page.locator('body').innerText();
    await page.screenshot({path: path.join(out, `product-${product.slug}.png`), fullPage: false});
    const images = await page.locator('img').evaluateAll((elements) => elements.map((element) => ({src: element.currentSrc || element.src, alt: element.alt || '', width: element.naturalWidth, height: element.naturalHeight})));
    const productImage = images.find((image) => /r2\.dev\/products\/products\//i.test(image.src)) ?? images.find((image) => image.alt.toLowerCase().includes(product.label.toLowerCase().split(' ')[0]));
    if (productImage?.src) {
      const extension = new URL(productImage.src).pathname.split('.').pop()?.toLowerCase() || 'jpg';
      await saveRemote(productImage.src, path.join(out, `asset-${product.slug}.${extension}`));
    }
    const coverageLinks = await page.locator('a[href*="/en/prices?product="]').evaluateAll((elements) => elements.map((element) => ({text: element.innerText, href: element.href})));
    const coverage = coverageLinks.map((entry) => parseCoverage(entry.text, entry.href));
    const resultPages = [];
    for (const item of coverage.slice(0, 3)) {
      const resultPage = await context.newPage();
      resultPage.setDefaultTimeout(15000);
      try {
        await goto(resultPage, item.href);
        const resultText = await resultPage.locator('body').innerText();
        const key = `${product.slug}-${safeName(item.country)}`;
        await resultPage.screenshot({path: path.join(out, `price-${key}.png`), fullPage: false});
        resultPages.push({country: item.country, source: item.source, href: item.href, prices: extractPriceStrings(resultText), bodyText: resultText});
      } catch (error) {
        resultPages.push({country: item.country, source: item.source, href: item.href, error: String(error)});
      } finally {
        await resultPage.close();
      }
    }
    report.products.push({...product, title: await page.title(), url: page.url(), bodyText, image: productImage ?? null, coverage, resultPages});
  }

  await goto(page, 'https://yugofarmia.com/en/sources');
  report.sources.title = await page.title();
  report.sources.url = page.url();
  report.sources.bodyText = await page.locator('body').innerText();
  await page.screenshot({path: path.join(out, 'sources.png'), fullPage: false});
} finally {
  await fs.writeFile(path.join(out, 'live-data.json'), JSON.stringify(report, null, 2));
  await context.close();
  await browser.close();
}
