const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://nabdh-almadina.vercel.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'D:\\temp\\opencode\\full-top.png' });
  // Scroll down a bit to capture the section below the hero
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\temp\\opencode\\below-hero.png' });
  await browser.close();
  console.log('done');
})();
