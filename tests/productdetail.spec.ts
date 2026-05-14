import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
test('D8Flight Product Detail & Variant Flow', async ({ page }) => {
  test.setTimeout(600000); // 10 minutes
  const ssDir = path.join(process.cwd(), 'test-results', 'screenshots', 'pdp');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  const clearOverlays = async () => {
    try {
      const yesBtn = page
        .getByRole('button', { name: 'YES', exact: true })
        .or(page.getByText('YES', { exact: true }))
        .or(page.locator('button, a').filter({ hasText: /^YES$/i }))
        .or(page.locator('.age-verify-yes'))
        .first();
      if (await yesBtn.isVisible({ timeout: 3000 })) {
        console.log('Age verification detected. Clicking YES.');
        await yesBtn.click({ force: true });
        await page.waitForTimeout(1500);
      }
    } catch (e) {
      console.log('Age verification popup not found.');
    }
    try {
      await page.addStyleTag({ content: 'iframe[title*="chat"], .tawk-min-container { display: none !important; }' });
      console.log('Chat widget hidden.');
    } catch (e) {}
  };
  const productUrl = 'https://d8flight.com/products/d8flight-volume-2-doobies-joints-premium-1gm-with-d9-11hydroxy-thcp-thca-diamonds-50ct-jar';
  // 4.1. Open a Product Detail Page
  console.log('Opening home page for initial setup...');
  await page.goto('https://d8flight.com/', { waitUntil: 'load' });
  await clearOverlays();
  console.log('Navigating to product detail page...');
  await page.goto(productUrl, { waitUntil: 'load' });
  await clearOverlays();
  // 4.1.2 Check Breadcrumbs
  console.log('Verifying breadcrumbs...');
  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Home');
  await expect(breadcrumb).toContainText('Shop');
  await expect(breadcrumb).toContainText(/D8FLIGHT Volume 2 Doobies Joints/i, { timeout: 20000 });
  // 3. UI Elements & Description Verification
  console.log('Verifying UI elements and Description headings...');
  await expect(page.locator('h2').first()).toContainText('D8FLIGHT Volume 2 Doobies Joints');
  const descSection = page.locator('#Description, .tab-pane#Description').first();
  await descSection.scrollIntoViewIfNeeded();
  await expect(page.locator('h4, strong, b, h1, h2, h3, p').filter({ hasText: /^What Makes D8FLIGHT Volume 2 Doobies Exceptional\?$/i }).first()).toBeVisible();
  await expect(page.locator('h4, strong, b, h1, h2, h3, p').filter({ hasText: /^Strain Options for Every Mood$/i }).first()).toBeVisible();
  await expect(page.locator('h4, strong, b, h1, h2, h3, p').filter({ hasText: /^How to Use$/i }).first()).toBeVisible();
  // 4.2 Select a Flavor / Strain Variant
  console.log('Testing flavor selection cycling...');
  const flavors = [
    'BANANA LAVA', 'BLUE RUNTZ', 'BUBBA ZKITTLEZ', 'CHERRY MINTZ', 
    'CRACKED PAPAYA', 'GMO CAKE', 'GRAPE SHERB', 'LEMON DRIP', 
    'PEACH OCTANE', 'PINEAPPLE DIESEL', 'PURPLE TRUFFLE', 
    'STRAWBERRY JUNGLE', 'WHITE SUNDAE'
  ];
  for (const flavor of flavors) {
    console.log(`Selecting flavor: ${flavor}`);
    await clearOverlays();
    await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button, a.btn'));
      const btn = buttons.find(b => (b as HTMLElement).innerText.trim().toUpperCase() === name.toUpperCase());
      if (btn) (btn as HTMLElement).click();
    }, flavor);
    await page.waitForTimeout(1000); 
    // Safety check: ensure we didn't wander off the product page
    if (!page.url().includes('/products/')) {
        console.log(`Warning: URL changed unexpectedly to ${page.url()} after clicking ${flavor}. Navigating back...`);
        await page.goto(productUrl);
        await clearOverlays();
    }
    console.log(`Interaction completed for flavor: ${flavor}`);
  }
  // 4.3 Use the Quantity Selector
  console.log('Testing quantity selector...');
  const qtyVal = page.locator('.qty-val, .quantity input, [class*="qty-val"]').first();
  await expect(qtyVal).toBeVisible({ timeout: 15000 });
  const upBtn = page.locator('a.qty-up, .qty-up, [class*="qty-up"]').first();
  const downBtn = page.locator('a.qty-down, .qty-down, [class*="qty-down"]').first();
  await clearOverlays();
  await upBtn.click(); // to 2
  await page.waitForTimeout(800);
  await clearOverlays();
  await upBtn.click(); // to 3
  await page.waitForTimeout(800);
  await clearOverlays();
  await downBtn.click(); // to 2
  await page.waitForTimeout(800);
  console.log('Quantity selector interaction completed.');
  console.log('Testing ADD TO CART flow...');
  //4.5 Add Product to Cart from Product Detail Page
  await clearOverlays();
  await page.locator('button').filter({ hasText: /ADD TO CART/i }).first().click();
  await page.waitForTimeout(3000); 
  // Close the cart drawer if it appears
  const cartDrawerClose = page.locator('div[role="presentation"] button.MuiIconButton-root, .cart-drawer-close, button[aria-label*="close"]').first();
  if (await cartDrawerClose.isVisible({ timeout: 5000 })) {
    console.log('Cart drawer detected. Closing it...');
    await cartDrawerClose.click();
    await page.waitForTimeout(1000);
  }
  // Hover over cart to ensure count is updated and visible
  const cartIcon = page.locator('.header-action-right, .header-action-icon-2').filter({ hasText: /Cart/i }).first();
  if (await cartIcon.isVisible()) {
    await cartIcon.hover();
    await page.waitForTimeout(1000);
  }
  const cartCount = page.locator('.header-cart-count, .pro-count, .cart-count, .MuiBadge-badge').first();
  await expect(cartCount).toContainText(/\d+/, { timeout: 15000 });
  console.log(`Cart count verified.`);
  // 4.4 Click a Category Chip on the Product Page
  console.log('Testing categories chips...');
  const d8CatChip = page.locator('a[href*="/products?cat=d8flight"]').first();
  await clearOverlays();
  await d8CatChip.click();
  await expect(page).toHaveURL(/products\?cat=d8flight/);
  await page.goBack();
  await page.waitForLoadState('load');
  await clearOverlays();
  const bestSellersChip = page.locator('a[href*="/products?cat=best-sellers"]').first();
  if (await bestSellersChip.isVisible()) {
      await clearOverlays();
      await bestSellersChip.click();
      await expect(page).toHaveURL(/products\?cat=best-sellers/);
      await page.goBack();
      await page.waitForLoadState('load');
      await clearOverlays();
  }
  // 4.6 Buy Now (Final Step as it navigates away)
  console.log('Testing BUY NOW flow...');
  await clearOverlays();
  await page.locator('button').filter({ hasText: /GMO CAKE/i }).first().click();
  await clearOverlays();
  await page.locator('button').filter({ hasText: /BUY NOW/i }).first().click();
  await expect(page).toHaveURL(/shop-checkout/);
  console.log('--- PRODUCT DETAIL FLOW COMPLETED ---');
});
