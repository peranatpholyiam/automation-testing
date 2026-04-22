import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { BookingPage } from '../../pages/BookingPage';
import { DelectQuote } from '../../pages/DeleteQuote';
import { CONFIG } from '../../utils/Config';
import { readCsv } from '../../utils/csvReader';

test.setTimeout(600000); // เผื่อเวลาให้การจองนานหน่อย (3 นาที)

test.use({ storageState: 'uk_auth.json' });

// ===============================================================
// 🌍 กฎระดับหมู่บ้าน (Global Setup & Teardown)
// ===============================================================
// let loginPage;
/** @type {BookingPage} */
let bookingPage;

/** @type {DelectQuote} */
let delectQuotePage;

test.beforeEach(async ({ page }) => {

  //const loginPage = new LoginPage(page);
  bookingPage = new BookingPage(page);
  delectQuotePage = new DelectQuote(page);
  // await loginPage.performLogin();

  // 🚀 สั่งบอทพุ่งตรงไปที่หน้า Dashboard ของ UK เลย!
  console.log('🚀 ใช้บัตร VIP ข้ามหน้า Login ทะลุตรงเข้า Dashboard...');
  await page.goto(CONFIG.url.dashboard);

  try {
      // 🟢 ลองค้นหาชื่อ Fluk (ให้เวลาหา 5 วินาที)
      await expect(page.locator('p:has-text("Hello, Fluk")')).toBeVisible({ timeout: 5000 });
      console.log('✅ คุกกี้ยังสดใหม่! ทะลุเข้าหน้า Dashboard สำเร็จครับเจ้านาย!');
      
  } catch (error) {
      console.error('รายละเอียด Error จริงๆ คือ:', error);
      // 🔴 ถ้าหาไม่เจอภายใน 5 วินาที (ด่านตรวจยิงสคริปต์ทิ้ง) จะเด้งมาเข้าบล็อกนี้แทน
      console.log('=========================================');
      console.log('❌ 🚨 สัญญาณเตือนภัย: คุกกี้หมดอายุแล้ว!! 🚨 ❌');
      console.log('กรุณาไปรันไฟล์ SaveLoginUK.spec.js เพื่อต่ออายุตั๋ว VIP ใหม่เดี๋ยวนี้เลยครับ!');
      console.log('=========================================');
      
      // สั่งให้สคริปต์นี้หยุดการทำงานและพังไปเลย (เพราะถ้าคุกกี้พัง รันสเต็ปต่อไปก็เออเร่ออยู่ดี)
      throw new Error('คุกกี้หมดอายุ (Session Expired) - ไม่สามารถไปต่อได้ครับ!');
  }
});

test('ทดสอบรัน Data-Driven (เลือกโหมดได้ตามใจชอบ)', async () => {
    
    const records = readCsv('booking_data.csv');

    // ==============================================================
    // 🎛️ เลือกเปิด/ปิด โหมดการทำงานได้เลย!
    // ==============================================================

    // 🟢 โหมดที่ 1: โหมดหลายข้อมูล
    // await bookingPage.createUniqueBookingsMultipleRoundsAndCleanup(1, records, delectQuotePage);


    // 🔴 โหมดที่ 2: โหมดข้อมูลเดียว 
    const selectedJob = records[0]; 
    await bookingPage.createMultipleBookingsAndCleanup(1, delectQuotePage, selectedJob);
  });