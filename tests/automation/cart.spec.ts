import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('D8Flight Cart Functionality Flow', async ({ page }) => {
  test.setTimeout(600000); // 10 minutes
  const ssDir = path.join(process.cwd(), 'test-results', 'screenshots', 'cart');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });

  const clearOverlays = async () => {
    console.log('Checking for overlays...');
    try {
      // 1. Handle Age Verification Modal
      const yesBtn = page.locator('button:has-text("YES"), .modal-footer button:has-text("YES")').first();
      if (await yesBtn.isVisible({ timeout: 5000 })) {
        console.log('Age verification detected. Clicking YES.');
        await yesBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
      
      // 2. Remove lingering modal backdrops or active modals
      await page.evaluate(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop, .MuiBackdrop-root, .modal.show');
          backdrops.forEach(b => (b as HTMLElement).style.display = 'none');
          document.body.classList.remove('modal-open');
          document.body.style.overflow = 'auto';
      });

      // 3. Hide Chat Widgets & Overlays
      await page.addStyleTag({ content: `
        iframe[title*="chat"], .tawk-min-container, #hubspot-messages-loader-container, .modal-backdrop { 
          display: none !important; 
          pointer-events: none !important; 
        }
      `});
    } catch (e: any) {
      console.log('Error clearing overlays: ' + e.message);
    }
  };

  const productUrl1 = 'https://d8flight.com/products/d8flight-volume-2-doobies-joints-premium-1gm-with-d9-11hydroxy-thcp-thca-diamonds-50ct-jar';
  const productUrl2 = 'https://d8flight.com/products/so-high-syrups-with-d9-thcp-5000mg-4oz-bottle';

  // --- PART 1: ADD PRODUCT & VERIFY CART PAGE ---
  console.log('--- PART 1: ADDING FIRST PRODUCT ---');
  await page.goto('https://d8flight.com/', { waitUntil: 'load' });
  await clearOverlays();

  await page.goto(productUrl1, { waitUntil: 'load' });
  await clearOverlays();

  console.log('Selecting flavor: GMO CAKE');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a.btn'));
    const btn = buttons.find(b => (b as HTMLElement).innerText.trim().toUpperCase() === 'GMO CAKE');
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(2000);

  console.log('Adding to cart...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a.btn'));
    const btn = buttons.find(b => (b as HTMLElement).innerText.trim().toUpperCase().includes('ADD TO CART'));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(5000);

  // Close cart drawer if open
  const cartDrawerClose = page.locator('div[role="presentation"] button.MuiIconButton-root, .cart-drawer-close, button[aria-label*="close"]').first();
  if (await cartDrawerClose.isVisible({ timeout: 5000 })) {
    console.log('Closing cart drawer...');
    await cartDrawerClose.click();
    await page.waitForTimeout(2000);
  }

  console.log('Navigating to Cart page...');
  await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
  await page.waitForLoadState('networkidle');
  await clearOverlays();

  // Assertions on Cart Page
  console.log('Verifying Cart page elements...');
  await expect(page.locator('h1, h2, h3, .cart-header, [class*="title"]').filter({ hasText: /Your Cart|Cart/i }).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Carefully check the information before checkout/i).first()).toBeVisible();

  console.log('Verifying product row details...');
  // Use a very broad locator to find the product row
  const productRow = page.locator('tr, .cart-item').filter({ hasText: /Doobies|Joints|GMO CAKE/i }).first();
  await expect(productRow).toBeVisible({ timeout: 20000 });
  
  await expect(productRow.locator('img').first()).toBeVisible();
  await expect(productRow.locator('.product-name, .product-title, a').first()).toContainText(/D8FLIGHT/i);
  await expect(productRow.locator('td, .variation, [class*="flavor"]').filter({ hasText: /GMO CAKE/i }).first()).toBeVisible();

  console.log('Verifying Cart Totals and Checkout button...');
  const totalsPanel = page.locator('.cart-totals, .total-checkout, .summary, .cart-summary').first();
  await expect(totalsPanel).toContainText(/Total/i);
  const checkoutBtn = page.locator('a, button').filter({ hasText: /CheckOut/i }).first();
  await expect(checkoutBtn).toBeVisible();

  // --- PART 2: ADD ANOTHER PRODUCT & MANIPULATE CART ---
  console.log('--- PART 2: ADDING SECOND PRODUCT ---');
  await page.goto(productUrl2, { waitUntil: 'load' });
  await clearOverlays();

  console.log('Adding second product to cart...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a.btn'));
    const btn = buttons.find(b => (b as HTMLElement).innerText.trim().toUpperCase().includes('ADD TO CART'));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(5000);

  console.log('Opening cart via View Cart...');
  await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
  await clearOverlays();

  console.log('Increasing quantity of first product...');
  const qtyUpBtn = page.locator('.qty-up, .fi-rs-angle-small-up, a.qty-up').first();
  await qtyUpBtn.click();
  await page.waitForTimeout(3000);

  console.log('Removing a product...');
  const removeBtn = page.locator('.action a, .remove, .fi-rs-trash, [class*="remove"]').last();
  await removeBtn.click();
  await page.waitForTimeout(3000);

  console.log('Clicking Clear Cart...');
  const clearCartBtn = page.locator('button, a').filter({ hasText: /Clear Cart/i }).first();
  await clearCartBtn.click();
  await page.waitForTimeout(4000);

  console.log('Verifying cart is empty...');
  await expect(page.locator('h1, h2, h3, p').filter({ hasText: /Your Cart is Empty|Cart is empty|No items/i }).first()).toBeVisible({ timeout: 15000 });

  // --- PART 3: CHECKOUT NAVIGATION ---
  console.log('--- PART 3: CHECKOUT NAVIGATION ---');
  await page.goto(productUrl1);
  await clearOverlays();
  console.log('Adding product back for checkout...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a.btn'));
    const btn = buttons.find(b => (b as HTMLElement).innerText.trim().toUpperCase().includes('ADD TO CART'));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(5000);
  await page.goto('https://d8flight.com/shop-cart');
  await clearOverlays();
  
  console.log('Clicking CheckOut button...');
  const finalCheckoutBtn = page.locator('a, button').filter({ hasText: /CheckOut/i }).first();
  await finalCheckoutBtn.click({ force: true });
  
  console.log('Waiting for checkout page...');
  await page.waitForURL(/shop-checkout|checkout|billing/i, { timeout: 45000 });
  console.log('--- CART FLOW COMPLETED ---');
});
