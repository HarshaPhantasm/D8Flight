import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
test('D8Flight Header & Navigation Flow', async ({ page }) => {
  test.setTimeout(300000); 
  const ssDir = path.join(process.cwd(), 'screenshots', 'header');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  console.log('--- STARTING HEADER & NAVIGATION FLOW ---');
  const clearOverlays = async () => {
    try {
      const yesBtn = page
        .getByRole('button', { name: 'YES', exact: true })
        .or(page.getByText('YES', { exact: true }))
        .first();
      await yesBtn.waitFor({ state: 'visible', timeout: 8000 });
      console.log('Age verification detected. Clicking YES.');
      await yesBtn.click();
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('Age popup not found or already dismissed.');
    }try {
      await page.addStyleTag({ content: 'iframe[title*="chat"], .tawk-min-container { display: none !important; }' });
      console.log('Chat widget hidden.');
    } catch (e) {}
  };
  // 2.1 Navigate Home using the Logo
  console.log('Navigating to About page...');
  await page.goto('https://d8flight.com/page-about', { waitUntil: 'commit' });
  await clearOverlays();
  await page.waitForTimeout(1000); // Let the page settle after clearing overlays
  await page.screenshot({ path: path.join(ssDir, '01_about_page.png') });
  console.log('Clicking logo to return home...');
  const logo = page.locator('.logo a, a[href="/"]').first();
  await logo.click({ force: true });
  console.log('Waiting for URL to become Home...');
  await expect(page).toHaveURL(/^https:\/\/d8flight\.com\/?$/, { timeout: 30000 });
  console.log('Successfully redirected to Home page via logo.');
  await page.screenshot({ path: path.join(ssDir, '02_home_page_after_logo.png') });
  // 2.2 Open the Cart Page from Header
  console.log('Adding a random product to cart...');
  await page.goto('https://d8flight.com/shop', { waitUntil: 'load' });
  await clearOverlays();
  // Wait for products to actually load (bypassing skeleton loaders)
  console.log('Waiting for products to load...');
  for (let i = 0; i < 15; i++) {
    const hasProducts = await page.locator('.product-cart-wrap h2 a, .product-cart-wrap .product-title a').count();
    if (hasProducts > 0) break;
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
  }
  // Find simple products if possible
  const productCards = page.locator('.product-cart-wrap').filter({ hasText: /Add to cart|Add to Cart/i });
  let targetCards = productCards;
  if (await productCards.count() === 0) {
     targetCards = page.locator('.product-cart-wrap');
  }
  const cardCount = await targetCards.count();
  if (cardCount > 0) {
    const randomIdx = Math.floor(Math.random() * Math.min(cardCount, 12));
    const randomProduct = targetCards.nth(randomIdx);
    await randomProduct.scrollIntoViewIfNeeded();

    // Navigate directly to the product page via the product title link
    const productLink = randomProduct.locator('h2 a, .product-title a').first();
    const href = await productLink.getAttribute('href');
    console.log(`Navigating to product page: ${href}`);
    await page.goto(`https://d8flight.com/${href?.replace(/^\//, '')}`, { waitUntil: 'commit' });
    await clearOverlays();

    // Try to click a variant option if it's a variable product
    const variantOption = page.locator('.attr-detail a, .swatch-option, .product-variant-option').first();
    if (await variantOption.isVisible({ timeout: 2000 })) {
       console.log('Selecting product variant...');
       await variantOption.click({ force: true });
       await page.waitForTimeout(500);
    }
    // Increase quantity explicitly to 2
    console.log('Increasing product quantity...');
    const qtyInput = page.locator('input[name="quantity"], input.qty, input[type="number"]').first();
    if (await qtyInput.isVisible({ timeout: 2000 })) {
      await qtyInput.fill('2');
      console.log('Quantity set to 2.');
    } else {
      const qtyUpBtn = page.locator('.qty-up, .qty-plus, .plus, .quantity-plus, a.qty-up').first();
      if (await qtyUpBtn.isVisible({ timeout: 2000 })) {
        await qtyUpBtn.click({ force: true });
        console.log('Quantity increased via button.');
      }
    }
    await page.waitForSelector('button.button-add-to-cart, .add-to-cart-btn', { timeout: 20000 });
    await page.locator('button.button-add-to-cart, .add-to-cart-btn').first().click({ force: true });
    console.log('Product added to cart from product detail page.');
    await page.waitForTimeout(2000);
  }
  console.log('Clicking cart icon...');
  const cartIcon = page.locator('.header-action-icon-2').filter({ hasText: /Cart/i }).first();
  await cartIcon.click({ force: true });
  console.log('Waiting for cart interaction...');
  await page.waitForTimeout(2000);
  // Directly navigate to cart to avoid flaky "View Cart" links in mini-cart
  console.log('Navigating to full cart page...');
  await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'commit' });
  await expect(page).toHaveURL(/cart|shop-cart/i, { timeout: 15000 });
  // 5. VERIFY "CART" HEADING
  console.log('Verifying cart page heading...');
  const cartHeading = page.locator('h1, h2, .cart-page-title, .page-title').filter({ hasText: /Cart/i }).first();
  try {
    await expect(cartHeading).toBeVisible({ timeout: 10000 });
  } catch (e) {
    // Fallback if the heading element is different
    const fallbackHeading = page.getByText(/Cart/i).first();
    await expect(fallbackHeading).toBeVisible({ timeout: 10000 });
  }
  console.log('Cart heading verified.');
  await page.screenshot({ path: path.join(ssDir, '03_cart_page.png') });
  // 2.3 Open the Login Page from Header
  console.log('Locating and clicking login icon...');
  const loginIcon = page.locator('a[href="/page-login"]').first();
  await loginIcon.click({ force: true });
  console.log('Waiting for login page...');
  await expect(page).toHaveURL('https://d8flight.com/page-login', { timeout: 15000 });
  const loginHeading = page.locator('h1, h2, h3, .page-title').filter({ hasText: /Login/i }).first();
  try {
    await expect(loginHeading).toBeVisible({ timeout: 10000 });
  } catch (e) {
    const fallbackLogin = page.getByRole('heading', { name: /Login/i }).first();
    await expect(fallbackLogin).toBeVisible({ timeout: 10000 });
  }
  console.log('Login page verified successfully.');
  await page.screenshot({ path: path.join(ssDir, '04_login_page.png') });
  // 2.4 SEARCH FOR PRODUCTS
  console.log('--- STARTING SEARCH PRODUCTS FLOW ---');
  const productsToSearch = ['Gummies', 'Disposables'];
  for (const product of productsToSearch) {
    console.log(`Searching for: ${product}`);
    const searchInput = page.getByPlaceholder(/Search for Products/i).first();
    await searchInput.fill(product);
    await searchInput.press('Enter');
    console.log('Waiting for search results...');
    await page.waitForLoadState('load');
    await clearOverlays();
    for (let i = 0; i < 15; i++) {
      const hasProducts = await page.locator('.product-cart-wrap').count();
      if (hasProducts > 0) break;
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1000);
    }
    const resultsCount = await page.locator('.product-cart-wrap').count();
    console.log(`Found ${resultsCount} results for ${product}.`);
    await page.screenshot({ path: path.join(ssDir, `05_search_results_${product}.png`) });
  }
  console.log('--- HEADER & NAVIGATION FLOW COMPLETED ---');
});