import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://www.edgewordstraining.co.uk/webdriver2/');
  //await page.getByRole('link', { name: 'Login To Restricted AREA', exact: true }).click({timeout: 5000});
  const textToSearchFor = 'Login to';
  await page.getByText(textToSearchFor).click();
  //const username = page.getByRole('row', { name: 'User Name?' }).locator('#username');
  //const username = page.locator('#username').nth(0); //aka first()
  //const username = page.locator('#username >> nth=0'); 
  const username = page.locator('#username').filter({ visible: true }).filter({})
  //const username = page.locator('#username:visible');
  //const username = page.locator('#username').visible();

  await username.click({ position: { x: 2, y: 2 }, button: 'right', clickCount: 2 });
  await username.dblclick();
  await username.fill('edgewords');
  await page.locator('#password').click();
  await page.locator('#password').fill('edgewords123');
  await page.getByRole('link', { name: 'Submit' }).click();
  await expect(page.locator('h1')).toContainText('Add A Record To the Database');

});

test('chaining locators vs within', async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/demo-site/product/cap/');
  const mainProductSection = page.locator('.summary.entry-summary');
  const addToCartButton = page.getByRole('button'); //Matches multiple on page buttons
  //await addToCartButton.hideHighlight();
  //await addToCartButton.click(); //Strict mode violation. Matches 8 elements.
  await mainProductSection.getByRole('button').click(); //Chaining - only one button in main
  await addToCartButton.within(mainProductSection).click(); //Within - get button in main
})

test('all products', async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/demo-site/');
  const newProducts = page.getByLabel('Recent Products');
  const targetProducts = newProducts.locator('h2:not(.section-title)');
  for (const prod of await targetProducts.all()) { //gathers a collection of all() matching elements
    console.log(await prod.textContent()); //then loops over each individual matches logging the text
  }; //No need to await console, but you do need to await the locator.textContent() . Or you will only get the "promise" of the text, not the actual text.
});

test('Locator Handler', async ({ page }) => { //How to handle unpredicatable modal "pop ups"
  // Setup the handler.
  const cookieConsent = page.getByRole('heading', { name: 'Hej! You are in control of your cookies.' });
  await page.addLocatorHandler(
    cookieConsent, //Locator to watch out for
    async () => { //If spotted, what to do
      //console.log("Spotted cookie consent")
      await page.getByRole('button', { name: 'Accept' }).click();
    }
    , //Optional arguments - can be omitted
    {
      times: 10, //How many times the locator may appear before the handler should stop handling the locator
      //By default Playwright will wait for the locator to no longer be visible before continuing with the test.
      noWaitAfter: false //this can be overridden however
    }
  );

  // Now write the test as usual. If during "actionability checks" the cookie prompt is spotted, it will be handled.
  await page.goto('https://www.ikea.com/');
  await page.getByRole('link', { name: "Fill your home with festive cheer" }).click();
  await expect(page.getByText('Bring the cheer')).toBeVisible();

  //If you're confident the locator will no longer be found you can de-register the handler
  //await page.removeLocatorHandler(cookieConsent);
  //If the cookie consent form appears from here on it may cause issues with the test...
  await page.locator('div.picker-container.svelte-sx0c1s div > a > span:nth-child(1)').hover(); //Need an actionability check here to trigger the locator if the cookie consent form appears on page 2 (i.e. didn't already get handled on page 1)
  await page.waitForTimeout(10000); //Big dumb wait before finishing the test
});

