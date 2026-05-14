import { test, expect } from '@playwright/test';

test('D8Flight Footer and Contact Interaction', async ({ page }) => {
  test.setTimeout(600000);
  console.log('--- Starting Footer and Contact Flow ---');
  // ---------------- AGE POPUP FUNCTION ----------------
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
  // ---------------- OPEN HOMEPAGE ----------------
  console.log('Navigating to homepage...');
  await page.goto('https://d8flight.com/');
  await handleAgePopup();
  // ---------------- FOOTER LINKS ----------------
  const links = [
    'D8 Flight',
    'About Us',
    'Labs',
    'Contact'
  ];
  for (const text of links) {
    console.log(`Checking link: ${text}`);
    // Open Homepage
    await page.goto('https://d8flight.com/');
    await handleAgePopup();
    // Scroll Homepage Footer
    await scrollToBottom();
    // Footer Link
    const link = page
      .locator('footer')
      .getByText(text, { exact: true })
      .first();
    // Click & Wait For Redirection
    await Promise.all([
      page.waitForLoadState('load'),
      link.click({ force: true })
    ]);
    console.log(`${text} page loaded.`);
    // Scroll Redirected Page Completely
    await scrollToBottom();
    // Screenshot
    await page.screenshot({
      path: `screenshots/footer_link_${text
        .replace(/ /g, '_')
        .toLowerCase()}_${Date.now()}.png`,
      fullPage: true
    });
    console.log(`Verified ${text}.`);
  }
  // ---------------- COPYRIGHT TEXT ----------------
  await page.goto('https://d8flight.com/');
  await handleAgePopup();
  await scrollToBottom();
  await expect(
    page.getByText('© 2026, D8-Flight All Rights Reserved')
  ).toBeVisible();
  console.log('Copyright text verified.');
  console.log('--- Footer and Contact Flow Completed ---');
});