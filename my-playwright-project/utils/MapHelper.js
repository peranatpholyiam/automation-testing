// utils/MapHelper.js
export class MapHelper {
  constructor(page) {
    this.page = page;
  }

  async dragMarker(moveX, moveY) {
    const marker = this.page.locator('.mapboxgl-marker:visible').last();
    await marker.waitFor({ state: 'visible', timeout: 10000 });
    
    const box = await marker.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.waitForTimeout(500);
      await this.page.mouse.move(box.x + moveX, box.y + moveY, { steps: 50 });
      await this.page.waitForTimeout(500);
      await this.page.mouse.up();
      await this.page.waitForTimeout(2000);
      console.log(`📍 ลากหมุดสำเร็จ (X: ${moveX}, Y: ${moveY})`);
    } else {
      console.log("⚠️ หาหมุดไม่เจอ");
    }
  }

  async closeMapWindow() {
      // 🎯 ใช้ class .hand และ Text ตามรูปที่ 4
      await this.page.locator('a.hand:has-text("Close")').click();
  }
}