test('actions and assertions', async ({ page }) => {

  const slowExpect = expect.configure({ timeout: 8000 }); //Slow version of expect
  await page.goto('http://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Access Basic Examples Area' }).click();
  await page.getByRole('link', { name: 'Forms' }).click();
  //await expect(page).not.toHaveTitle('FormsXXX', {timeout: 7000});
  await expect.soft(page).not.toHaveTitle(/FoR.*/i, { timeout: 7000 }); //Soft expect - test will fail but execution can continue
  await expect(page).toHaveURL(/forms\.html$/);

  await expect(page.locator('h1')).toHaveText('Forms');
  await expect(page.locator('h1')).toContainText('or');

  await page.locator('#textInput').click();
  await page.locator('#textInput').fill('Steve');

  //Aria snapshot expect
  await expect(page.locator('#right-column')).toMatchAriaSnapshot(`
    - heading "Forms" [level=1]
    - paragraph: This form has an id of theForm.
    - table:
      - rowgroup:
        - row "Text Input with id/name textInput *":
          - cell "Text Input with id/name textInput *"
          - cell:
            - textbox
        - row "Text Area with id/name textArea":
          - cell "Text Area with id/name textArea"
          - cell:
            - textbox
        - row "Checkbox with id/name checkbox":
          - cell "Checkbox with id/name checkbox"
          - cell:
            - checkbox
        - row "Select with id/name select Selection One":
          - cell "Select with id/name select"
          - cell "Selection One":
            - combobox:
              - option "Selection One" [selected]
              - option "Selection Two"
              - option "Selection Three"
        - row "Radio buttons with id/name radio One Two Three":
          - cell "Radio buttons with id/name radio"
          - cell "One Two Three":
            - radio [checked]
            - text: ""
            - radio
            - text: ""
            - radio
            - text: ""
        - row "Password input with id/name password":
          - cell "Password input with id/name password"
          - cell:
            - textbox
        - row "File selector with id/name file Choose File":
          - cell "File selector with id/name file"
          - cell "Choose File":
            - button "Choose File"
        - row "Submit Clear":
          - cell
          - cell "Submit Clear":
            - link "Submit":
              - /url: "#"
            - link "Clear":
              - /url: "#"
        - row "* Mandatory field.":
          - cell "* Mandatory field."
    `);



  // await expect(page.locator('#textInput')).toHaveText('Steve'); //<input> is empty and has no text
  // await expect(page.locator('#textInput'),{message: "Wrong text found"}).toHaveValue(/Pt.*/);

  await page.locator('#textInput').fill('Stephen Powell');
  //await page.locator('#textInput').clear();
  await page.locator('#textInput').press('Control+a');
  await page.locator('#textInput').press('Backspace');
  await page.locator('#textInput').pressSequentially(' filled this is', { delay: 200 });
  await page.locator('#textArea').click();
  await page.locator('#textArea').fill('was\nhere\n');
  await page.locator('#checkbox').click(); //Toggle on/off
  await page.locator('#checkbox').check(); //Force on
  await page.locator('#checkbox').uncheck(); //Force off
  await page.locator('#select').selectOption('Selection Two');
  await page.locator('#three').check();
  await slowExpect.soft(page.locator('input[type="radio"]')).toHaveCount(2);


  await page.locator('#textInput').fill('Hello world');
  await expect(page.locator('#textInput')).toHaveScreenshot('textbox.png', { threshold: 0.5 });



  //await expect(page.getByRole('link', { name: 'Submit' })).toBeVisible(); //redundant check for button visibility before click()
  await page.getByRole('link', { name: 'Submit' }).click();
  //await expect(page.getByRole('rowgroup')).toContainText('Steve');
});

test('Drag drop', async ({ page }) => {
  await page.goto('/webdriver2/docs/cssXPath.html');
  //Dragging and dropping one element to another is simple:
  //await page.locator('div#one').dragTo(page.locator('div#two'))

  //Dragging and dropping one element is a little trickier:
  await page.dragAndDrop('#slider a', //Source
    '#slider a', //Target (same)
    {
      targetPosition: { x: 100, y: 0 }, //How far to drag
      force: true, //Dont do actionability checks (don't worry that we are dragging the source "outside" of itself)
      steps: 20
    } //Smooth the movement over 20 steps
  )
});

test('Simple file chooser', async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html');
  const fileChooserPromise = page.waitForEvent('filechooser'); //Set up event wait - NO AWAIT
  await page.getByRole('button', { name: 'Choose File' }).click(); //Do action that triggers file chooser
  const fileChooser = await fileChooserPromise; //Wait for the file chooser to appear
  await fileChooser.setFiles('./tests/example.spec.ts');
});

test('Drag drop files', async ({ page }) => {
  //test.abort('This test is currently failing due to a bug in Playwright. See');

  await page.goto('https://codyhouse.co/ds/components/app/drag-drop-file');
  await page.locator('iframe').contentFrame().locator('label').drop({
    files: { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }, //tsconfig.json file added to root to fix VS Code being unable to find Buffer type info
    //files: './tests/example.spec.ts' //Can use real file or create a file on the fly with a buffer
  });
  //test.skip(true, 'This test is currently failing due to a bug in Playwright. See https://github.com/microsoft/playwright/issues/12345');
});

