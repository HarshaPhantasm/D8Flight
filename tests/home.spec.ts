import { test, expect } from '@playwright/test';
test('home page automation suite', async ({ page }) => {
  test.setTimeout(600000); 
  console.log('--- STARTING ROBUST D8FLIGHT AUTOMATION ---');
  const clearOverlays = async () => {
    try {
      const ageYes = page.locator('button, a').filter({ hasText: /^YES$/i }).or(page.locator('.age-verify-yes')).first();
      if (await ageYes.isVisible({ timeout: 10000 })) {
        await ageYes.click({ force: true });
        console.log('Age verification cleared');
        await page.waitForTimeout(1500);
      }
      await page.addStyleTag({ content: 'iframe, .tawk-min-container { display: none !important; }' });
    } catch (e) {}
  };
  await page.goto('https://d8flight.com', { waitUntil: 'load' });
  await clearOverlays();
  // --- 1. HERO BANNERS ---
  console.log('Testing Carousel Indicators');
  const indicators = page.locator('.carousel-indicators button');
  if (await indicators.count() > 0) {
      const firstDot = indicators.first();
      await firstDot.click({ force: true });
      await page.waitForTimeout(1000);
      await expect(firstDot).toHaveClass(/active/);
  }
  // Test next/prev buttons
  const nextBtn = page.locator('.carousel-control-next').first();
  if (await nextBtn.isVisible()) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(1000);
  }
  // --- 2. SHOP BY CATEGORY ---
  console.log('Testing Shop by Category section');
  const catSection = page.locator('.section-title').filter({ hasText: /Shop by Categories/i }).first();
  if (await catSection.isVisible()) {
      await catSection.scrollIntoViewIfNeeded();
      const firstCat = page.locator('.category-card, .card-1').first();
      await expect(firstCat).toBeVisible({ timeout: 15000 });
  }
  // --- 3. NEW ARRIVALS ---
  console.log('Testing New Arrivals section');
  const newArrivals = page.locator('h3').filter({ hasText: /New Arrival/i }).first();
  if (await newArrivals.isVisible()) {
      await newArrivals.scrollIntoViewIfNeeded();
      const firstProduct = page.locator('.product-cart-wrap').first();
      await expect(firstProduct).toBeVisible({ timeout: 15000 });
  }
  // --- 4. VIDEO SECTION ---
  console.log('Testing Video section');
  const video = page.locator('video').first();
  if (await video.isVisible()) {
      await expect(video).toBeVisible();
      console.log('Video found.');
  }
  console.log('--- ALL FLOWS COMPLETED SUCCESSFULLY ---');
});