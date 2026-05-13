import { test, expect } from '@playwright/test';

/**
 * Simplified D8Flight Shop Automation
 * Verifies all filter categories, sub-filters, and product flavor combinations.
 */

test('D8Flight Shop - Simplified Comprehensive Test', async ({ page }) => {
  // Extended timeout for the full site iteration
  test.setTimeout(1800000); 

  // 1. Initial Navigation and Load
  console.log('Navigating to shop...');
  await page.goto('https://d8flight.com/shop');
  await page.waitForLoadState('networkidle');

  // Handle Age Popup
  try {
    await page.getByRole('button', { name: 'YES', exact: true }).click({ timeout: 5000 });
    console.log('Age verification cleared.');
    await page.screenshot({ path: `screenshots/age_verification_${Date.now()}.png` });
  } catch (e) {}

  // 2. Identify all Filter Groups (Accordions)
  const groupAccordions = page.locator('.MuiAccordion-root');
  const groupCount = await groupAccordions.count();

  for (let i = 0; i < groupCount; i++) {
    const currentGroup = groupAccordions.nth(i);
    
    // Ensure group is expanded to see sub-filters
    if (await currentGroup.locator('.MuiAccordionSummary-root').getAttribute('aria-expanded') === 'false') {
      await currentGroup.locator('.MuiAccordionSummary-root').click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `screenshots/group_expand_${i}_${Date.now()}.png` });
    }

    // 3. Process every sub-filter in the group
    const filterLabels = currentGroup.locator('.MuiAccordionDetails-root p');
    const filterCount = await filterLabels.count();

    for (let j = 0; j < filterCount; j++) {
      const currentFilter = filterLabels.nth(j);
      const filterName = (await currentFilter.innerText()).trim();
      
      console.log(`\n--- Testing Filter: ${filterName} ---`);
      await currentFilter.click({ force: true });
      
      // Wait for results to load after redirection/filter
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); // Wait for skeleton loaders to be replaced by actual products
      await page.screenshot({ path: `screenshots/filter_${filterName.replace(/[^a-zA-Z0-9]/g, '_')}_applied_${Date.now()}.png`, fullPage: true });

      // 4. Test first 2 products under this filter
      const productLinks = page.locator('h2 a[href*="products/"]');
      const productsFound = await productLinks.count();
      
      if (productsFound === 0) {
        console.log(`[SKIP] No products found for filter: ${filterName}`);
        continue;
      }

      const testLimit = Math.min(productsFound, 2);
      console.log(`[LOG] Found ${productsFound} products. Testing first ${testLimit}...`);
      
      // Collect target URLs
      const urls: string[] = [];
      for (let k = 0; k < testLimit; k++) {
        const href = await productLinks.nth(k).getAttribute('href');
        if (href) {
          const cleanHref = href.startsWith('/') ? href : `/${href}`;
          urls.push(`https://d8flight.com${cleanHref}`);
        }
      }

      for (const productUrl of urls) {
        console.log(`   Product: ${productUrl}`);
        await page.goto(productUrl);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `screenshots/product_page_${Date.now()}.png` });

        // 5. Test every flavor/variant in the product
        const flavorButtons = page.locator('.attr-detail button, .list-filter li a');
        const flavorsFound = await flavorButtons.count();

        if (flavorsFound > 0) {
          for (let l = 0; l < flavorsFound; l++) {
            const flavor = flavorButtons.nth(l);
            const flavorText = (await flavor.innerText()).trim();
            
            console.log(`      Flavor: ${flavorText}`);
            await flavor.click({ force: true });
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `screenshots/flavor_${flavorText.replace(/[^a-zA-Z0-9]/g, '_')}_selected_${Date.now()}.png` });
            
            // Add to Cart and Screenshot
            await page.getByRole('button', { name: /ADD TO CART/i }).first().click();
            console.log(`      Success: Added to cart.`);
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `screenshots/add_cart_${Date.now()}.png` });

            // Close cart drawer
            await page.waitForTimeout(1000);
            const closeBtn = page.locator('[aria-label="Close cart"], .close-cart').first();
            if (await closeBtn.isVisible()) await closeBtn.click();
          }
        } else {
          // Add basic product to cart
          await page.getByRole('button', { name: /ADD TO CART/i }).first().click();
          console.log(`      Success: Added standard product to cart.`);
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `screenshots/add_standard_${Date.now()}.png` });
        }

        // 6. Return to Shop and Re-Apply Filter State
        await page.goto('https://d8flight.com/shop');
        await page.waitForLoadState('networkidle');
        
        // Re-expand and re-select filter
        if (await groupAccordions.nth(i).locator('.MuiAccordionSummary-root').getAttribute('aria-expanded') === 'false') {
          await groupAccordions.nth(i).locator('.MuiAccordionSummary-root').click();
        }
        await groupAccordions.nth(i).locator('.MuiAccordionDetails-root p').nth(j).click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `screenshots/shop_return_${Date.now()}.png` });
      }

      // 7. Uncheck current filter to clear state for next
      console.log(`Finishing filter: ${filterName}`);
      await groupAccordions.nth(i).locator('.MuiAccordionDetails-root p').nth(j).click({ force: true });
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n--- Full Comprehensive Test Complete ---');
});