test('Capturing Text', async ({ page }) => {

  await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html");
  await page.locator('#textInput').fill("Hello World");

  let textPromise = page.locator('#right-column').textContent();
  console.log("Without 'await'ing textContent() you get a 'promise' of the future text, not the actual text");
  console.log(textPromise);

  let rightColText = await page.locator('#right-column').textContent(); //Includes whitespace in HTML file

  console.log("The right column text is with textContent is: " + rightColText);

  rightColText = await page.locator('#right-column').innerText(); //Captures text after browser layout has happened (eliminating most whitespace)

  console.log("The right column text is with innertext is: " + rightColText);

  let textBoxText: string = await page.locator('#textInput').textContent() ?? ""; //TS: if textContent() returns null, retuen empty string "" instead
  console.log("The text box contains" + textBoxText); //blank as <input> has no inner text

  //Using generic $eval to get the browser to return the INPUT text
  //This will *not* retry or wait
  textBoxText = await page.$eval('#textInput', (el: HTMLInputElement) => el.value); //el is an in browser HTML element - not a Playwright object at all.

  console.log("The text box actually contains: " + textBoxText);

  await page.$eval('#textInput', elm => {
    console.log(typeof (elm)); //Writes to browser's console! Not NodeJS console.
  });

  await page.locator('#textInput').evaluate(elm => { //using locator().evaluate() the locator will be retried if no element found
    console.log(elm); //Also outputs to browser console.
  });

  expect(textBoxText).toBe("Hello World");
  await expect(page).toHaveTitle("Forms", { timeout: 5000 }) //Override global config with a custom expect timeout
});

test('Generic methods', { lock: 'cart' }, async ({ page }) => {
  //A comment
  await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html")

  const menuLinks = await page.$$eval('#menu a', (links) => links.map((link) => link.textContent))
  console.log(`There are ${menuLinks.length} links`)

  console.log("The link texts are:")

  for (const iterator of menuLinks) {
    console.log(iterator!.trim())
  }
  //$eval and $$eval DONT retry. If the locator doesnt find a matching element(s) then you get null.

  //Preferred - using retry-able Playwright locators
  //expect(await page.locator('#menu a').all()).toHaveLength(5) //Collection should have 5 members - do not cotinue until that is true
  const preferredLinks = await page.locator('#menu a').all();
  for (const elm of preferredLinks) {
    // const elmtext = await elm.textContent();
    // const elmtexttrimmed = elmtext?.trim(); //Combine these two steps below
    console.log(`${await elm.textContent().then(text => { return text?.trim() })}`)
  }
});

test.describe.configure({ timeout: 60000 }); //Override global config test timeout
test('waits', async ({ page }) => {
  page.setDefaultTimeout(12000); //Sets default *action* timeout (normally infinite, but limited by test timeout)
  const slowExpect = expect.configure({ timeout: 7000 }); //Use slowExpect to get 7s
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/index.html');
  await page.getByRole('link', { name: 'Dynamic Content' }).click();
  await page.locator('#delay').click();
  await page.locator('#delay').fill('10');
  await page.getByRole('link', { name: 'Load Content' }).click();
  //await page.locator('img[src$="apple.jpg"]').click({timeout: 11000});
  //await expect(page.locator('img[src$="apple.jpg"]')).toBeVisible(); //9s as configured in global playwright.config.ts now (normally 5s)
  // const apple = page.locator('img[src$="apple.jpg"]');
  // await apple.waitFor();
  const spinner = page.locator('#spinner-holder > img');
  await spinner.waitFor({ state: 'hidden' }); //Wait for loading spinner to go away


  await page.getByRole('link', { name: 'Home' }).click();

});

test('waitforfunction', async ({ page }) => {
  page.setDefaultTimeout(0); //No action timeout
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html');
  const textBox = page.locator('#textInput');
  await textBox.waitForFunction((textBox: HTMLInputElement) => textBox.value === 'Ready');
  console.log("Text box value is 'Ready'");
  await textBox.waitForFunction((textBox: HTMLInputElement, argValue) => { return textBox.value === argValue }, 'Set');
  console.log("Text box value is 'Set'. You now have 5 seconds to change it to 'Go'");
  await textBox.waitForFunction(
    (textBox: HTMLInputElement, argValue) => { return textBox.value === argValue },
    'Go',
    { timeout: 5000 } //Defaults to 0 - will wait until test timeout if not specified
  );
});

test("Waiting for a pop up window", async ({ page, context }) => {

  await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/dynamicContent.html");

  //[a,b] = [10,20] - aray destructuring syntax will assign a=10 b=20
  //Below we discard the second promise return value - we only need the first which gets us a handle to the new page
  const [newSpawnedPage] = await Promise.all([ //When these two "future" actions complete return the new page fixture
    context.waitForEvent('page'), //Returns the new page instance when done
    page.locator("#right-column > a[onclick='return popUpWindow();']").click(), //promise returns void (nothing)
  ]);

  //await page.pause();
  await page.waitForTimeout(2000); //Pause for 2s - try to avoid this as other wait types can exit early if condition is met


  const closeBtn = newSpawnedPage.getByRole('link', { name: 'Close Window' });
  await closeBtn.click();

  await page.getByRole('link', { name: 'Load Content' }).click();

});