import { defineConfig, devices } from '@playwright/test';
import { TestOptions } from './tests/my-test'

export const STORAGE_STATE = 'user.json'
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  testDir: './tests',
  timeout: 30_000, //Test timeout (30s by default)
  expect: {timeout: 9000}, //Expect timeout
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
            ['html', { title: 'Custom test run' }],
            ['json', { outputFile: 'json-results/testresults.json' }]
    ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://www.edgewordstraining.co.uk/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    actionTimeout: 7000, //Normally infinite - now actions must complete in 7s
    // launchOptions: {slowMo: 1000}
  },

  /* Configure projects for major browsers */
  projects: [

    {
      name: 'setup',
      testMatch: 'globalSetup.ts',
      timeout: 2 * 60 * 1000,
      teardown: 'teardown'
    },
    {
      name: 'teardown',
      testMatch: 'globalTeardown.ts',
      use: { storageState: STORAGE_STATE }
    },



    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], 
        person: 'Bob',
        storageState: STORAGE_STATE,
       },
      default: false,
      dependencies: ['setup']
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'],
         person: 'Alice',
        storageState: STORAGE_STATE,
       },
       dependencies: ['setup']
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 17e'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
