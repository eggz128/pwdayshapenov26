import { test, expect} from '@playwright/test';

test('Screenshots',{ annotation: [{type: 'Custom annotation', description: 'Here is  a link https://www.google.com/'}]} ,async({page, browserName}, testInfo)=>{
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/basicHtml.html');
    const screenshot = await page.screenshot(); //Capture screenshot bitmap in variable. Note there is not an easy way to assert on this currently. See workaround test.
    await page.screenshot({ path: './manualscreenshots/screenshot-viewport.png' });
    await page.screenshot({ path: './manualscreenshots/screenshot-fullpage.png', fullPage: true });


    //await page.locator('#doesnotexist').click();

    const htmlTable = page.locator('#htmlTable');

    await htmlTable.screenshot({path: './manualscreenshots/table-webp-lossless.webp', quality: 1})


    await htmlTable.screenshot({ path: './manualscreenshots/screenshot-table.png' }); //Just the table, not the whole page

    await page.locator('#htmlTable').screenshot({
      path: './manualscreenshots/highlight-htmltable.png',
      mask: [page.locator('#TableVal2')], //Redact or highlight this element
      maskColor: 'rgba(214, 21, 179,0.5)', //default mask colour is magenta #ff00ff
      style: ` #htmlTable tr:nth-child(3) {border: 10px solid red}
            table#htmlTable {border-collapse: collapse}
    ` //HTML table rows cannot have a border unless the table's border collapse model is set to collapse
    })

    if (browserName === "chromium") { //PDF generation only works on Chromium browsers, and can be headless/headed (error is misleading)
      await page.pdf({ path: './manualscreenshots/printed.pdf' })
    }

    console.log("Appears in std out section of the report") //In report at bottom, displayed in terminal at run time
    //Attaching arbitary data to the report.
    await testInfo.attach('Write some arbitary text to the report', { body: 'Hello World', contentType: 'text/plain' });
    await testInfo.attach('Masked Screenshot', { path: './manualscreenshots/highlight-htmltable.png', contentType: 'image/png' });
    await testInfo.attach('Screenshot from variable', { body: screenshot, contentType: 'image/png' });
    testInfo.annotations.push({type: 'Runtime annotation',description:'Added during the test run'});
})

test("compare runtime images",  async ({ page, browserName }, testInfo) => {
    await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html");

    await page.locator('#textInput').fill("Hello World"); //Set intial state

    //ToDo: capture screenshot of text box in memory
    //Capture in mem is easy - doing the expect on it after, not so much as PlayWright expect .toMatchSnapshot() expects the screenshot to be on disk
    //See https://github.com/microsoft/playwright/issues/18937

    //const originalimage = await page.locator('#textInput').screenshot();
    //originalimage is now a buffer object with the screenshot. You could use a 3rd party js lib to do the comparison... but if we're sticking to Playwright only...

    //await expect(page.locator('#textInput')).toHaveScreenshot('textbox')
    //No good as PW wants to capture the screenshot on the first run and use that screenshot for following runs. We want to capture and use on this run. So...

    await page.locator('#textInput').screenshot({ path: `${testInfo.snapshotDir}/textbox2-${browserName}-${testInfo.snapshotSuffix}.png` })
    //screenshots will need to vary by browser and OS, and be saved in to the test snapshot directory for .toMatchSnapshot() to find them


    //Change element text
    await page.locator('#textInput').fill("Hello world"); //Alter the state (right now this is the same as initially set so following expect *should* pass)
    //change to e.g. "Hello world"

    //Recapture screenshot, compare to previous (on disk) version.
    expect(await page.locator('#textInput').screenshot()).toMatchSnapshot('textbox2.png')

    //Now go look at the html report
});

test('Manual videos', async ({ page }) => {
    await page.goto('https://www.edgewordstraining.co.uk/demo-site/');
    //Manually start a video recording (instead of having it turned on for all tests in playwright.config.ts )
    await page.screencast.start({ path: './manualvideos/video.webm'}); //Options object also has properties for setting video size and quality

    let overlay = await page.screencast.showOverlay( //Inject some HTML (and style) for display during the recording
        `<div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: red;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            animation: fadeInOut 1.5s infinite;
        ">
        Recording
        </div>
        <style>
            @keyframes fadeInOut {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        </style>`
    ); //This (along with action annotations, chapters etc) is injected in to the page using a custom pw HTML element and shadow-dom. It shouldn't interfere with the AUT.
    
    //All PW actions performed are captioned on-screen
    await page.screencast.showActions({ position: 'top-left' }); //You can also do this when starting the recording with the 'annotate' property on the options object
    
    await page.screencast.showChapter('Adding a cap to the cart', { //Create "chapters" to inform the viewer what they are about to see.
        description: 'Adding a cap via search',
        duration: 1000,
    })

        await page.getByRole('searchbox', { name: 'Search for:' }).click();
        await page.getByRole('searchbox', { name: 'Search for:' }).fill('cap');
        await page.getByRole('searchbox', { name: 'Search for:' }).press('Enter');
        await page.getByRole('button', { name: 'Add to cart' }).nth(0).click();
        await page.locator('#content').getByRole('link', { name: 'View cart ' }).click();

    await page.screencast.showChapter('Clearing the cart', {
        description: 'Removing the cap from the cart',
        duration: 1000,
    });

        // await page.getByRole('link', { name: 'Remove Cap from cart' }).click();
        // await page.getByRole('link', { name: 'Return to shop' }).click();
    
    //await page.screencast.hideOverlays(); //Hide the custom overlay. 
    //await page.screencast.hideActions(); //You could also stop the PW Action annotations at any time during the run.
    //await page.screencast.showOverlays(); //This would bring back the overlay as it's not actually "gone", just hidden.
    await overlay.dispose(); //Actually destroys the overlay

        await page.locator('#menu-item-42').getByRole('link', { name: 'Home' }).click();


    
    {
        await using customOverlay = await page.screencast.showOverlay('<dialog open>Hello</dialog>');
        await page.goto('https://www.google.com');
        await page.waitForTimeout(3000);
        //no need for 
        //customOverlay.dispose();
    } //as dispose() will automatically be called when variable falls out of block scope here.

    await page.waitForTimeout(3000);
    
    await page.screencast.stop(); //and write the video to disk.
    //Just like manual screenshots, manual videos are not automatically attached to the report. use testInfo to attach the video to the report
    //webm videos have a mime type of 'video/webm'
});

test('highlight', async ({page}) =>{
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html');
    await page.locator('input').highlight({style: 'border: 2px dotted red'});
    await page.screenshot({path: './manualscreenshots/pageWithHighlight.png'});
    await page.waitForTimeout(3000)
    await page.locator('input').hideHighlight();
    await page.screenshot({path: './manualscreenshots/pageWithoutHighlight.png'});
})