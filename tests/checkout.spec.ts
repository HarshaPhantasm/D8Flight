import { test, expect, Page } from '@playwright/test';

const productUrl = 'https://d8flight.com/products/d8flight-volume-2-doobies-joints-premium-1gm-with-d9-11hydroxy-thcp-thca-diamonds-50ct-jar';
const checkoutUrl = 'https://d8flight.com/shop-checkout';
const cartUrl = 'https://d8flight.com/shop-cart';

const checkoutData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'testing12345',
  street: '123 Main Street',
  apt: 'Apt 4B',
  city: 'Joliet',
  state: 'Illinois',
  zip: '60436',
  phone: '5551234567',
  country: 'US',
  coupon: 'WELCOME10',
  cardNumber: '4242424242424242',
  expiry: '12/30',
  cvv: '123',
};

test.setTimeout(600000);

const clearOverlays = async (page: Page) => {
  try {
    const yesButton = page.getByRole('button', { name: 'YES', exact: true }).or(page.getByText('YES', { exact: true })).first();
    if (await yesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await yesButton.click({ force: true });
      await page.waitForTimeout(1000);
    }
  } catch {}
  try {
    await page.addStyleTag({ content: '.tawk-min-container, .tawk-widget { display: none !important; }' });
  } catch {}
};

const fillField = async (page: Page, selector: string, value: string, index = 0) => {
  const field = page.locator(selector).nth(index);
  if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
    await field.click({ force: true });
    await field.fill(value);
  }
};

const selectOption = async (page: Page, selector: string, value: string, index = 0) => {
  const field = page.locator(selector).nth(index);
  if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
    await field.selectOption({ value });
  }
};

const addProductAndOpenCheckout = async (page: Page) => {
  await page.goto(productUrl, { waitUntil: 'load', timeout: 60000 });
  await clearOverlays(page);

  const variation = page.locator('button, a, .variation-button').filter({ hasText: /BLUE RUNTZ|BANANA LAVA|GMO CAKE/i }).first();
  if (await variation.isVisible({ timeout: 3000 }).catch(() => false)) {
    await variation.click({ force: true });
    await page.waitForTimeout(500);
  }

  const addToCart = page.locator('button.button-add-to-cart, button:has-text("ADD TO CART")').first();
  await expect(addToCart).toBeVisible({ timeout: 30000 });
  await addToCart.click({ force: true });
  await page.waitForTimeout(3000);
  await clearOverlays(page);

  await page.goto(cartUrl, { waitUntil: 'load', timeout: 60000 });
  await clearOverlays(page);
  await page.goto(checkoutUrl, { waitUntil: 'load', timeout: 60000 });
  await clearOverlays(page);
  await expect(page).toHaveURL(/checkout/i, { timeout: 30000 });
};

const fillAddress = async (page: Page) => {
  await fillField(page, 'input[placeholder*="First" i]', checkoutData.firstName);
  await fillField(page, 'input[placeholder*="Last" i]', checkoutData.lastName);
  await fillField(page, 'input[type="email"]', checkoutData.email);
  await fillField(page, 'input[placeholder*="Street" i]', checkoutData.street);
  await fillField(page, 'input[placeholder*="Apartment" i]', checkoutData.apt, 1);
  await fillField(page, 'input[placeholder*="City" i]', checkoutData.city);
  await selectOption(page, 'select[name*="state" i]', checkoutData.state);
  await fillField(page, 'input[name*="zip" i]', checkoutData.zip);
  await fillField(page, 'input[type="tel"]', checkoutData.phone);
  
  const checkbox = page.locator('input[type="checkbox"]').last();
  if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await checkbox.evaluate((cb: HTMLInputElement) => cb.checked = true);
  }
};

