import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('home page automation suite', async ({ page }) => {
  // Set high timeout for the extensive flow
  test.setTimeout(1200000); // 20 minutes
  const ssDir = 'test-results/screenshots';
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  console.log('--- STARTING ROBUST D8FLIGHT AUTOMATION ---');
  // --- 1.1 Launch the D8Flight Website
  await page.goto('https://d8flight.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Helper to clear age verification and chat widget if they appear
  const clearOverlays = async () => {
    try {
      // Age Verification
      const ageYes = page.getByRole('button', { name: 'YES' });
      if (await ageYes.isVisible({ timeout: 3000 })) {
        await ageYes.click();
        console.log('Age verification cleared');
        await page.waitForTimeout(1000);
      }
      // Hide chat widget if it obstructs
      const chatWidget = page.locator('#tawk-bubble-container');
      if (await chatWidget.isVisible({ timeout: 2000 })) {
        await page.evaluate(() => {
          const el = document.querySelector('#tawk-bubble-container');
          if (el) (el as HTMLElement).style.display = 'none';
        });
        console.log('Chat widget hidden');
      }
    } catch (e) {}
  };
  // --- 1.2. HERO BANNERS ---
  console.log('Hero Banners - Testing all 10 slides');
  await clearOverlays();  // --- 1.2. CAROUSEL INDICATORS (DOTS) ---
  console.log('Testing Carousel Indicators (Dots)');
  await clearOverlays();
  const carouselInner = page.locator('.carousel-inner').first();
  // Center the carousel in the viewport
  await carouselInner.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2000);
  const indicators = page.locator('.carousel-indicators button');
  const indicatorCount = await indicators.count();
  console.log(`Found ${indicatorCount} indicators`);
  // Test a few specific dots (e.g., 1st, 5th, and last)
  const testIndices = [0, 4, indicatorCount - 1];
  for (const index of testIndices) {
    if (index >= 0 && index < indicatorCount) {
      console.log(`Testing Indicator ${index + 1}`);
      const dot = indicators.nth(index);
      await dot.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await dot.click({ force: true });
      await page.waitForTimeout(2000); // Wait for transition
      // Verify the clicked dot is active
      await expect(dot).toHaveClass(/active/);
      // Verify the corresponding slide is active
      const activeSlide = page.locator('.carousel-item.active').first();
      await expect(activeSlide).toBeVisible();
      
      await page.screenshot({ path: path.join(ssDir, `07_indicator_${index+1}_clicked.png`) });
    }
  }

  // --- 1.3. HERO BANNERS ---
  console.log('Hero Banners - Testing all 10 slides for redirection');
  const nextBtn = page.locator('.carousel-control-next').first();
  const prevBtn = page.locator('.carousel-control-prev').first();

  // Initial Carousel Control Tests
  console.log('Testing Carousel Next/Prev buttons');
  await carouselInner.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await nextBtn.click({ force: true });
  await page.waitForTimeout(1000);
  await prevBtn.click({ force: true });
  await page.waitForTimeout(1000);

  // Robust Loop for 10 slides
  for (let i = 0; i < 10; i++) {
    console.log(`--- Testing Slide ${i + 1} ---`);
    
    // 1. Always ensure we are on the home page and reset to Slide 1
    const homeUrl = 'https://d8flight.com/';
    console.log(`Navigating to home page for Slide ${i + 1} test...`);
    await page.goto(homeUrl, { waitUntil: 'networkidle' });
    await clearOverlays();
    
    // Center the carousel again
    await carouselInner.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(2500); // Wait for initialization

    // 2. Reach the target slide
    for (let j = 0; j < i; j++) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(1500); 
    }

    // 3. Click the active banner and check redirection
    const activeBanner = page.locator('.carousel-item.active a').first();
    // Wait for stability
    await page.waitForTimeout(1000);
    
    if (await activeBanner.isVisible()) {
      const href = await activeBanner.getAttribute('href');
      console.log(`Clicking Banner ${i + 1} (href: ${href})`);
      
      const initialUrl = page.url();
      await activeBanner.click({ force: true });
      
      // Wait to see if URL changes
      await page.waitForTimeout(4000);
      const currentUrl = page.url();

      if (currentUrl !== initialUrl) {
        console.log(`Slide ${i + 1} REDIRECTED to: ${currentUrl}`);
        await page.screenshot({ path: path.join(ssDir, `07_banner_${i+1}_redirected.png`) });
      } else {
        console.log(`Slide ${i + 1} did NOT redirect (URL stayed same).`);
        await page.screenshot({ path: path.join(ssDir, `07_banner_${i+1}_no_redirect.png`) });
      }
    } else {
      console.log(`Slide ${i + 1} banner link not found/visible. Taking debug screenshot.`);
      await page.screenshot({ path: path.join(ssDir, `debug_banner_${i+1}_not_found.png`) });
    }

    await page.waitForTimeout(1000);
  }
  // // --- 5. FEATURED CATEGORIES SECTION (Grid) ---
  // console.log('Automating Featured Categories of Our D8Flight');
  // const featuredHeading = page.locator('h2:has-text("Featured Categories")');
  // await featuredHeading.scrollIntoViewIfNeeded();
  // await page.waitForTimeout(1000);
  // const featuredSection = page.locator('section').filter({ has: featuredHeading });
  // const categoryCards = featuredSection.locator('.col-md-4, .col-lg-2');
  // const cardCount = await categoryCards.count();
  // for (let i = 0; i < cardCount; i++) {
  //   const card = categoryCards.nth(i);
  //   await card.scrollIntoViewIfNeeded();
  //   const descText = await card.locator('p').innerText();
  //   const catName = descText.split(' ')[1] || `Category_${i+1}`;  
  //   const shopNowBtn = card.locator('a:has-text("SHOP NOW")');
  //   await page.screenshot({ path: path.join(ssDir, `06_featured_cat_${catName}_before.png`) });  
  //   await shopNowBtn.click();
  //   await page.waitForLoadState('networkidle');
  //   await expect(page).toHaveURL(/products\?cat=/);
  //   await page.screenshot({ path: path.join(ssDir, `06_featured_cat_${catName}_after.png`) });   
  //   await page.goto('https://d8flight.com', { waitUntil: 'networkidle' });
  //   await page.locator('h2:has-text("Featured Categories")').scrollIntoViewIfNeeded();
  //   await page.waitForTimeout(1000);
  // }
//   // --- 6. NEW ARRIVALS ---
//   console.log('Checking New Arrivals');
//   await page.getByRole('heading', { name: 'New Arrival\'s', level: 3 }).scrollIntoViewIfNeeded();
//   const eye = page.locator('.fi-rs-eye').first();
//   if (await eye.isVisible()) {
//     await eye.hover();
//     await eye.click();
//     await page.waitForTimeout(2000);
//     await page.screenshot({ path: path.join(ssDir, '08_quick_view.png') });
//     await page.keyboard.press('Escape');
//   }
//   // --- 7. VIDEOS ---
//   console.log('Final video check');
//   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
//   await page.waitForTimeout(3000);
//   const v = page.locator('video').first();
//   if (await v.isVisible()) {
//     await expect(v).toBeVisible();
//     await page.screenshot({ path: path.join(ssDir, '09_videos.png') });
//   }
console.log('--- ALL FLOWS COMPLETED SUCCESSFULLY ---');
});