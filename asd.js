const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want headless mode
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.createBrowserContext();
  // Create a new page
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://coles.com.au'); // Navigate to a page

  // Wait for the page to load and any cookies to be set (you can adjust the wait time as needed)
//   await page.waitForTimeout(3000); // Wait for 3 seconds to ensure cookies are set (optional)

  // Get cookies after waiting for page load
  const cookies = await page.cookies();
  console.log('Cookies on the page:', cookies);

  // Optionally, delete cookies
  await page.deleteCookie(...cookies);

  // Verify that cookies are deleted
  const cookiesAfterDeletion = await page.cookies();
  console.log('Cookies after deletion:', cookiesAfterDeletion); // Should be an empty array

  // Close the browser
//   await browser.close();
})();
