import { expect } from '@playwright/test';
import { test } from './my-test';
import Credentials from '../tests/TestData/logins.json'

for (const creds of Credentials) {
  test(`Login data driven with ${creds.username}`, async ({ page }) => {
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
    await page.getByRole('link', { name: 'Login To Restricted Area' }).click();
    await page.getByRole('row', { name: 'User Name?' }).locator('#username').click();
    await page.getByRole('row', { name: 'User Name?' }).locator('#username').pressSequentially(creds.username, { delay: 200 });
    await page.locator('#password').click();
    await page.locator('#password').pressSequentially(creds.password);
    await page.getByRole('link', { name: 'Submit' }).click();
    await expect(page.locator('h1')).toContainText('Add A Record To the Database');
  });
}

test('Data drive login with env vars',{lock: 'cart'} , async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Login To Restricted Area' }).click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').pressSequentially(process.env.PWTESTUSERNAME ?? "", { delay: 200 });
  await page.locator('#password').click();
  await page.locator('#password').pressSequentially("edgewords123");
  await page.getByRole('link', { name: 'Submit' }).click();
  await expect(page.locator('h1')).toContainText('Add A Record To the Database');
});

test('Data drive login with project param', async ({ page, person}) => {
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Login To Restricted Area' }).click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').pressSequentially(person, { delay: 200 });
  await page.locator('#password').click();
  await page.locator('#password').pressSequentially("edgewords123");
  await page.getByRole('link', { name: 'Submit' }).click();
  await expect(page.locator('h1')).toContainText('Add A Record To the Database');
});

