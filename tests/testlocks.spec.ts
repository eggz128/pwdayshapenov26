import { test, expect } from '@playwright/test';
//All tests interact with a users ecommerce cart
//It is likely that parallel execution could cause race conditions

//test.describe.configure({ mode: 'serial' }); //Common fix, but:
//Workers are always shutdown after a test failure to guarantee pristine environment for following tests.
//This may lead to unexpected test skips if a previous test in a worker fails.
//Serial isn't just "run these in order top->bottom" but also "There is a test run dependency: if one fails, stop"

test.beforeEach('Setup for ecommerce cart tests', async ({ page }) => {
    //CHeck if storage state has been saved previously and load it if available
    const context = page.context();
    try {
        await context.setStorageState('./storageState.json');
    }
    catch (e) {
        console.log('No previous storage state found, doing a log in to capture it');
        await page.goto('https://www.edgewordstraining.co.uk/demo-site/my-account/');
        await page.getByRole('textbox', { name: 'Username or email address' }).click();
        await page.getByRole('textbox', { name: 'Username or email address' }).fill('auser@example.com');
        await page.locator('#password').click();
        await page.locator('#password').fill('example!password!');
        await page.getByRole('button', { name: 'Log in' }).click();
        await page.locator('#menu-item-43').getByRole('link', { name: 'Shop' }).click();
        await page.context().storageState({ path: 'storageState.json' });
    }
    //Add a cap to the cart
    await page.goto('https://www.edgewordstraining.co.uk/demo-site/product/cap/');
    await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await expect(page.getByText('“Cap” has been added to your')).toBeVisible();

});

//Before each logs in as a user and adds a cap to the cart
//test.describe.configure({ mode: 'serial' }); //Implies run order dependency
test('Set cap number to 20', {lock: 'cart'} ,async ({ page }) => {
    await page.locator('#menu-item-44').getByRole('link', { name: 'Cart' }).click();
    page.getByRole('spinbutton', { name: 'Product quantity' }).clear();
    await page.getByRole('spinbutton', { name: 'Product quantity' }).pressSequentially("20");
    await page.getByRole('spinbutton', { name: 'Product quantity' }).press('Enter');
    await expect(page.getByText('Cart updated.')).toBeVisible({timeout: 10000});
    await expect(page.locator('tr.cart_item').filter({ has: page.locator('td.product-name', { hasText: 'Cap' })}))
        .toContainText('£320');
});

test('Set cap number to 10' , {lock: 'cart'}, async ({ page }) => {
    await page.locator('#menu-item-44').getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('spinbutton', { name: 'Product quantity' }).clear();
    await page.getByRole('spinbutton', { name: 'Product quantity' }).pressSequentially("10");
    await page.getByRole('spinbutton', { name: 'Product quantity' }).press('Enter');
    await expect(page.getByText('Cart updated.')).toBeVisible();
    await expect(page.locator('tr.cart_item').filter({ has: page.locator('td.product-name', { hasText: 'Cap' })}))
        .toContainText('£160');
});

test('Remove cap from cart',{lock: 'cart'} , async ({ page }) => {
    await page.locator('#menu-item-44').getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Remove Cap from cart' }).click();
    await expect(page.getByText('“Cap” removed. Undo?')).toBeVisible();
    await expect(page.getByText('Your cart is currently empty.')).toBeVisible();
});


