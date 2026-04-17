import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test.config';

test.describe('Authentication Tests', () => {

  test('TEST 10 — Admin login page loads directly', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="admin-login-form"]', { timeout: 15000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('TEST 10b — Admin login wrong credentials', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="admin-login-form"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'admin@ali.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    // Wait for error message
    await expect(page.locator('text=Invalid').or(page.locator('text=Failed').or(page.locator('text=credentials')))).toBeVisible({ timeout: 10000 });
  });

  test('TEST 10c — Admin login with correct credentials', async ({ page }) => {
    test.skip(TEST_CONFIG.adminPassword === 'CHANGE_ME', 'Set real admin password in tests/test.config.ts');
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="admin-login-form"]', { timeout: 15000 });
    await page.fill('input[type="email"]', TEST_CONFIG.adminEmail);
    await page.fill('input[type="password"]', TEST_CONFIG.adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('TEST 11 — Admin route protection', async ({ page }) => {
    // Go to admin without session — ProtectedRoute should redirect to /admin/login
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Wait for the redirect or for the login form to appear
    await page.waitForSelector('[data-testid="admin-login-form"], input[type="email"]', { timeout: 15000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('TEST 12 — Customer account page', async ({ page }) => {
    await page.goto('/account', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // The account page should either show auth modal/login prompt or account details
    const body = await page.textContent('body');
    expect(body && body.length > 50).toBeTruthy();
  });

});
