// ไฟล์: tests/TestCase/SaveLoginUK.spec.js
import { test, expect } from '@playwright/test';
import { CONFIG } from '../../utils/Config'; // เช็ค Path ให้ตรงกับเครื่องคุณฟลุ๊คด้วยนะครับ

test('🤖 [UK] ดึง Cookies อัตโนมัติ (ไม่ต้องใช้คนกด)', async ({ page }) => {
    console.log('🔄 บอทกำลังแอบไปล็อกอินเว็บ UK...');
    await page.goto(CONFIG.url.login); 

    // จัดการ Popup กวนใจ 
    page.on('dialog', async dialog => dialog.accept().catch(() => {}));

    const usernameInput = page.locator('#name').first();
    const passwordInput = page.locator('#p').first();
    const loginButton = page.locator('#button').filter({ hasText: 'LOG IN' });

    await usernameInput.waitFor({ state: 'visible' });
    await passwordInput.waitFor({ state: 'visible' });

    // บอทพิมพ์รหัสเองเลย ไม่ต้องรอคน!A
    await usernameInput.fill(CONFIG.systemUser.name);
    await passwordInput.fill(CONFIG.systemUser.pass);
    await loginButton.click();

    // ดักจับ Session Expired ตามลอจิกเดิม
    try {
        await page.locator('text=Session was expired').waitFor({ state: 'visible', timeout: 3000 });
        console.log('⚠️ Session หลุด! กำลังบังคับไปหน้า Dashboard...');
        await page.goto(CONFIG.url.dashboard);
    } catch (e) {
        console.log('✅ Login ทะลวงผ่านปกติ');
    }

    // รอให้มั่นใจว่าเข้าหน้า Dashboard ได้ชัวร์ๆ
    await expect(page.locator('p:has-text("Hello, Fluk")')).toBeVisible({ timeout: 15000 });
    console.log('🎉 เข้า Dashboard สำเร็จ! กำลังดูด Cookies...');

    // 🌟 ไฮไลท์สำคัญ: เซฟคุกกี้ใส่ถุงชื่อ uk_auth.json
    await page.context().storageState({ path: 'uk_auth.json' });
    console.log('✨ เซฟไฟล์ uk_auth.json สำเร็จ! บอทตัวนี้หมดหน้าที่แล้วครับ ไปลุยเทสต์หลักต่อได้เลย!');
});