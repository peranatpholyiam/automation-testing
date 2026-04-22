// pages/LoginPage.js
import { expect } from '@playwright/test';
import { CONFIG } from '../utils/Config';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async performLogin() {
    console.log('🔄 เริ่มต้น Login...');
    await this.page.goto(CONFIG.url.login);

    this.page.on('dialog', async dialog => dialog.accept().catch(() => {}));
    
    
    const usernameInput = this.page.locator('#name').first();; 
    const passwordInput = this.page.locator('#p').first();;
    const loginButton = this.page.locator('#button').filter({ hasText: 'LOG IN' });

    // สั่งให้รอจนกว่าป๊อปอัพจะหายไป และช่อง Username (#name) จะโผล่มาให้เห็นจริงๆ
    await usernameInput.waitFor({ state: 'visible' });
    await passwordInput.waitFor({ state: 'visible' });
    // พอเห็นแล้วก็พิมพ์ต่อได้เลย 
    await usernameInput.click();
    await usernameInput.fill(CONFIG.systemUser.name);
    await passwordInput.click();
    await passwordInput.fill(CONFIG.systemUser.pass);

    //ตรวจสอบก่อนกดว่าข้อมูลถูกกรอกลงไปจริงๆ หรือยัง
    const typedUser = await usernameInput.inputValue();
    if (!typedUser) {
        console.log('⚠️ ข้อมูลวืด! กำลังลองกรอกซ้ำ...');
        await usernameInput.click();
        await usernameInput.fill(CONFIG.systemUser.name);
        await passwordInput.click();
        await passwordInput.fill(CONFIG.systemUser.pass);
    }
    await loginButton.click();

   try {
      await this.page.locator('text=Session was expired').waitFor({ state: 'visible', timeout: 3000 });
      console.log('⚠️ Session หลุด! กำลังกลับไปหน้าล็อคอิน...');
      await this.page.goto(CONFIG.url.dashboard);
    } catch (e) {
      console.log('✅ Login ปกติ');
    }

    // ✅ เช็คว่า Login สำเร็จโดยดูจาก <p>Hello, Fluk</p>
    await expect(this.page.locator('p:has-text("Hello, Fluk")')).toBeVisible();
  }
}