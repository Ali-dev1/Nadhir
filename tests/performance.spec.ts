import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {

  test('TEST 16 — Page load time', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 30000 });
    const loadTime = Date.now() - startTime;

    // Page should be interactive within 5 seconds
    // (note: this includes network latency to vercel + supabase)
    console.log(`Page load time: ${loadTime}ms`);
    // We allow up to 10s for live site over network
    expect(loadTime).toBeLessThan(10000);
  });

});

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('TEST 17 — Mobile viewport layout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 30000 });

    // Nav should be visible
    await expect(page.locator('nav').first()).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // 1px tolerance

    // Products should be rendered
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });
});
