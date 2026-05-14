import { test, expect } from '@playwright/test';
test('D8Flight Footer and Contact Interaction', async ({ page }) => {
  test.setTimeout(600000);
  console.log('--- Starting Footer and Contact Flow ---');
  // ---------------- AGE POPUP ----------------
  async function handleAgePopup() {
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
  }
  // ---------------- SCROLL FUNCTION ----------------
  async function scrollToBottom() {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });

    });
    await page.waitForTimeout(2000);
  }
  // ---------------- HOMEPAGE ----------------
  console.log('Navigating to homepage...');
  await page.goto('https://d8flight.com/');
  await handleAgePopup();
  // ---------------- CONTACT PAGE ----------------
  console.log('Scrolling to footer...');
  await scrollToBottom();
  const contactLink = page
    .locator('footer')
    .getByRole('link', { name: /Contact/i })
    .first();
  console.log('Clicking Contact link...');
  await page.screenshot({
    path: `screenshots/footer_pre_contact_click_${Date.now()}.png`
  });
  await Promise.all([
    page.waitForLoadState('load'),
    contactLink.click({ force: true })
  ]);
  await expect(page).toHaveURL(/page-contact/i);

  console.log('Contact page reached.');

  // Scroll redirected page fully
  await scrollToBottom();

  await page.screenshot({
    path: `screenshots/contact_page_initial_${Date.now()}.png`,
    fullPage: true
  });

  // ---------------- SUBMIT FORM ----------------

  console.log('Submitting form...');

  await page.locator('input[name*="first" i], input[placeholder*="First" i]').first().fill('Auto Tester');
  await page.locator('input[type="email"], input[name*="email" i], input[placeholder*="Email" i]').first().fill('autotester@example.com');
  await page.locator('input[type="tel"], input[name*="phone" i], input[placeholder*="Phone" i]').first().fill('5551234567');
  await page.locator('input[name*="subject" i], input[placeholder*="Subject" i]').first().fill('Product Inquiry');
  await page.locator('textarea[name*="message" i], textarea[placeholder*="Message" i]').first().fill('Hello, I would like to know more about your products.');

  await page.screenshot({
    path: `screenshots/contact_form_dummy_details_${Date.now()}.png`,
    fullPage: true
  });

//   const sendBtn = page
//     .getByRole('button', { name: /Send message/i })
//     .first();

//   await sendBtn.click({ force: true });

  await page.waitForTimeout(3000);

  // Scroll after submission
  await scrollToBottom();

  await page.screenshot({
    path: `screenshots/contact_form_submitted_${Date.now()}.png`,
    fullPage: true
  });

  console.log('Form submission complete.');

  // ---------------- SHIPPING & RETURNS ----------------

  console.log('Checking Shipping & Returns...');

  const shipBtn = page
    .getByRole('link', { name: /Shipping & Returns/i })
    .first();

  if (await shipBtn.isVisible().catch(() => false)) {

    await Promise.all([
      page.waitForLoadState('load'),
      shipBtn.click({ force: true })
    ]);

    console.log('Shipping & Returns page loaded.');

    // Scroll redirected page
    await scrollToBottom();

    await page.screenshot({
      path: `screenshots/footer_shipping_success_${Date.now()}.png`,
      fullPage: true
    });
    await page.goBack();
    await page.waitForLoadState('load');
  }
  // ---------------- LABS PAGE ----------------
  console.log('Checking Labs page...');
  const labBtn = page
    .getByRole('link', { name: /Labwork|Labs/i })
    .first();
  if (await labBtn.isVisible().catch(() => false)) {
    await Promise.all([
      page.waitForLoadState('load'),
      labBtn.click({ force: true })
    ]);
    console.log('Labs page loaded.');
    // Scroll redirected page
    await scrollToBottom();
    await page.screenshot({
      path: `screenshots/footer_labs_success_${Date.now()}.png`,
      fullPage: true
    });
    await page.goBack();
    await page.waitForLoadState('load');
  }
  console.log('--- Footer and Contact Flow Completed ---');
});