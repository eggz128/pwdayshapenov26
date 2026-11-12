import {test, expect} from '@playwright/test';
//These tests expect to be logged in to work
//That is achieved via setup (and teardown) projects defined in the playwright.config.ts file
//Setup does a log in, then stores the login cookie
//When these tests are run, the project restores the stashed cookies in to the browser before execution.
test.beforeEach(async ({ page }) => {
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/sdocs/add_record.php');
});

test('Should already be logged in', async ({ page }) => {
    
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Add A Record');
    await page.waitForTimeout(1000);

});

test('Should already be logged in2', async ({ page }) => {
    
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Add A Record');
    await page.waitForTimeout(1000);

});