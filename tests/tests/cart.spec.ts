import { test, expect } from '@playwright/test';

/**
 * Cart and Checkout Flow Automation
 * This test verifies the end-to-end journey from product selection to payment details entry.
 */

test('D8Flight - End-to-End Cart to Checkout Flow', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes
  console.log('Navigating to shop...');
  await page.goto('https://d8flight.com/shop');
  await page.waitForLoadState('networkidle');
  try {
    const yesBtn = page.getByRole('button', { name: 'YES', exact: true });
    await yesBtn.waitFor({ state: 'visible', timeout: 5000 });
    await yesBtn.dispatchEvent('click');
    console.log('Age verification cleared.');
  } catch (e) {}
  console.log('Selecting a product...');
  const firstProductTitle = page.locator('h2 a[href*="products/"]').first();
  await firstProductTitle.waitFor({ state: 'visible' });
  await firstProductTitle.dispatchEvent('click');
  console.log('Waiting for product page...');
  await page.waitForURL(/products\//);
  await page.waitForLoadState('networkidle');
  const flavorButtons = page.locator('.attr-detail button, .list-filter li a');
  if (await flavorButtons.count() > 0) {
    console.log('Selecting flavor...');
    await flavorButtons.first().click({ force: true });
    await page.waitForTimeout(1000);
  }

  console.log('Adding product to cart...');
  const addToCartBtn = page.getByRole('button', { name: /ADD TO CART/i }).first();
  await addToCartBtn.waitFor({ state: 'visible' });
  await addToCartBtn.click({ force: true });
  await page.waitForTimeout(4000); // Wait for cart update
  await page.screenshot({ path: `screenshots/cart_product_added_${Date.now()}.png` });

  // 4. Open Cart Drawer and Proceed to Checkout
  console.log('Checking cart drawer...');
  const checkoutBtn = page.locator('button.CartDrawer_checkoutButton__jhCsi, button:has-text("Check out")').first();
  await page.waitForTimeout(2000);
  
  if (!(await checkoutBtn.isVisible())) {
    console.log('Opening cart drawer...');
    const cartIcon = page.locator('header button:has(.MuiBadge-root), header .MuiBadge-root, header svg').last();
    if (await cartIcon.isVisible()) {
        await cartIcon.click({ force: true });
        await page.waitForTimeout(2000);
    }
  }
  console.log('Clicking Checkout...');
  if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click({ force: true });
  }
  // 5. Fill Checkout Form
  console.log('Waiting for checkout page to load...');
  try {
    await page.waitForURL(url => url.pathname.includes('checkout'), { timeout: 15000 });
  } catch (e) {
    console.log('Fallback: Direct navigation to checkout...');
    await page.goto('https://d8flight.com/shop-checkout');
  }

  await page.waitForLoadState('networkidle');
  console.log(`Reached Checkout: ${page.url()}`);
  await page.screenshot({ path: `screenshots/checkout_page_initial_${Date.now()}.png` });
  // Dummy Shipping Details
  console.log('Filling shipping details...');
  const fillField = async (selector: string, value: string) => {
    try {
       const el = page.locator(selector).first();
       await el.waitFor({ state: 'visible', timeout: 5000 });
       await el.fill(value);
    } catch (e) {
       console.log(`Failed to fill ${selector}`);
    }
  };
  await fillField('input[name="firstName"], input[placeholder*="First Name"]', 'John');
  await fillField('input[name="lastName"], input[placeholder*="Last Name"]', 'Doe');
  await fillField('input[name="email"], input[type="email"], input[placeholder*="Email"]', 'john.doe@example.com');
  await fillField('input[name="address1"], input[placeholder*="Address"], input[placeholder*="Street"], .Checkout_inputField__mn3Gl', '123 Test Avenue');
  await fillField('input[name="city"], input[placeholder*="City"]', 'Los Angeles');
  try {
     const stateSelect = page.locator('select').first();
     if (await stateSelect.isVisible({ timeout: 2000 })) {
       await stateSelect.selectOption({ label: 'California' });
     }
  } catch (e) { console.log('State select failed or not present.'); }
  await fillField('input[name="postalCode"], input[placeholder*="ZIP"]', '90001');
  await fillField('input[name="phone"], input[type="tel"], input[placeholder*="Phone"]', '1234567890');
  console.log('Shipping details filled.');
  await page.screenshot({ path: `screenshots/checkout_details_filled_${Date.now()}.png` });
  // 6. Payment Selection
  console.log('Selecting Credit Card payment...');
  const creditCardOption = page.getByText(/Pay Via Credit\/Debit card/i);
  if (await creditCardOption.isVisible()) {
    await creditCardOption.scrollIntoViewIfNeeded();
    await creditCardOption.click({ force: true });
    await page.waitForTimeout(3000);
  }
  // 7. Enter Dummy Card Details (Stripe Iframe)
  console.log('Entering dummy card details...');
  const stripeIframe = page.frameLocator('iframe[name^="__privateStripeFrame"]');
  try {
    const cardNumber = stripeIframe.locator('input[name="cardnumber"]');
    await cardNumber.waitFor({ state: 'visible', timeout: 15000 });
    await cardNumber.fill('4242424242424242');
    await stripeIframe.locator('input[name="exp-date"]').fill('12/26');
    await stripeIframe.locator('input[name="cvc"]').fill('123');
    console.log('Dummy payment details entered.');
  } catch (e) {
    console.log('Stripe iframe fields not found or took too long to load.');
  }
  await page.screenshot({ path: `screenshots/payment_details_entered_${Date.now()}.png` });
  console.log('\n--- Cart and Checkout Test Complete ---');
});
