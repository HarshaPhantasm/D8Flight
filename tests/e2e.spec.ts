import { test, expect, Page } from '@playwright/test';

test.setTimeout(300000);

// ---------------- OVERLAY HANDLER ----------------

const clearOverlays = async (page: Page) => {
  try {
    const yesButton = page
      .getByRole('button', { name: 'YES', exact: true })
      .or(page.getByText('YES', { exact: true }))
      .first();

    if (await yesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await yesButton.click({ force: true });
      await page.waitForTimeout(2000);
    }
  } catch {}

  try {await page.addStyleTag({
      content: `
        .tawk-min-container,
        .tawk-button,
        .tawk-widget {
          display: none !important;}`,});} catch {}};

test('15.1 Complete Purchase Flow', async ({ page }) => {

  // ---------------- OPEN WEBSITE ----------------

  console.log('Opening D8Flight Website');

  await page.goto('https://d8flight.com', {
    waitUntil: 'load',
  });

  await clearOverlays(page);

  await page.waitForLoadState('networkidle');

  await expect(page).toHaveTitle(
    /D8FLIGHT® | A Brand Built for Bold Experiences/i
  );

  // ---------------- OPEN DOOBIES CATEGORY ----------------

  console.log('Opening Doobies Category');

  const doobiesTile = page
    .locator('*')
    .filter({ hasText: /Doobies/i })
    .first();

  await doobiesTile.scrollIntoViewIfNeeded();

  const shopNowBtn = doobiesTile
    .locator('a, button')
    .filter({ hasText: /SHOP NOW/i })
    .first();

  if (await shopNowBtn.isVisible().catch(() => false)) {
    await shopNowBtn.click({ force: true });
  } else {
    await doobiesTile.locator('a, button').first().click({
      force: true,
    });
  }

  try {
    await page.waitForURL(
      /products\?cat=so-high-doobies/i,
      { timeout: 10000 }
    );
  } catch {
    await page.goto(
      'https://d8flight.com/products?cat=so-high-doobies',
      {
        waitUntil: 'load',
      }
    );
  }

  await clearOverlays(page);

  // ---------------- WAIT FOR PRODUCTS ----------------

  for (let i = 0; i < 10; i++) {

    const products = await page
      .locator('.product-cart-wrap, .MuiCard-root')
      .count();

    if (products > 0) break;

    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });

    await page.waitForTimeout(1000);
  }

  // ---------------- OPEN FIRST PRODUCT ----------------

  console.log('Opening First Product');

  const firstProduct = page
    .locator(
      '.product-cart-wrap, .MuiCard-root, [class*="MuiCard-root"]'
    )
    .first();

  await firstProduct.waitFor({
    state: 'visible',
    timeout: 30000,
  });

  const productLink = firstProduct
    .locator(
      'h2 a, .product-title a, .product-img a, a[href*="/products/"]'
    )
    .first();

  const href = await productLink.getAttribute('href');

  expect(href).toBeTruthy();

  await page.goto(
    new URL(href || '', 'https://d8flight.com').toString(),
    {
      waitUntil: 'load',
    }
  );

  await clearOverlays(page);

  // ---------------- VERIFY PRODUCT PAGE ----------------

  await expect(page).toHaveURL(/\/products\//i);

  const productName = page
    .locator(
      'h1, .product-title, .title-detail'
    )
    .first();

  await expect(productName).toBeVisible();

  // ---------------- SELECT GMO CAKE ----------------

  console.log('Selecting Flavor');

  const flavorBtn = page
    .locator(
      'button, a, .variation-button, .swatch-anchor'
    )
    .filter({
      hasText: /GMO CAKE/i,
    })
    .first();

  await flavorBtn.click({
    force: true,
  });

  await expect(flavorBtn).toBeVisible();

  // ---------------- SET QUANTITY ----------------

  console.log('Increasing Quantity');

  const qtyPlus = page
    .locator(
      '.qty-up, .plus, button:has-text("+")'
    )
    .first();

  if (await qtyPlus.isVisible().catch(() => false)) {

    await qtyPlus.click();

  } else {

    const qtyInput = page
      .locator(
        'input[type="number"], input.qty'
      )
      .first();

    await qtyInput.fill('2');
  }

  // ---------------- ADD TO CART ----------------

  console.log('Adding Product To Cart');

  const addToCartBtn = page
    .locator(
      'button.button-add-to-cart, button:has-text("ADD TO CART"), button:has-text("Add to cart")'
    )
    .first();

  await expect(addToCartBtn).toBeVisible({
    timeout: 30000,
  });

  await addToCartBtn.click({
    force: true,
  });

  await page.waitForTimeout(4000);
  await clearOverlays(page);

  // ---------------- OPEN CART ----------------

  console.log('Opening Cart');

  await page.goto(
    'https://d8flight.com/shop-cart',
    {
      waitUntil: 'load',
    }
  );
  await clearOverlays(page);

  // ---------------- VERIFY CART ----------------

  await expect(page.locator('body')).toContainText(
    /Doobies/i
  );

  await expect(page.locator('body')).toContainText(
    /shipping|free shipping/i
  );

  // ---------------- PROCEED TO CHECKOUT ----------------

  console.log('Proceeding to checkout...');
  const proceedBtn = page.locator('button, a').filter({ hasText: /Proceed To CheckOut|Proceed to checkout|Checkout|Check out/i }).first();
  if (await proceedBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await proceedBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }
  await page.goto('https://d8flight.com/shop-checkout', { waitUntil: 'load', timeout: 60000 });
  await clearOverlays(page);
  await clearOverlays(page);

  // ---------------- FILL BILLING ADDRESS ----------------

  console.log('Filling Billing Address');

  const fillField = async (
    selector: string,
    value: string
  ) => {

    const field = page
      .locator(selector)
      .first();

    await field.click({
      force: true,
    });

    await field.fill(value);
  };

  await fillField(
    'input[name*="first" i]',
    'John'
  );

  await fillField(
    'input[name*="last" i]',
    'Doe'
  );

  await fillField(
    'input[type="email"]',
    'john.doe@example.com'
  );

  await fillField(
    'input[name*="address" i]:not([name*="address_2"])',
    '123 Main Street'
  );

  const aptField = page
    .locator(
      'input[name*="address" i]'
    )
    .nth(1);

  if (await aptField.isVisible().catch(() => false)) {
    await aptField.fill('Apt 4B');
  }

  await fillField(
    'input[name*="city" i]',
    'Joliet'
  );

  const stateDropdown = page
    .locator('select')
    .first();

  if (await stateDropdown.isVisible().catch(() => false)) {

    await stateDropdown.selectOption({
      label: 'Illinois',
    });
  }

  await fillField(
    'input[placeholder*="12345" i]',
    '60436'
  );

  await page.getByPlaceholder('(555) 123-4567').fill('5551234567');
  await page.getByText('Use Shipping Address as Billing Address', { exact: true }).click();
  await page.getByPlaceholder('Card number').fill('4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('12/27');
  await page.getByPlaceholder('CVC').fill('123');

  // ---------------- USE SHIPPING AS BILLING ----------------

  console.log('Using Shipping Address As Billing');

  await page.getByText('Use Shipping Address as Billing Address', { exact: true }).click();

  // ---------------- APPLY COUPON ----------------

  console.log('Applying Coupon');
  const couponToggle = page.locator('.showcoupon, a:has-text("Click here to enter your code")').first();
if (await couponToggle.isVisible().catch(() => false)) {
    await couponToggle.click();}
const couponInput = page.locator('input[name="coupon_code"], input[placeholder*="Discount" i]').first();
await couponInput.fill('WELCOME10');
await page.locator('button[name="apply_coupon"], button:has-text("Apply")').first().click({force: true,});
await page.waitForTimeout(3000);
await expect(page.locator('body')).toContainText(/coupon|discount|WELCOME10/i);
  // ---------------- VERIFY TOTAL ----------------
  await expect(page.locator('body')).toContainText(
    /Discount|Total/i
  );

  // ---------------- PAYMENT ----------------

  console.log('Entering Payment Details');

  await page.evaluate(() => {
    window.scrollTo(
      0,
      document.body.scrollHeight
    );
  });

  await page.waitForTimeout(3000);

  const stripeFrame = page
    .frameLocator(
      'iframe[title*="Secure"], iframe[name*="__privateStripeFrame"]'
    )
    .first();

  const cardNumber = stripeFrame
    .locator(
      'input[name="cardnumber"]'
    )
    .first();

  if (await cardNumber.isVisible().catch(() => false)) {

    await cardNumber.fill(
      '4242424242424242'
    );

    const expiry = stripeFrame
      .locator(
        'input[name="exp-date"]'
      )
      .first();

    await expiry.fill('12/30');

    const cvv = stripeFrame
      .locator(
        'input[name="cvc"]'
      )
      .first();
    await cvv.fill('123');
    const postal = stripeFrame
      .locator(
        'input[name="postal"]'
      )
      .first();

    if (await postal.isVisible().catch(() => false)) {
      await postal.fill('60436');
    }
  }
  // ---------------- PLACE ORDER ----------------
  console.log('Placing Order');
  const placeOrderBtn = page.locator('#place_order, button:has-text("Place Order")').first();
  await expect(placeOrderBtn).toBeVisible({
    timeout: 30000,
  });
  await placeOrderBtn.click({
    force: true,
  });
  await page.waitForTimeout(5000);
  // ---------------- VERIFY SUCCESS ----------------
  console.log('Verifying Order Success');
  await expect(page.locator('body')).toContainText( /Order received|Thank you|Order Number|confirmation/i,{ timeout: 60000 });
  console.log('E2E Purchase Flow Completed Successfully');
});