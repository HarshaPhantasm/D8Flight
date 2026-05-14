import { test, expect } from '@playwright/test';

test('D8Flight Footer and Contact Interaction', async ({ page }) => {
  test.setTimeout(600000); 
  console.log('--- Starting Footer and Contact Flow ---');

// 14.1 Use Footer Quick Links
  console.log('Navigating to homepage...');
  await page.goto('https://d8flight.com/');
  try {
    const yesBtn = page.getByRole('button', { name: 'YES', exact: true }).or(page.getByText('YES', { exact: true })).first();
    await yesBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Age popup detected. Clicking YES.');
    await yesBtn.click();
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Age popup not found.');
  }
  
  const links = [
  'About Us',
  'Privacy Policy',
  'Terms of service',];
  for (const text of links) {
    console.log(`Checking link: ${text}`);
    await page.goto('https://d8flight.com/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const link = page.locator('footer').getByText(text, { exact: true }).first();
    await link.click({ force: true });
    await page.waitForLoadState('load');
    await page.screenshot({ path: `screenshots/footer_link_${text.replace(/ /g,'_').toLowerCase()}_${Date.now()}.png`, fullPage: true });
    console.log(`Verified ${text}.`);
  }
  console.log('--- Footer and Contact Flow Completed ---');
});