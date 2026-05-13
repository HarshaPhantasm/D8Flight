// //   // -----------------------------
// //   // BROWSE ALL CATEGORIES
// //   // -----------------------------
// //   console.log('Checking categories dropdown');
// //   const catBtn = page
// //     .locator('.categories-button-active')
// //     .first();
// //   await catBtn.click();
// //   await page.waitForTimeout(1000);
// //   const categoryNames = [
// //     "F*ckin Hitter Gummies",
// //     "F*ckin Hitter Disposables",
// //     "F*ckin Hitter Doobies",
// //     "F*ckin Hitter Syrups",
// //     "F*ckin Hitter Tinctures",
// //     "F*ckin Hitter Chef's Sauce",
// //     "Zio",
// //     "Sweet-Mary"
// //   ];
// //   for (const name of categoryNames) {
// //     console.log(`Opening category: ${name}`);
// //     const link = page
// //       .getByRole('link', { name })
// //       .first();
// //     if (!(await link.isVisible())) {
// //       await catBtn.click();
// //       await page.waitForTimeout(1000);
// //     }
// //     await link.click();
// //     await page.waitForLoadState('networkidle');
// //     await page.screenshot({
// //       path: path.join(
// //         ssDir,
// //         `05_cat_dropdown_${name.replace(/\*/g, '')}.png`
// //       )
// //     });
// //     // Return Home
// //     await page.goto('https://d8flight.com', {
// //       waitUntil: 'networkidle'
// //     });
// //   }
// import { test, expect } from '@playwright/test';
// import path from 'path';
// import fs from 'fs';

// test('D8Flight About Page & Cart Flow', async ({ page }) => {
//   test.setTimeout(300000); // 5 minutes
//   const ssDir = path.join(process.cwd(), 'screenshots', 'about');
//   if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });

//   console.log('--- STARTING ABOUT PAGE & CART FLOW ---');
//   // 1. Handle Age Verification Modal
//   const clearOverlays = async () => {
//     try {
//       const yesBtn = page.getByRole('button', { name: 'YES', exact: true });
//       if (await yesBtn.isVisible({ timeout: 5000 })) {
//         console.log('Age verification detected. Clicking YES.');
//         await yesBtn.click();
//         await page.waitForTimeout(1000);
//       }
//     } catch (e) {}
//     try {
//       await page.addStyleTag({ content: 'iframe[title*="chat"], .tawk-min-container { display: none !important; }' });
//       console.log('Chat widget hidden.');
//     } catch (e) {}
//   };
//   console.log('Navigating to homepage...');
//   await page.goto('https://d8flight.com/', { waitUntil: 'networkidle' });
//   await clearOverlays();
//   // 2. CLICK ABOUT LINK IN HEADER
//   console.log('Locating About link in header...');
//   const aboutLink = page.locator('.main-menu a').filter({ hasText: /^About$/ }).first();
//   await aboutLink.scrollIntoViewIfNeeded();
//   console.log('Clicking About link...');
//   await page.screenshot({ path: path.join(ssDir, '01_pre_click_home.png') });
//   await aboutLink.click();
//   console.log('Waiting for About page redirection...');
//   await expect(page).toHaveURL(/page-about/i, { timeout: 20000 });
//   console.log(`Successfully reached: ${page.url()}`);
//   await clearOverlays();

//   // 4. CONTENT VALIDATION
//   console.log('Validating main content...');
//   const welcomeHeading = page.locator('h2, h1').filter({ hasText: /Welcome to D8 Flight/i }).first();
//   await expect(welcomeHeading).toBeVisible();
  
//   const heroImage = page.locator('.about-img, .page-content img').first();
//   await expect(heroImage).toBeVisible();
  
//   await page.screenshot({ path: path.join(ssDir, '02_about_page_top.png') });

//   // 5. CLICK LOGIN ICON
//   console.log('Locating Login icon...');
//   const loginIcon = page.locator('a[href="/page-login"]').first();
//   await loginIcon.scrollIntoViewIfNeeded();
//   await page.screenshot({ path: path.join(ssDir, '03_pre_login_click.png') });
//   await loginIcon.click();
  
//   await page.waitForLoadState('networkidle');
//   await expect(page).toHaveURL(/page-login/i, { timeout: 15000 });
//   console.log('Login page reached.');
//   await page.screenshot({ path: path.join(ssDir, '04_login_page.png') });

//   // 6. ADD RANDOM PRODUCT TO CART
//   console.log('Adding a random product to cart...');
//   // Navigate to shop
//   await page.goto('https://d8flight.com/shop', { waitUntil: 'networkidle' });
//   await clearOverlays();
  
