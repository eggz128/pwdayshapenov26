import { test as base } from '@playwright/test'

export const test = base.extend<{forEachTest: void}, {forEachWorker: void}>({
    forEachTest: [async ({page},use)=>{
        //beforeEach
        console.log('Global beforeEach')
        await page.goto('http://www.google.com')
        console.log('Navigated to Google')


        await use(); //Do the test. Dont forget this or the tests will just spin and timeout

        //afterEach
        console.log('Global afterEach')
        console.log('Last URL:', page.url())
    }, {auto:true}],
    forEachWorker: [async ({},use)=>{
        //BeforeAll
        console.log('Global beforeAll')
        console.log(`Starting test worker ${test.info().workerIndex}`)


        await use(); //Do the test. Dont forget this or the tests will just spin and timeout

        //AfterAll
        console.log('Global afterAll')
        console.log('Finished with worker')
    }, {scope: 'worker', auto:true}],


})