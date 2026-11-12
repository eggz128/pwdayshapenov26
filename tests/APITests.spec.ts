import { request, test, expect } from '@playwright/test';
//Run against https://github.com/edgewords/EdgeAPIserver
// or https://github.com/eggz128/EdgeAPIserverNode
// npx github:eggz128/EdgeAPIserverNode

test('Broser as rest client', async ({ page }) => {
    await page.context().request.get("https://www.google.com");
});

test('API web first', async ({ request }) => {
    let response = await request.get('http://localhost:2002/api/products');
    expect(response).toBeOK(); //Actually checks for 200-299 as response code, not just 200 OK
})

let baseRequestUrl = 'http://localhost:2002/api';

test('Simple Get', async ({ request }) => {
    const resp = await request.get('http://localhost:2002/api/products/1');
    try {
        expect(resp.status()).toBe(200);
    } catch (error) {
        console.log(`Simple GET failed with ${resp.statusText()}`);
        throw error;
    }
});

test('Check GET response body', async ({ request }) => {
    const resp = await request.get(baseRequestUrl + '/products/1')
    try {
        expect.soft(resp.status()).toEqual(200) //soft asserts to allow multiple checks
        expect.soft(await resp.json()).toHaveProperty('price')
        expect.soft(await resp.json()).toMatchObject({
            "id": 1,
            "name": "iPadX",
            "price": 500
        })

    } catch (error) {
        console.log("Simple GET request failed with status :" + resp.statusText())
        throw error
    }
})

test('URL query params', async ({ request }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('id', '1');
    const response = await request.get(
        'http://localhost:2002/api/products',
        {
            params: searchParams,
            //params: 'id=1' // or as a string
        } //Creates http://localhost:2002/api/products/?id=1
    );
    console.log((await response.body()).toString());
})

test('Basic auth', async ({ playwright }) => {
    const request = await playwright.request.newContext({ //new context required (different from norm without basic auth)
        baseURL: baseRequestUrl,
        httpCredentials: {
            username: 'edge',
            password: 'edgewords'
        }
    });
    const resp = await request.get(baseRequestUrl + '/users');
    expect(resp.status()).toEqual(200);
    console.log((await resp.body()).toString());
});

test('POST a new product', async ({ request }) => {
    const newProd = await request.post(baseRequestUrl + '/products', {
        data: {
            name: 'RazorMouse',
            price: 20,
        },
    });
    expect.soft(newProd.status()).toEqual(201);

    const jsonData = await newProd.json();
    console.log('New product created with id: ' + jsonData.id);

})


test('Copied request', async ({ page }) => {
    await page.request.get('https://playwright.dev/', {
        headers: {
            Host: 'playwright.dev',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:159.0) Gecko/20100101 Firefox/159.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }
    });
})