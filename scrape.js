import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import safeNavigate from './controllers/helpers/coles/safeNavigate.js';
import waitForElement from './controllers/helpers/coles/waitForElement.js';
import handleSteps from './controllers/helpers/coles/steps.js';

puppeteer.use(StealthPlugin());

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const scraper = async () => {
  const firstWord = 'sampleLocation'.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = 'https://www.coles.com.au/browse/health-beauty';
    console.log(`Navigating to ${url}...`);

    // Retry navigation with a custom function
    await safeNavigate(page, url);

    console.log('Page loaded successfully.');
    await page.waitForSelector('body', { timeout: 60000 });
    await delay(5000);
    const a = await handleSteps(page);

    // Step 7: Scrape product data after location is set
    await page.waitForSelector('section[data-testid="product-tile"]', { timeout: 100000 });
    const productData = await page.evaluate(() => {
      const products = document.querySelectorAll('section[data-testid="product-tile"]');
      return Array.from(products).map((product) => {
        const href = product.querySelector('.product__image_area a')?.href || 'N/A';

        let weight = 'N/A';
        let barcode = 'N/A';
        if (href !== 'N/A') {
          const parts = href.split('-');
          weight = parts.length > 1 ? parts[parts.length - 2] : 'N/A';
          barcode = parts.length > 0 ? parts[parts.length - 1] : 'N/A';
        }

        return {
          source_url: href !== 'N/A' ? href : 'N/A',
          name: product.querySelector('.product__title')?.textContent.trim() || 'N/A',
          image_url: product.querySelector('img[data-testid="product-image"]')?.src || 'N/A',
          barcode: barcode,
          shop: 'coles',
          weight: weight,
          price: product.querySelector('.price__value')?.textContent.trim() || 'N/A',
        };
      });
    });

    const filePath = './product_data.json';
    fs.writeFileSync(filePath, JSON.stringify(productData, null, 4));
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
};

(async () => {
  await scraper();
})();
