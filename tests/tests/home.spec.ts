import { test, expect } from '@playwright/test';
test('D8Flight Automation Single Flow', async ({ page }) => {
  test.setTimeout(1800000);
  await page.goto('https://d8flight.com/');
  try {
    const yesBtn = page.getByRole('button', { name: 'YES', exact: true }).or(page.getByText('YES', { exact: true })).first();
    await yesBtn.waitFor({ state: 'attached', timeout: 15000 });
    await yesBtn.dispatchEvent('click');
    await page.screenshot({ path: `screenshots/home_age_clear_${Date.now()}.png` });
  } catch (e) {}
  await page.waitForLoadState('load');
  await expect(page).toHaveTitle(/D8FLIGHT/i);
  await page.screenshot({ path: `screenshots/home_start_${Date.now()}.png`, fullPage: true });
  await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
  const searchTerms = ['gummies', 'disposables'];
  for (const term of searchTerms) {
    await page.goto('https://d8flight.com/');
    await page.waitForLoadState('load');
    const search = page.getByPlaceholder('Search for Products').first();
    await search.fill(term);
    await page.screenshot({ path: `screenshots/search_fill_${term}_${Date.now()}.png` });
    await search.press('Enter');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/products/);
    await page.screenshot({ path: `screenshots/search_${term}_${Date.now()}.png`, fullPage: true });
  }
  await page.goto('https://d8flight.com/');
  await page.waitForLoadState('load');
  await page.locator("a[href='/page-login']").first().dispatchEvent('click');
  await page.waitForLoadState('load');
  await page.screenshot({ path: `screenshots/login_page_load_${Date.now()}.png` });
  await expect(page).toHaveURL(/login/);
  await page.getByPlaceholder('Username or email').first().fill('dummymail@gmail.com');
  await page.getByPlaceholder('Your Password').first().fill('DummyPassword123!');
  await page.screenshot({ path: `screenshots/login_filled.png`, fullPage: true });
  const loginBtn = page.getByRole('button', { name: /Log in|Sign in/i }).first();
  if (await loginBtn.isVisible()) {
    await loginBtn.dispatchEvent('click');
    await page.waitForLoadState('load');
  } 
  const cats = ['F*ckin Hitter Gummies', 'Zio', 'Sweet-Mary'];
  for (const cat of cats) {
    await page.goto('https://d8flight.com/');
    await page.waitForLoadState('load');
    await page.getByText('Browse All Categories').first().hover();
    await page.screenshot({ path: `screenshots/cat_hover_${cat.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png` });
    await page.getByRole('link', { name: cat, exact: true }).first().dispatchEvent('click');
    await page.waitForLoadState('load');
    await page.screenshot({ path: `screenshots/cat_${cat.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`, fullPage: true });
  }
});