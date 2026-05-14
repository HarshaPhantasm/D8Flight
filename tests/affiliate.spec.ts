import { test, expect } from '@playwright/test';
test('D8Flight Footer Become Affiliate Navigation', async ({ page }) => {
  test.setTimeout(300000);
  console.log('--- Starting Become Affiliate Flow ---');
  // ---------------- OPEN HOMEPAGE ----------------
  await page.goto('https://d8flight.com/', {
    waitUntil: 'load'
  });
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
    console.log('Age popup detected.');
    await yesBtn.click({ force: true });
    await page.waitForTimeout(2000);
  } catch {
    console.log('Age popup not found.');
  } 
  // ---------------- SCROLL TO FOOTER ----------------
  console.log('Scrolling to footer...');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.screenshot({
    path: `screenshots/become_affiliate_scrolled_${Date.now()}.png`
  });
  await page.waitForTimeout(2000);
  // ---------------- CLICK BECOME AFFILIATE ----------------
  const affiliateLink = page
    .locator('footer')
    .locator('p:has-text("Became an Affiliate")')
    .first();
  await expect(affiliateLink).toBeVisible();
  console.log('Clicking Become Affiliate link...');
  await affiliateLink.click({ force: true });
   await page.screenshot({
    path: `screenshots/become_affiliate_clicked_${Date.now()}.png`
  });
  // ---------------- WAIT FOR PAGE LOAD ----------------
  await page.waitForURL(/affiliate/i, {
    timeout: 30000
  });
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  console.log('Affiliate page loaded.');
  // ---------------- CLICK JOIN NOW ----------------
  const joinNowBtn = page.getByRole('button', { name: 'Join Now' });
  await expect(joinNowBtn).toBeVisible();
  console.log('Clicking Join Now button...');
  await joinNowBtn.click({ force: true });
   await page.screenshot({
    path: `screenshots/become_affiliate_join_now_clicked_${Date.now()}.png`
  });
  // ---------------- WAIT FOR NEXT PAGE LOAD ----------------
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  // ---------------- VERIFY REDIRECTION ----------------
  await expect(page).toHaveURL(/affiliate/i);
  console.log('Become Affiliate page loaded successfully.');
   await page.waitForLoadState('load');
     await page.screenshot({
    path: `screenshots/become_affiliate_${Date.now()}.png`,
  });
  // ---------------- SCREENSHOT ----------------
  await page.screenshot({
    path: `screenshots/become_affiliate_final_${Date.now()}.png`,
    fullPage: true
  });
  console.log('--- Become Affiliate Flow Completed ---');
});