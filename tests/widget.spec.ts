import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://d8flight.com/');
  await page.getByRole('button', { name: 'YES' }).click();
  await page.locator('#g5bio1pcsbro1778842626766').contentFrame().getByRole('button', { name: 'Close Chat attention grabber' }).click();
  await page.locator('iframe').nth(1).contentFrame().locator('[id="chat:DavixwtRgY"]').click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Name' }).click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Name' }).fill('test');
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Email' }).click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Email' }).fill('testuser123@gmail.com');
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Phone' }).click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Phone' }).fill('911569846569');
  await page.locator('iframe').nth(1).contentFrame().getByText('* Enquiry').click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: '* Enquiry' }).fill('order');
  await page.locator('iframe').nth(1).contentFrame().getByRole('button', { name: 'Submit' }).click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: 'Type here and press enter..' }).click();
  await page.locator('iframe').nth(1).contentFrame().getByRole('textbox', { name: 'Type here and press enter..' }).fill('Hi, I have a question about my order');
  await page.locator('iframe').nth(1).contentFrame().getByRole('button', { name: 'Send' }).click();
  await page.locator('#qfqm3dnahe081778842626773').contentFrame().getByRole('button', { name: 'Chat widget' }).click();
});