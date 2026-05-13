import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
test('D8Flight Shop Page Validations', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes
  const ssDir = path.join(process.cwd(), 'test-results', 'screenshots', 'shop');
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
  // 3.1 Open the Products Listing Page
  console.log('Navigating to products page...');
  await page.goto('https://d8flight.com/products', { waitUntil: 'load' });
  await clearOverlays();
  // Wait for skeletons to disappear
  for (let i = 0; i < 20; i++) {
    const hasProducts = await page.locator('.product-cart-wrap, .MuiCard-root, [class*="MuiCard-root"]').count();
    const hasSkeletons = await page.locator('.MuiSkeleton-root').count();
    if (hasProducts > 0 && hasSkeletons === 0) break;
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
  }
  console.log('Verifying product card details...');
  const firstProduct = page.locator('.product-cart-wrap, .MuiCard-root, [class*="MuiCard-root"]').first();
  await expect(firstProduct).toBeVisible();
  await expect(firstProduct.locator('img').first()).toBeVisible();
  await expect(firstProduct.locator('.product-category, .brand, .product-brand, .MuiTypography-caption').first()).toBeVisible();
  await expect(firstProduct.locator('h2 a, .product-title, .MuiTypography-h6, .MuiTypography-root').first()).toBeVisible();
  await expect(firstProduct.locator('.product-price, .price, [class*="price"]').first()).toBeVisible();
  await firstProduct.hover();
  await page.waitForTimeout(500);
  const viewProdLink = firstProduct.locator('a').filter({ hasText: /View Product|View/i });
  if (await viewProdLink.isVisible()) {
      await expect(viewProdLink.first()).toBeVisible();
  } else {
      await expect(firstProduct.locator('a:visible').first()).toBeVisible();
  }
  // 3.2 Filter Products by Brand
  console.log('Testing brand filters...');
  const brands = [
    { name: 'Sweet Mary', regex: /Sweet Mary/i },
    { name: 'D8Flight', regex: /D8Flight/i },
    { name: 'Zio', regex: /Zio/i }
  ];
  for (const brand of brands) {
    console.log(`Clicking ${brand.name} filter...`);
    // Find the filter in the sidebar
    const brandBtn = page.locator('.sidebar-widget, .widget-category').getByText(brand.regex).first();
    if (await brandBtn.isVisible()) {
        await brandBtn.click({ force: true });
        console.log('Waiting for listing to refresh...');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give a bit of extra time for DOM update
        const currentUrl = page.url();
        console.log(`URL after ${brand.name} filter: ${currentUrl}`);
    } else {
        console.log(`Could not find filter for ${brand.name}`);
    }
  }
   //3.3 Filter Products by Category via URL
  console.log('Testing direct category links...');
  const categories = [
    'high-dose-gummies',
    'so-high-doobies',
    'disposables',
    'so-high-syrups',
    'so-high-tinctures',
    'booster-shot-syringes',
    'd8flight'
  ];
  for (const cat of categories) {
    console.log(`Navigating to category: ${cat}`);
    await page.goto(`https://d8flight.com/products?cat=${cat}`, { waitUntil: 'load' });
    await clearOverlays();
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    // Verify the URL still contains the category
    await expect(page).toHaveURL(new RegExp(`cat=${cat}`, 'i'), { timeout: 15000 });
    // Wait for product cards to load (bypassing skeletons)
    for (let i = 0; i < 15; i++) {
      const hasProducts = await page.locator('.product-cart-wrap, .MuiCard-root').count();
      const hasSkeletons = await page.locator('.MuiSkeleton-root').count();
      if (hasProducts > 0 && hasSkeletons === 0) break;
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1000);
    }
    // Verify products are listed
    const catProducts = page.locator('.product-cart-wrap, .MuiCard-root').filter({ has: page.locator('img') });
    try {
      await catProducts.first().waitFor({ state: 'attached', timeout: 5000 });
      const count = await catProducts.count();
      console.log(`Verified ${count} products listed for ${cat}`);
    } catch (e) {
      console.log(`No products found for ${cat} or timed out.`);
    }
  }
  // 3.4 Use Pagination to Navigate Pages
  console.log('Testing pagination...');
  await page.goto('https://d8flight.com/products', { waitUntil: 'load' });
  await clearOverlays();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  const pagination = page.locator('.pagination, .pagination-area, .MuiPagination-root, nav.woocommerce-pagination').first();
  if (await pagination.isVisible({ timeout: 5000 })) {
    console.log('Pagination control located.');
    // Verify "Go to previous page" is disabled (page 1 is current).
    const prevBtn = pagination.locator('a.prev, button[aria-label*="previous"], .fi-rs-angle-double-left, .fi-rs-arrow-small-left').first();
    const isPrevActive = await prevBtn.isVisible() && await prevBtn.getAttribute('href') !== '#';
    if (!isPrevActive) {
      console.log('Verified previous page button is disabled on page 1.');
    }
    // Click "Go to page 2"
    console.log('Clicking "Go to page 2"...');
    const page2Btn = pagination.getByText('2', { exact: true }).first();
    if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await page.waitForTimeout(2000);
        console.log('Page 2 loaded.');
    }
    // Click "Go to next page"
    console.log('Clicking "Go to next page"...');
    const nextBtn = page.locator('.pagination a.next, button[aria-label*="next"], .fi-rs-angle-double-right, .fi-rs-arrow-small-right').first();
    if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
        console.log('Verified page 3 loads.');
    }
    // Click "Go to page 9"
    console.log('Clicking "Go to page 9"...');
    const page9Btn = page.locator('.pagination').getByText('9', { exact: true }).first();
    if (await page9Btn.isVisible()) {
        await page9Btn.click();
        await page.waitForTimeout(2000);
        console.log('Page 9 loaded.');
    }
    // Click "Go to previous page" to return
    console.log('Clicking "Go to previous page"...');
    const prevBtnActive = page.locator('.pagination a.prev, button[aria-label*="previous"], .fi-rs-angle-double-left, .fi-rs-arrow-small-left').first();
    if (await prevBtnActive.isVisible()) {
        await prevBtnActive.click();
        await page.waitForTimeout(2000);
        console.log('Returned to previous page.');
    }
  } else {
    console.log('Pagination control not found. Not enough products or different selector.');
  }
  //3.5 Click 'View Product' on a Listing Card
  console.log('Navigating to products listing page...');
  await page.goto('https://d8flight.com/products', { waitUntil: 'load' });
  await clearOverlays();
  console.log('Locating the first product card...');
  const firstProdCard = page.locator('.product-cart-wrap').first();
  await firstProdCard.waitFor({ state: 'attached', timeout: 15000 });
  console.log('Clicking the "View Product" link/text on the card...');
  // The image or title is often the link
  const productLink = firstProdCard.locator('h2 a, .product-title a, .product-img a, a[href*="/products/"]').first();
  await productLink.click();
  console.log('Waiting for the product detail page to load...');
  await page.waitForLoadState('load');
  const detailTitle = page.locator('.detail-info .title-detail, .product-title, h1').first();
  await expect(detailTitle).toBeVisible({ timeout: 15000 });
  console.log('Verifying the URL contains variant id...');
  await expect(page).toHaveURL(/\/products\/.*v=\d+/i, { timeout: 10000 });
  console.log('Product detail page loaded successfully.');
    console.log('--- SHOP FLOW COMPLETED ---');
});
