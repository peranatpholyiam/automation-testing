// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [[ 'html' , { open: 'always' }]],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  
  use: {
    // 📸 ตั้งค่าการแคปรูป:
    screenshot: 'on',  // 'on' = ถ่ายรูปทุกเคส (เอาไว้เป็นหลักฐาน)
                       // 'only-on-failure' = ถ่ายเฉพาะตอนเทสต์ตก (ประหยัดที่สุดๆ)

    // 🎥 ตั้งค่าการอัดวิดีโอ (ถ้ากลัวเปลืองที่ ให้แก้ตามนี้):
    video: 'on', // อัดวิดีโอไว้ "เฉพาะตอนที่เทสต์พัง" เท่านั้น (ถ้าผ่านจะไม่เก็บไฟล์วีดีโอให้หนักเครื่อง)
    // video: 'off', // หรือปิดวิดีโอไปเลยถ้าไม่เอา

    // ขนาดหน้าจอ
     // โชว์หน้าจอตอนรั

    // เลือกตั้งค่าแบบใดแบบหนึ่ง:
    //video: 'on', // อัดวิดีโอทุกครั้งที่รันเทสต์
    // video: 'retain-on-failure', // อัดเฉพาะตอนที่เทสต์ตก (Failed) เท่านั้น (ช่วยประหยัดที่ได้ดีมาก)
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    viewport: null,
    headless: false,
    

    // 2. คำสั่งพระเอก: สั่งเบราว์เซอร์ว่า "เปิดปุ๊บ ขยายเต็มจอคอมพิวเตอร์ปั๊บ!" 
    launchOptions: {
      args: ['--start-maximized']
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

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

