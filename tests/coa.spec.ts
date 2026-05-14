import { test, expect } from '@playwright/test';

test('D8Flight Footer Labs Navigation', async ({ page, context }) => {

  test.setTimeout(300000);

  console.log('--- Starting Footer Labs Flow ---');

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
  await page.goto('https://d8flight.com/');
  await handleAgePopup();
  // ---------------- FOOTER ----------------
  await scrollToBottom();
  // ---------------- CLICK LABS ----------------
  const labsLink = page
    .locator('footer')
    .getByRole('link', { name: /Labs|Labwork/i })
    .first();
  await expect(labsLink).toBeVisible();
  console.log('Clicking Labs link...');
  await Promise.all([
    page.waitForLoadState('load'),
    labsLink.click({ force: true })
  ]);

  // ---------------- VERIFY URL ----------------
  await expect(page).toHaveURL(/labs|labwork/i);
  console.log('Labs page loaded.');
  // ---------------- SCROLL LABS PAGE ----------------
  await scrollToBottom();
  // ---------------- FIND ANY VISIBLE LINK ----------------
  const visibleLink = page.getByRole('link', { name: 'D8FLIGHT - F*CKIN HITTER - 200MG PRE ROLLS - 50CT. JAR - (BUBBA KUSH)' }).first();
  await expect(visibleLink).toBeVisible();
  const linkText = await visibleLink.innerText();
  console.log(`Testing link: ${linkText}`);
  // ---------------- CHECK NEW TAB ----------------
  const [newPage] = await Promise.all([
    context.waitForEvent('page').catch(() => null),
    visibleLink.click({ force: true })
  ]);
  if (newPage) {
    await newPage.waitForLoadState();
    console.log('Link opened in NEW TAB.');
    console.log('New Tab URL:', newPage.url());
    await expect(newPage).toHaveURL(/.+/);
    await newPage.close();
  } else {
    console.log('Link opened in SAME TAB.');
    await page.waitForLoadState();
    await expect(page).toHaveURL(/.+/);
  }
  // ---------------- SCREENSHOT ----------------
  await page.screenshot({
    path: `screenshots/footer_labs_page_${Date.now()}.png`,
    fullPage: true
  });
  console.log('--- Footer Labs Flow Completed ---');
});