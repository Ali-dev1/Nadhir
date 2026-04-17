import { test, expect, Page } from '@playwright/test'
import { TEST_CONFIG } from './test.config'

test.describe('Admin Panel — Access & Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    // Hide WhatsApp FAB
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `a[aria-label="Chat on WhatsApp"] { display: none !important; }`;
      document.head.appendChild(style);
    });
    
    if (TEST_CONFIG.adminPassword === 'CHANGE_ME') {
      test.skip(true, 'Admin password not configured in test.config.ts');
    }
  });

  async function loginAsAdmin(page: Page) {
    await page.goto('/admin/login')
    await page.waitForSelector('[data-testid="admin-login-form"]')
    await page.fill('input[type="email"]', TEST_CONFIG.adminEmail)
    await page.fill('input[type="password"]', TEST_CONFIG.adminPassword)
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 20000 })
  }

  test('A-01 Admin can login and see core stats', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    
    // Verify specific dashboard content
    await expect(page.locator('text=Command Center')).toBeVisible()
    await expect(page.locator('text=Total Revenue')).toBeVisible()
    await expect(page.locator('text=Active Orders')).toBeVisible()
  })

  test('A-02 Unauthorized access redirects to login', async ({ page }) => {
    await page.goto('/admin/inventory')
    await page.waitForURL(/\/admin\/login/)
    await expect(page.locator('[data-testid="admin-login-form"]')).toBeVisible()
  })

})

test.describe('Admin Panel — Inventory Management', () => {

  test.beforeEach(async ({ page }) => {
    if (TEST_CONFIG.adminPassword === 'CHANGE_ME') test.skip();
    // Re-use session or login
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', TEST_CONFIG.adminEmail)
    await page.fill('input[type="password"]', TEST_CONFIG.adminPassword)
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="admin-dashboard"]')
  });

  test('A-03 Inventory list loads products from DB', async ({ page }) => {
    await page.goto('/admin/inventory')
    await page.waitForSelector('[data-testid="inventory-list"]')
    
    // Should have rows
    const rows = page.locator('tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(1) // Header + at least one row
  })

  test('A-04 Product creation modal opens', async ({ page }) => {
    await page.goto('/admin/inventory')
    await page.waitForSelector('button:has-text("Add Product")')
    await page.click('button:has-text("Add Product")')
    
    await expect(page.locator('text=Curate New Piece')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
  })

})

test.describe('Admin Panel — Order Management', () => {

  test.beforeEach(async ({ page }) => {
    if (TEST_CONFIG.adminPassword === 'CHANGE_ME') test.skip();
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', TEST_CONFIG.adminEmail)
    await page.fill('input[type="password"]', TEST_CONFIG.adminPassword)
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="admin-dashboard"]')
  });

  test('A-05 Orders table shows pending orders', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForSelector('[data-testid="orders-table"]')
    
    // Check for status tabs
    await expect(page.locator('button:has-text("Pending")')).toBeVisible()
    await expect(page.locator('button:has-text("Processing")')).toBeVisible()
  })

  test('A-06 Order detail modal opens on row click', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForSelector('[data-testid="orders-table"]')
    
    // Click first order row if exists
    const rows = page.locator('tr').nth(1) // first row after header
    if (await rows.isVisible()) {
      await rows.click()
      await expect(page.locator('text=Order Details')).toBeVisible()
      await expect(page.locator('text=Customer Info')).toBeVisible()
    }
  })

})
