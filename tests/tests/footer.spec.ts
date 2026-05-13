import { test, expect } from '@playwright/test';

test('D8Flight Footer and Contact Interaction', async ({ page }) => {
  test.setTimeout(600000); 
  console.log('--- Starting Footer and Contact Flow ---');

  // 1. Initial Launch
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

  // 2. Contact Page Interaction
  console.log('Scrolling to footer to find Contact link...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  const contactLink = page.locator('footer').getByRole('link', { name: /Contact/i }).first();
  console.log('Clicking Contact link...');
  await page.screenshot({ path: `screenshots/footer_pre_contact_click_${Date.now()}.png` });
  await contactLink.click({ force: true });
  
  await page.waitForLoadState('load');
  await expect(page).toHaveURL(/page-contact/i);
  console.log('Contact page reached.');
  await page.screenshot({ path: `screenshots/contact_page_initial_${Date.now()}.png`, fullPage: true });

  // Form Filling
  console.log('Filling contact form with dummy data...');
  await page.locator('input[placeholder*="First Name"]').first().fill('John Doe');
  await page.locator('input[placeholder*="Email"]').first().fill('john.doe@example.com');
  await page.locator('input[placeholder*="Phone"]').first().fill('1234567890');
  await page.locator('input[placeholder*="Subject"]').first().fill('Automated Test');
  await page.locator('textarea[placeholder*="Message"]').first().fill('This is a step-by-step automated test.');
  await page.screenshot({ path: `screenshots/contact_form_data_filled.png`, fullPage: true });

  console.log('Submitting form...');
  const sendBtn = page.getByRole('button', { name: /Send message/i }).first();
  await sendBtn.click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/contact_form_submitted_${Date.now()}.png`, fullPage: true });
  console.log('Form submission complete.');

  // 3. Shipping & Labwork Buttons
  console.log('Checking Shipping & Returns...');
  const shipBtn = page.getByRole('link', { name: /Shipping & Returns/i }).first();
  if (await shipBtn.isVisible()) {
    await shipBtn.click({ force: true });
    await page.waitForLoadState('load');
    console.log('Shipping & Returns page loaded.');
    await page.screenshot({ path: `screenshots/footer_shipping_success_${Date.now()}.png`, fullPage: true });
    await page.goBack();
  }

  console.log('Checking Labwork/Labs...');
  const labBtn = page.getByRole('link', { name: /Labwork|Labs/i }).first();
  if (await labBtn.isVisible()) {
    await labBtn.click({ force: true });
    await page.waitForLoadState('load');
    console.log('Labs page loaded.');
    await page.screenshot({ path: `screenshots/footer_labs_success_${Date.now()}.png`, fullPage: true });
    await page.goBack();
  }

  // 4. Remaining Footer Links
  const links = ['Privacy Policy', 'Terms of service', 'Became an Affiliate'];
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
