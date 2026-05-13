import { test, expect } from '@playwright/test';

test('D8Flight About Page Flow', async ({ page }) => {
  test.setTimeout(600000);
  console.log('--- Starting About Page Flow ---');
  console.log('Navigating to homepage...');
  await page.goto('https://d8flight.com/');
  try {
    const yesBtn = page.getByRole('button', { name: 'YES', exact: true }).or(page.getByText('YES', { exact: true })).first();
    await yesBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Age popup detected. Clicking YES.');
    await yesBtn.click();
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Age popup not found or already dismissed.');
  }
  console.log('Locating "About" link in header...');
  const aboutLink = page.getByRole('link', { name: 'About', exact: true }).first();
  await aboutLink.waitFor({ state: 'visible', timeout: 15000 });
  await aboutLink.scrollIntoViewIfNeeded();
  console.log('Clicking About link...');
  await page.screenshot({ path: `screenshots/about_pre_click_${Date.now()}.png` });
  await aboutLink.dispatchEvent('click');
  await page.waitForTimeout(3000);
  console.log('Waiting for About page redirection...');
  await page.waitForLoadState('load');
  await expect(page).toHaveURL(/page-about/i, { timeout: 30000 });
  console.log('Successfully redirected to: ' + page.url());
  await page.screenshot({ path: `screenshots/about_redirection_success_${Date.now()}.png`, fullPage: true });
  console.log('Starting slow scroll to bottom...');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let h = 0; const d = 250;
      const t = setInterval(() => {
        window.scrollBy(0, d); h += d;
        if (h >= document.body.scrollHeight) { clearInterval(t); resolve(); }
      }, 150);
    });
  });
  console.log('Scroll completed.');
  console.log('Verifying footer visibility...');
  await expect(page.locator('footer')).toBeVisible();
  await page.screenshot({ path: `screenshots/about_final_footer_${Date.now()}.png`, fullPage: true });
  console.log('--- About Page Flow Completed ---');
});