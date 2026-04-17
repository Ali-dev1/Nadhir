import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Hide WhatsApp FAB that often blocks clicks in tests
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `a[aria-label="Chat on WhatsApp"] { display: none !important; }`;
      document.head.appendChild(style);
    });
  });

  // Helper to add item and go to checkout
  async function goToCheckout(page) {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="add-to-cart-btn"]')
    await page.click('[data-testid="add-to-cart-btn"]')
    await page.waitForSelector('[data-testid="cart-sidebar"]')
    
    // Aggressively remove WhatsApp FAB
    await page.evaluate(() => {
      const fab = document.querySelector('a[aria-label="Chat on WhatsApp"]');
      if (fab) fab.remove();
    });

    await page.click('[data-testid="checkout-btn"]')
    await page.waitForSelector('[data-testid="checkout-form"]', 
      { timeout: 15000 })
  }

  test('C-01 Checkout form validation — empty submit', async ({ page }) => {
    await goToCheckout(page)
    await page.click('[data-testid="place-order-btn"]')
    // At least one validation error must appear
    const errors = page.locator('[data-testid="form-error"]')
    await expect(errors.first()).toBeVisible()
  })

  test('C-02 Phone validation — invalid format rejected', async ({ page }) => {
    await goToCheckout(page)
    await page.fill('[data-testid="checkout-name"]', 'Test Customer')
    await page.fill('[data-testid="checkout-phone"]', '12345')
    await page.fill('[data-testid="checkout-address"]', 'Westlands, Nairobi')
    await page.click('[data-testid="place-order-btn"]')
    const phoneError = page.locator('[data-testid="phone-error"]')
    await expect(phoneError).toBeVisible()
    const errorText = await phoneError.textContent()
    expect(errorText).toMatch(/valid|phone|format/i)
  })

  test('C-03 Phone validation — Kenyan format accepted', async ({ page }) => {
    await goToCheckout(page)
    await page.fill('[data-testid="checkout-name"]', 'Test Customer')
    await page.fill('[data-testid="checkout-phone"]', '0708374149')
    await page.fill('[data-testid="checkout-address"]', 'Westlands, Nairobi')
    // Submit to trigger validation
    await page.click('[data-testid="place-order-btn"]')
    // Phone error should not appear
    const phoneError = page.locator('[data-testid="phone-error"]')
    await expect(phoneError).not.toBeVisible()
  })

  test('C-04 Successful form submission opens M-PESA review', async ({ page }) => {
    await goToCheckout(page)
    await page.fill('[data-testid="checkout-name"]', 'Test Customer')
    await page.fill('[data-testid="checkout-phone"]', '0708374149')
    await page.fill('[data-testid="checkout-address"]', 'Westlands, Nairobi')
    
    // If STK is enabled, modal should show. If disabled, it should redirect to confirmation or show success.
    // Given the environment setting VITE_ENABLE_STK_PUSH=false, we check for a success state or the manual payment info.
    const stkEnabled = await page.evaluate(() => (window as any).importMetaEnv?.VITE_ENABLE_STK_PUSH === 'true');
    
    if (stkEnabled) {
      await page.waitForSelector('[data-testid="mpesa-review-modal"]', { timeout: 15000 })
      await expect(page.locator('[data-testid="mpesa-review-modal"]')).toBeVisible()
    } else {
      // For manual flow, expect redirect or confirm header
      await page.waitForURL(/order-confirmation/, { timeout: 15000 })
      await expect(page.locator('h1')).toContainText(/placed|confirmed/i)
    }
  })

  test('C-05 Order summary shows correct item and total', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    const name = await firstProduct.locator('h3').textContent()
    
    await firstProduct.click()
    await page.waitForSelector('[data-testid="add-to-cart-btn"]')
    await page.click('[data-testid="add-to-cart-btn"]')
    await page.waitForSelector('[data-testid="cart-sidebar"]')
    
    // Aggressively remove WhatsApp FAB
    await page.evaluate(() => {
      const fab = document.querySelector('a[aria-label="Chat on WhatsApp"]');
      if (fab) fab.remove();
    });

    await page.click('[data-testid="checkout-btn"]')
    
    await page.waitForSelector('[data-testid="checkout-summary"]')
    const summaryText = await page.locator('[data-testid="checkout-summary"]').textContent()
    expect(summaryText).toContain(name?.trim())
  })

})
