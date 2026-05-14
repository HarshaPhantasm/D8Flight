import { test, expect } from '@playwright/test';
test('D8Flight Newsletter Subscription', async ({ page }) => {
  test.setTimeout(300000);
  // ---------------- OPEN HOMEPAGE ----------------
  await page.goto('https://d8flight.com/');
  // ---------------- HANDLE AGE POPUP ----------------
  try {
    const yesBtn = page
      .getByRole('button', { name: 'YES', exact: true })
      .or(page.getByText('YES', { exact: true }))
      .first();
    await yesBtn.waitFor({
      state: 'visible',
      timeout: 15000
    });
    await yesBtn.click({ force: true });
    await page.waitForTimeout(2000);
  } catch {
    console.log('Age popup not found.');
  }
  // ---------------- SCROLL TO BOTTOM ----------------
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(2000);
  // ---------------- ENTER EMAIL ----------------
  const emailInput = page.getByPlaceholder('Your email address');
  await expect(emailInput).toBeVisible();
  await emailInput.fill('john.doe@example.com');
  // ---------------- CLICK SUBSCRIBE ----------------
  const subscribeBtn = page.locator('button:has-text("Subscribe")').first();
  await expect(subscribeBtn).toBeVisible();
  await subscribeBtn.click({ force: true });    
  await page.waitForTimeout(3000);
  console.log('Newsletter subscription completed.');
});