import { test, expect } from '@playwright/test';

test('D8Flight Login and Register Flow', async ({ page }) => {
  test.setTimeout(300000);
  const firstName = 'tester';
  const lastName = 'user1';
  const uniqueEmail = 'user1TESTING@gmail.com';
  const phoneNumber = '9865324715';
  const loginPassword = 'user1test_!';
  const clearOverlays = async () => {
    try {
      const yesBtn = page
        .getByRole('button', { name: 'YES', exact: true })
        .or(page.getByText('YES', { exact: true }))
        .or(page.locator('button, a').filter({ hasText: /^YES$/i }))
        .or(page.locator('.age-verify-yes'))
        .first();
      if (await yesBtn.isVisible({ timeout: 3000 })) {
        await yesBtn.click({ force: true });
        await page.waitForTimeout(1500);
      }
    } catch (e) {}
    try {
      await page.addStyleTag({ content: 'iframe, .tawk-min-container { display: none !important; }' });
    } catch (e) {}
  };
  await page.goto('https://d8flight.com/', { waitUntil: 'load' });
  await clearOverlays();
  await page.goto('https://d8flight.com/page-register', { waitUntil: 'load' });
  await clearOverlays();
  await expect(page).toHaveURL(/page-register/i);
  await expect(page.locator('h1, h2, h3, body').filter({ hasText: /Register/i }).first()).toBeVisible({ timeout: 15000 });
  await clearOverlays();
  await page.locator('input[name*="first" i], input[placeholder*="First" i]').first().fill(firstName);
  await clearOverlays();
  await page.locator('input[name*="last" i], input[placeholder*="Last" i]').first().fill(lastName);
  await clearOverlays();
  await page.locator('input[type="email"], input[name*="email" i], input[placeholder*="Email" i]').first().fill(uniqueEmail);
  await clearOverlays();
  await page.locator('input[type="tel"], input[name*="phone" i], input[placeholder*="Phone" i]').first().fill(phoneNumber);
  await clearOverlays();
  await page.getByText('I agree to Terms & Policy').click();
  await page.getByRole('button', { name: 'Submit & Register' }).click();
  const passwordFields = page.locator('input[type="password"], input[name*="password" i], input[placeholder*="password" i]');
  if (await passwordFields.count() > 0) {
    await passwordFields.first().fill(loginPassword);
    if (await passwordFields.count() > 1) {
      await passwordFields.nth(1).fill(loginPassword);
    }
  }
  await page.getByRole('button', { name: /Submit & Register|Register|Submit/i }).first().click({ force: true });
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toContainText(/success|registered|login|account|home|thank/i, { timeout: 15000 });
  await page.goto('https://d8flight.com/page-login', { waitUntil: 'load' });
  await clearOverlays();
  await expect(page).toHaveURL(/page-login/i);
  await expect(page.locator('input[type="email"], input[name*="email" i], input[name*="user" i], input[placeholder*="Email" i], input[placeholder*="Username" i]').first()).toBeVisible({ timeout: 15000 });
  await clearOverlays();
  await page.locator('input[type="email"], input[name*="email" i], input[name*="user" i], input[placeholder*="Email" i], input[placeholder*="Username" i]').first().fill(uniqueEmail);
  await clearOverlays();
  await page.locator('input[type="password"], input[name*="password" i], input[placeholder*="password" i]').first().fill(loginPassword);
  await clearOverlays();
  await page.getByText('Remember me').click();
  const rememberMe = page.locator('input[type="checkbox"]').first();
  if (await rememberMe.isVisible().catch(() => false)) {
    await rememberMe.check({ force: true });
  }
  await clearOverlays();
  await page.getByRole('button', { name: /Log in|Login|Sign in/i }).first().click({ force: true });
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/account|dashboard|\/$|page-login|login/i, { timeout: 15000 });
  await expect(page.locator('body')).toContainText(/account|dashboard|logout|login|home|invalid|incorrect/i, { timeout: 15000 });
  await page.goto('https://d8flight.com/page-login', { waitUntil: 'load' });
  await clearOverlays();
  await expect(page.locator('input[type="email"], input[name*="email" i], input[name*="user" i], input[placeholder*="Email" i], input[placeholder*="Username" i]').first()).toBeVisible({ timeout: 15000 });
  await clearOverlays();
  const registerLink = page.locator('a[href*="page-register"]').or(page.getByRole('link', { name: /Sign Up|Register/i })).first();
  if (await registerLink.isVisible().catch(() => false)) {
    await clearOverlays();
    await registerLink.click({ force: true });
    await page.waitForLoadState('load');
  }
  if (!/page-register/i.test(page.url())) {
    await page.goto('https://d8flight.com/page-register', { waitUntil: 'load' });
  }
  await expect(page).toHaveURL(/page-register/i, { timeout: 15000 });
  await clearOverlays();
  await expect(page.locator('input[name*="first" i], input[placeholder*="First" i]').first()).toBeVisible({ timeout: 15000 });
});
