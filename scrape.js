import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import safeNavigate from './controllers/helpers/coles/safeNavigate.js';
import waitForElement from './controllers/helpers/coles/waitForElement.js';
import handleSteps from './controllers/helpers/coles/steps.js';
import mongoose from 'mongoose';
import path from 'path';

puppeteer.use(StealthPlugin());

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1/monmonmon');
    console.log('database connected');
    return conn;
  } catch (error) {
    console.log('database error');
  }
};

const ProductSchema = new mongoose.Schema(
  {
    source_url: { type: String, required: true, default: 'N/A' },
    name: { type: String, required: true, default: 'N/A' },
    image_url: { type: String, required: true, default: 'N/A' },
    barcode: { type: String, required: true, default: 'N/A' },
    shop: { type: String, required: true, default: 'coles' },
    weight: { type: String, required: true, default: 'N/A' },
    price: { type: String, required: true, default: 'N/A' },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product2', ProductSchema);
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
const firstWord = 'sampleLocation'.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

const scraper = async () => {
  await dbConnect();
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    const url = 'https://www.coles.com.au/browse/health-beauty';
    console.log(`Navigating to ${url}...`);

    await safeNavigate(page, url);

    console.log('Page loaded successfully.');
    await page.waitForSelector('body', { timeout: 60000 });
    await delay(5000);
    const a = await handleSteps(page);

    let hasProducts = true;
    let i = 1;
    while (hasProducts) {
      if (i !== 1) {
        const url2 = `https://www.coles.com.au/browse/health-beauty?page=${i}`;
        await page.goto(url2, { waitUntil: 'domcontentloaded' });
      }
      try {
        await page.waitForSelector('section[data-testid="product-tile"]', { timeout: 10000 });
      } catch (error) {
        hasProducts = false;
        break;
      }
      console.log('Products found, extracting data...');

      // Extract product data
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

      // Save data to MongoDB in bulk
      if (productData.length > 0) await Product.insertMany(productData);
      // Simulate pagination or other actions
      i = i + 1;
      console.log('Simulating pagination...');
    }
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
