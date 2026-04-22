// tools/Cleanup.spec.js
import { test,expect } from '@playwright/test';
// import { LoginPage } from '../../pages/LoginPage';
import { DelectQuote } from '../../pages/DeleteQuote';
import { CONFIG } from '../../utils/Config';

test.setTimeout(60000); // เผื่อเวลาให้โหมดกวาดขยะนานนิดนึง (3 นาที)
test.use({ storageState: 'uk_auth.json' });

test('Manual Cleanup: โหมดกวาดขยะทำมือ', async ({ page }) => {
    
    //const loginPage = new LoginPage(page);
    // await loginPage.performLogin();
    console.log('--- 🧹 เริ่มโหมดทำความสะอาดครั้งใหญ่ ---');

    // 🚀 สั่งบอทพุ่งตรงไปที่หน้า Dashboard ของ UK เลย!
      console.log('🚀 ใช้บัตร VIP ข้ามหน้า Login ทะลุตรงเข้า Dashboard...');
      await page.goto(CONFIG.url.dashboard);
    
      try {
            // 🟢 ลองค้นหาชื่อ Fluk (ให้เวลาหา 5 วินาที)
            await expect(page.locator('p:has-text("Hello, Fluk")')).toBeVisible({ timeout: 5000 });
            console.log('✅ คุกกี้ยังสดใหม่! ทะลุเข้าหน้า Dashboard สำเร็จครับเจ้านาย!');
            
        } catch (error) {
            // 🚨 แอบปริ้นท์ Error ตัวจริงออกมาดูหน่อยว่าพังเพราะอะไรกันแน่!
            console.error('รายละเอียด Error จริงๆ คือ:', error);
            // 🔴 ถ้าหาไม่เจอภายใน 5 วินาที (ด่านตรวจยิงสคริปต์ทิ้ง) จะเด้งมาเข้าบล็อกนี้แทน
            console.log('=========================================');
            console.log('❌ 🚨 สัญญาณเตือนภัย: คุกกี้หมดอายุแล้ว!! 🚨 ❌');
            console.log('กรุณาไปรันไฟล์ SaveLoginUK.spec.js เพื่อต่ออายุตั๋ว VIP ใหม่เดี๋ยวนี้เลยครับ!');
            console.log('=========================================');
            
            // สั่งให้สคริปต์นี้หยุดการทำงานและพังไปเลย (เพราะถ้าคุกกี้พัง รันสเต็ปต่อไปก็เออเร่ออยู่ดี)
            throw new Error('คุกกี้หมดอายุ (Session Expired) - ไม่สามารถไปต่อได้ครับ!');
        }

    

    // 2. เรียกหุ่นยนต์ลบงาน แล้วสั่งกวาดเรียบ 
    const delectQuotePage = new DelectQuote(page);
    console.log('⏳ กำลังสแกนและกวาดล้าง Booking ทั้งหมด...');
    await delectQuotePage.delectBooking(); 
    
    console.log('✅ กวาดขยะเสร็จสิ้น! ');
});