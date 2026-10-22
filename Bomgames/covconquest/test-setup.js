const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('C:' + m.text()); });
  page.on('requestfailed', r => errors.push('404? ' + r.url().split('/').pop()));

  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shot-setup.png', fullPage: true });
  console.log('setup screenshot captured');

  // tooltip test
  await page.click('.faction-choice.lamanite');
  await page.click('#startBtn');
  await page.waitForTimeout(700);
  const hc = page.locator('.handcard').first();
  await hc.hover();
  await page.waitForTimeout(400);
  console.log('tooltip visible:', await page.isVisible('#tip'));
  console.log('tooltip text:', (await page.textContent('#tip')).slice(0, 90).replace(/\s+/g, ' '));
  await page.screenshot({ path: 'shot-tip.png' });

  console.log('errors:', errors.length ? errors : 'NONE');
  await browser.close();
})();