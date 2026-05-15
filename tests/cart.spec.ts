import { test, expect, type Page } from '@playwright/test';

test.setTimeout(600000);

const productUrl = 'https://d8flight.com/products/d8flight-volume-2-doobies-joints-premium-1gm-with-d9-11hydroxy-thcp-thca-diamonds-50ct-jar';

const clearOverlays = async (page: Page) => {
  try {
    const yesBtn = page.getByRole('button', { name: 'YES', exact: true }).or(page.getByText('YES', { exact: true }));
    if (await yesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await yesBtn.click({ force: true });
    }
  } catch {}
  try {
    await page.addStyleTag({ content: '.tawk-min-container, .tawk-button, .tawk-widget { display: none !important; }' });
  } catch {}
};

const addProductToCart = async (page: Page) => {
  await page.goto(productUrl, { waitUntil: 'load' });
  await clearOverlays(page);
  
  const variation = page.locator('button, a, .variation-button').filter({ hasText: /BLUE RUNTZ|BANANA LAVA|GMO CAKE/i }).first();
  if (await variation.isVisible().catch(() => false)) {
    await variation.click({ force: true });
  }
  
  await page.locator('button.button-add-to-cart, button:has-text("ADD TO CART")').first().click({ force: true });
  await page.waitForTimeout(3000);
};

test.describe('D8Flight Shopping Cart Flows', () => {

  test('5.1 Open the Cart Page', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
    await clearOverlays(page);

    await expect(page).toHaveURL(/shop-cart/i);
    await expect(page.locator('h1, h2')).toContainText(/Cart/i);
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Subtotal|Total|Proceed To CheckOut/i);
  });

  test('5.2 Increase Quantity in the Cart', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
    await clearOverlays(page);

    const qtyInput = page.locator(`//tr[.//span[text()='PURPLE TRUFFLE']]//td[@data-title='Stock']/i`).first();
    const beforeVal = parseInt(await qtyInput.textContent() || '1');
    
    const plusBtn = page.locator('.qty-up, .plus, button:has-text("+")').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click({ force: true });
    } else {
      await qtyInput.fill(String(beforeVal + 1));
      await qtyInput.press('Enter');
    }
    
    await page.waitForTimeout(2000);
    expect(parseInt(await qtyInput.inputValue())).toBeGreaterThan(beforeVal);
  });

  test('5.3 Remove a Single Item from the Cart', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
    await clearOverlays(page);

    const initialRows = await page.locator('table tbody tr').count();
    await page.locator('.remove, .fi-rs-trash, .product-remove a').first().click({ force: true });
    await page.waitForTimeout(2000);
    
    expect(await page.locator('table tbody tr').count()).toBeLessThan(initialRows);
  });

  test('5.4 Clear the Entire Cart', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
    await clearOverlays(page);

    const clearBtn = page.locator('button, a').filter({ hasText: /Clear Cart|Clear/i }).first();
    await clearBtn.click({ force: true });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toContainText(/empty|no products/i);
  });

  test('5.5 Proceed to Checkout from the Cart', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('https://d8flight.com/shop-cart', { waitUntil: 'load' });
    await clearOverlays(page);

    await page.getByRole('link', { name: /Proceed To CheckOut|Checkout/i }).first().click({ force: true });
    await page.waitForURL(/checkout/i, { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/Billing Address/i);
  });
});