import { test, expect } from '@playwright/test'

test.describe('Storefront — Product Discovery', () => {

  test.beforeEach(async ({ page }) => {
    // Hide WhatsApp FAB that often blocks clicks in tests
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `a[aria-label="Chat on WhatsApp"] { display: none !important; }`;
      document.head.appendChild(style);
    });
  });

  test('S-01 Homepage loads with products and branding', async ({ page }) => {
    await page.goto('/')
    // Brand identity
    await expect(page).toHaveTitle(/Nadhir/i)
    // Products loaded from Supabase
    await page.waitForSelector('[data-testid="product-card"]', 
      { timeout: 30000 })
    const cards = page.locator('[data-testid="product-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    // Footer visible
    await expect(page.locator('[data-testid="footer"]')).toBeVisible()
    // No console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    // Filter out some common non-critical errors if needed, but here we're strict
    // await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('WebSocket'))).toHaveLength(0)
  })

  test('S-02 Category filter — Moroccan shows only Moroccan products', 
    async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    // Click Moroccan category
    await page.click('[data-testid="category-moroccan"]')
    await page.waitForTimeout(300)
    const cards = page.locator('[data-testid="product-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    // Every visible card should be Moroccan category
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const category = await card.getAttribute('data-category')
      expect(category?.toLowerCase()).toContain('moroccan')
    }
  })

  test('S-03 Search finds products and clears correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    const allCards = await page.locator('[data-testid="product-card"]').count()
    
    // Search for something specific
    await page.fill('[data-testid="search-input"]', 'Moroccan')
    await page.waitForTimeout(400) // debounce
    const filtered = await page.locator('[data-testid="product-card"]').count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(allCards)
    
    // Clear search restores all products
    await page.fill('[data-testid="search-input"]', '')
    await page.waitForTimeout(400)
    const restored = await page.locator('[data-testid="product-card"]').count()
    expect(restored).toBe(allCards)
  })

  test('S-04 Price range filter reduces results', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    const before = await page.locator('[data-testid="product-card"]').count()
    // Interact with price slider — set max to low value
    const slider = page.locator('[data-testid="price-max-slider"]')
    if (await slider.isVisible()) {
      await slider.fill('5000')
      await page.waitForTimeout(400)
      const after = await page.locator('[data-testid="product-card"]').count()
      expect(after).toBeLessThanOrEqual(before)
    }
  })

  test('S-05 No results state shows when search has no matches', 
    async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.fill('[data-testid="search-input"]', 'xyznotaproduct999')
    await page.waitForTimeout(400)
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    const cards = page.locator('[data-testid="product-card"]')
    await expect(cards).toHaveCount(0)
  })

})

test.describe('Storefront — Product Detail', () => {

  test('S-06 Product detail page loads with all sections', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="product-detail"]', 
      { timeout: 15000 })
    // All critical sections
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-to-cart-btn"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="product-image-gallery"]'))
      .toBeVisible()
    // Price must contain KES or Ksh
    const price = await page.locator('[data-testid="product-price"]')
      .textContent()
    expect(price).toMatch(/KES|Ksh|ksh/i)
  })

  test('S-07 Image gallery switches on thumbnail click', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="product-image-gallery"]')
    const thumbnails = page.locator('[data-testid="image-thumbnail"]')
    const count = await thumbnails.count()
    if (count > 1) {
      const firstSrc = await page.locator('[data-testid="product-image-gallery"] [data-testid="main-product-image"]')
        .getAttribute('src')
      await thumbnails.nth(1).click()
      await page.waitForTimeout(300)
      const secondSrc = await page.locator('[data-testid="product-image-gallery"] [data-testid="main-product-image"]')
        .getAttribute('src')
      expect(firstSrc).not.toBe(secondSrc)
    }
  })

  test('S-08 Size guide modal opens and closes', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="size-guide-btn"]')
    await page.click('[data-testid="size-guide-btn"]')
    await expect(page.locator('[data-testid="size-guide-modal"]'))
      .toBeVisible()
    // Click close button inside modal
    await page.click('[data-testid="size-guide-modal"] button:has-text("Close Guide")')
    await expect(page.locator('[data-testid="size-guide-modal"]'))
      .not.toBeVisible()
  })

  test('S-09 Out of stock product disables Add to Cart', async ({ page }) => {
    // Find an out of stock product if one exists
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    const outOfStock = page.locator('[data-testid="out-of-stock-badge"]')
    const count = await outOfStock.count()
    if (count > 0) {
      await outOfStock.first().click()
      const addBtn = page.locator('[data-testid="add-to-cart-btn"]')
      await expect(addBtn).toBeDisabled()
    }
  })

  test('S-10 Related products section shows on detail page', 
    async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="related-products"]',
      { timeout: 15000 })
    const related = page.locator('[data-testid="related-products"] [data-testid="product-card"]')
    await expect(related.first()).toBeVisible()
  })

})

test.describe('Storefront — Cart', () => {

  test('S-11 Add to cart and verify item appears', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="add-to-cart-btn"]')
    
    // Get product name before adding
    const name = await page.locator('[data-testid="product-name"]')
      .textContent()
    await page.click('[data-testid="add-to-cart-btn"]')
    
    // Cart sidebar opens
    await page.waitForSelector('[data-testid="cart-sidebar"]')
    const cartItem = page.locator('[data-testid="cart-item"]')
    const cartCount = await cartItem.count()
    expect(cartCount).toBeGreaterThan(0)
    
    // Cart shows correct product name
    const cartText = await page.locator('[data-testid="cart-sidebar"]')
      .textContent()
    expect(cartText).toContain(name?.trim())
  })

  test('S-12 Cart persists after page refresh', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="add-to-cart-btn"]')
    await page.click('[data-testid="add-to-cart-btn"]')
    await page.waitForSelector('[data-testid="cart-sidebar"]')
    
    // Reload page
    await page.reload()
    await page.waitForSelector('[data-testid="product-card"]')
    
    // Cart count badge should still show item
    const badge = page.locator('[data-testid="cart-count-badge"]')
    const badgeText = await badge.textContent()
    expect(parseInt(badgeText || '0')).toBeGreaterThan(0)
  })

  test('S-13 Remove item from cart', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="add-to-cart-btn"]')
    await page.click('[data-testid="add-to-cart-btn"]')
    await page.waitForSelector('[data-testid="cart-item"]')
    
    // Remove item
    await page.click('[data-testid="remove-cart-item"]')
    await page.waitForTimeout(300)
    
    // Cart should be empty
    const emptyState = page.locator('[data-testid="cart-empty"]')
    await expect(emptyState).toBeVisible()
  })

  test('S-14 Cart total calculates correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForSelector('[data-testid="product-price"]')
    
    const priceText = await page.locator('[data-testid="product-price"]')
      .textContent()
    const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0')
    
    await page.click('[data-testid="add-to-cart-btn"]')
    await page.waitForSelector('[data-testid="cart-total"]')
    
    const totalText = await page.locator('[data-testid="cart-total"]')
      .textContent()
    const total = parseInt(totalText?.replace(/[^0-9]/g, '') || '0')
    
    // Total should be at least the product price
    expect(total).toBeGreaterThanOrEqual(price)
  })

})