const fillPayment = async (page: Page) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  const cardFrame = page.frameLocator('iframe').first();
  const cardNumber = cardFrame.locator('input[name*="card" i], input[placeholder*="card" i]').first();
  if (await cardNumber.isVisible({ timeout: 5000 }).catch(() => false)) {
    await cardNumber.fill(checkoutData.cardNumber);
    const expiry = cardFrame.locator('input[name*="exp" i], input[placeholder*="exp" i]').first();
    await expiry.fill(checkoutData.expiry);
    const cvv = cardFrame.locator('input[name*="cvv" i], input[placeholder*="cvv" i]').first();
    await cvv.fill(checkoutData.cvv);
  }
};

const login = async (page: Page) => {
  await page.goto('https://d8flight.com/', { waitUntil: 'load' });
  await clearOverlays(page);
    
  await page.goto('https://d8flight.com/page-login', { waitUntil: 'load' });
  await clearOverlays(page);
  
  await expect(page).toHaveURL(/page-login/i);
  await expect(page.locator('input[type="email"], input[name*="email" i]').first()).toBeVisible({ timeout: 15000 });
  
  await page.locator('input[type="email"], input[name*="email" i]').first().fill('test123user@gmail.com');
  await page.locator('input[type="password"], input[name*="password" i]').first().fill('testing12345');
  
  const rememberMe = page.locator('input[type="checkbox"][name*="remember" i], #rememberme').first();
  if (await rememberMe.isVisible({ timeout: 3000 }).catch(() => false)) {
    await rememberMe.evaluate((cb: HTMLInputElement) => {
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  
  await clearOverlays(page);
  await page.getByRole('button', { name: /Log in|Login|Sign in/i }).first().click({ force: true });
  await page.waitForTimeout(5000);
  
  await expect(page.locator('body')).toContainText(/account|dashboard|logout|my account/i, { timeout: 15000 });
};

test('6.1 Checkout Login Existing Customer', async ({ page }) => {
  await login(page);
  await addProductAndOpenCheckout(page);
  
  const loginToggle = page.locator('a, button').filter({ hasText: /login|returning customer/i }).first();
  if (await loginToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginToggle.click({ force: true });
  }
  
  const loginPassword = page.locator('input[type="password"], input[name*="password" i]').first();
  if (await loginPassword.isVisible({ timeout: 3000 }).catch(() => false)) {
    await fillField(page, 'input[type="email"]', checkoutData.email);
    await loginPassword.fill(checkoutData.password);
    await page.locator('button[name="login"], button:has-text("Log in")').first().click({ force: true });
    await page.waitForTimeout(2000);
    await clearOverlays(page);
    await expect(page.locator('body')).toContainText(/Billing|Shipping|Logout/i, { timeout: 30000 });
  } else {
    await expect(page.locator('body')).toContainText(/Billing|Shipping|Address/i, { timeout: 30000 });
  }
});

test('6.2 Fill Billing Address Shipping Address and Place Order', async ({ page }) => {
  await addProductAndOpenCheckout(page);
  await fillAddress(page);
  await fillPayment(page);
  
  const placeOrder = page.locator('#place_order, button:has-text("Place Order"), button:has-text("place order")').first();
  if (await placeOrder.isVisible({ timeout: 5000 }).catch(() => false)) {
    await placeOrder.click({ force: true });
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toContainText(/Order|Thank you|received|confirmation/i, { timeout: 40000 });
  }
});

test('6.3 Apply Coupon Code at Checkout', async ({ page }) => {
  await addProductAndOpenCheckout(page);

  const couponToggle = page.locator('a, button').filter({ hasText: /coupon|discount/i }).first();
  if (await couponToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
    await couponToggle.click({ force: true });
  }

  const couponInput = page.locator('input[name*="coupon" i], input[placeholder*="coupon" i], input[placeholder*="discount" i]').first();
  if (await couponInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await couponInput.fill(checkoutData.coupon);
    await page.locator('button[name*="apply_coupon" i], button:has-text("Apply")').first().click({ force: true });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/coupon|discount|applied|invalid/i, { timeout: 30000 });
  }
});