//   const productCards = page.locator('.product-cart-wrap');
//   await productCards.first().waitFor({ state: 'visible' });
//   const cardCount = await productCards.count();
  
//   if (cardCount > 0) {
//     const randomIdx = Math.floor(Math.random() * Math.min(cardCount, 12)); // Random from first 12
//     const randomProduct = productCards.nth(randomIdx);
    
//     console.log(`Selecting random product at index ${randomIdx}...`);
//     await randomProduct.scrollIntoViewIfNeeded();
    
//     // Check for "Add to Cart" button or icon on the card
//     const addToCartBtn = randomProduct.locator('.action-btn, .button-add-to-cart').first();
//     if (await addToCartBtn.isVisible()) {
//       await addToCartBtn.click();
//       console.log('Product added to cart from shop grid.');
//     } else {
//       // Navigate to product page if no direct button
//       await randomProduct.locator('a').first().click();
//       await page.waitForLoadState('networkidle');
//       await clearOverlays();
//       const detailAddToCart = page.locator('button.button-add-to-cart, .add-to-cart-btn').first();
//       await detailAddToCart.scrollIntoViewIfNeeded();
//       await detailAddToCart.click();
//       console.log('Product added to cart from product detail page.');
//     }
    
//     await page.waitForTimeout(2000);
//     await page.screenshot({ path: path.join(ssDir, '05_product_added_to_cart.png') });
//   } else {
//     console.log('No products found in shop to add to cart.');
//   }

//   // 7. SLOW SCROLL TO FINISH
//   console.log('Final scroll to bottom...');
//   await page.evaluate(async () => {
//     window.scrollTo(0, document.body.scrollHeight);
//   });
//   await page.waitForTimeout(1000);
//   await page.screenshot({ path: path.join(ssDir, '06_final_footer.png') });

//   console.log('--- FLOW COMPLETED SUCCESSFULLY ---');
// });
 // -----------------------------
  // SEARCH & ADD TO CART LOOP
  // -----------------------------

//   console.log('Searching for products loop');

//   const productsToSearch = [
//     'Gummies',
//     'disposables'
//   ];

//   for (const product of productsToSearch) {

//     console.log(`Searching for ${product}`);

//     const search = page
//       .getByPlaceholder('Search for Products')
//       .first();

//     await search.fill(product);

//     await search.press('Enter');

//     await page.waitForLoadState('networkidle');

//     await page.screenshot({
//       path: path.join(ssDir, `02_search_${product}.png`)
//     });

//     const cartIconBtn = page
//       .locator('.action-btn')
//       .first();

//     if (await cartIconBtn.isVisible()) {

//       await cartIconBtn.click();

//       console.log(`Added ${product} to cart`);

//       await page.waitForTimeout(2000);

//       await page.screenshot({
//         path: path.join(ssDir, `03_added_${product}.png`)
//       });
//     }
// playconfig.ts
// import { defineConfig, devices } from '@playwright/test';

// /**
//  * See https://playwright.dev/docs/test-configuration.
//  */
// export default defineConfig({
//     testMatch: ['**/tests/**/*.test.ts', '**/Banner_Test/**/*.test.ts'],
//     /* Maximum time one test can run for. */
//     timeout: 120000,
//     expect: {
//         /**
//          * Maximum time expect() should wait for the condition to be met.
//          * For example in `await expect(locator).toBeVisible();`
//          */
//         timeout: 10000,
//     },
//     /* Run tests in files in parallel */
//     fullyParallel: true,
//     /* Fail the build on CI if you accidentally left test.only in the source code. */
//     forbidOnly: !!process.env.CI,
//     /* Retry on CI only */
//     retries: process.env.CI ? 1 : 0,
//     /* Run one test at a time — avoids resource contention on login/cart state */
//     workers: 1,
//     /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//     reporter: [
//         ['line'],
//         ['allure-playwright'],
//         ['list'],
//         ['html'],
//         ['json', { outputFile: 'results.json' }],
//         ['junit', { outputFile: 'results.xml' }],
//     ],
//     /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//     use: {
//         /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//         baseURL: 'https://americandistributorsllc.com',
//         trace: 'on',
//         screenshot: 'on',
//         video: 'on',
//         headless: true,
//         ignoreHTTPSErrors: true,
//         permissions: ['geolocation'],
//         viewport: { width: 3020, height: 2080 },
//     },

//     /* Configure projects for major browsers */
//     projects: [
//         {
//             name: 'chromium',
//             use: {
//                 ...devices['Desktop Chrome'],
//                 viewport: null,
//                 deviceScaleFactor: undefined,
//                 launchOptions: {
//                     args: ['--start-maximized']
//                 }
//             },
//         },
//     ],
// })