// pages/DeleteQuote.js
import { expect } from '@playwright/test';
import { CONFIG } from '../utils/Config';

export class DelectQuote {
  constructor(page) {
    this.page = page;
  }

  async delectBooking(quoteId = null,dateRangeInfo) {
    console.log('🗑️ เริ่มกระบวนการลบ Quote...');
    
    // ดักจับ Popup ของเบราว์เซอร์ล่วงหน้า (กดยอมรับเสมอ)
    this.page.on('dialog', async dialog => {
        console.log(`💬 เบราว์เซอร์เด้ง: ${dialog.message()} -> บอทจัดการกด OK ให้แล้ว!`);
        await dialog.accept().catch(() => {});
    });

    // นำทางไปหน้า Bookings
    await this.page.locator('.treeview:has-text("Jobs")').click();
    await this.page.locator('a:has-text("Bookings")').first().click();
    await this.page.waitForLoadState('networkidle');
    
    // // // 1. การเลือกปฎิทิน
    // const startDatePicker = this.page.locator('#date_start'); 
    // await startDatePicker.click(); 

    // const switchToMonth = this.page.locator('.datepicker-days .datepicker-switch');
    // await switchToMonth.click();

    // const switchToYear = this.page.locator('.datepicker-months .datepicker-switch');
    // await switchToYear.click();
    
    // const targetYear = '2027'; 
    // const yearButton = this.page.locator(`.year:text-is("${targetYear}")`).filter({ state: 'visible' });
    // await yearButton.click();

    
    // const targetMonth = 'Jan'; 
    // const monthButton = this.page.locator(`.month:text-is("${targetMonth}")`).filter({ state: 'visible' });
    // await monthButton.click();

    
    // const targetDay = '1'; 
    
    // const dayButton = this.page.locator(`.day:not(.old):not(.new):text-is("${targetDay}")`).filter({ state: 'visible' });
    // await dayButton.click();

    // ========================================================
    // 🪄 สเต็ปดึงวันที่ (รองรับ 2 โหมด: CSV และ CONFIG)
    // ========================================================
    let formattedStart = ""; 
    let formattedEnd = "";
        
    if (dateRangeInfo) {
        // 🟢 โหมดที่ 1: รันแบบมี CSV ส่งข้อมูลมาให้
        formattedStart = dateRangeInfo.startDate; 
        if (dateRangeInfo.endDate) {
            formattedEnd = dateRangeInfo.endDate;
        }
        console.log(`🔍 ดึงวันที่มาจากข้อมูล CSV: ${formattedStart} ${formattedEnd ? 'ถึง ' + formattedEnd : '(วันเดียว)'}`);
    } else {
        // 🔴 โหมดที่ 2: รันกวาดขยะทำมือ (ดึงจาก CONFIG)
        formattedStart = CONFIG.Date.StartdateBooking;
        formattedEnd = CONFIG.Date.EnddateBooking; 
        console.log(`🧹 ดึงวันที่จากไฟล์ CONFIG: ${formattedStart} ถึง ${formattedEnd}`);
        // console.log(`🧹 ดึงวันที่จากไฟล์ CONFIG: ${formattedStart} `);
    }

    // ========================================================
    // 🎯 1. กรอกวันเริ่มต้น (อันนี้ต้องทำเสมอ ไม่ว่าโหมดไหน)
    // ========================================================
    const startDatePicker = this.page.locator('#date_start'); 
    await startDatePicker.clear(); 
    await startDatePicker.pressSequentially(formattedStart, { delay: 0.5 });
    await startDatePicker.dispatchEvent('input');
    await startDatePicker.dispatchEvent('change');
    await startDatePicker.press('Enter');
        
    // ========================================================
    // 🎯 2. กรอกวันสิ้นสุด (ทำเฉพาะเมื่อมี formattedEnd ส่งมา!)
    // ========================================================
    if (formattedEnd) {
        console.log(`🔍 กรอกช่อง End Date ด้วย: ค้นหางานวันที่ ${formattedStart} ถึง ${formattedEnd}`);
        const endDatePicker = this.page.locator('#date_end');
        await endDatePicker.clear(); 
        await endDatePicker.pressSequentially(formattedEnd, { delay: 0.5 });
        await endDatePicker.dispatchEvent('input');
        await endDatePicker.dispatchEvent('change');
        await endDatePicker.press('Enter');
    } else {
        console.log(`🔍 ข้ามช่อง End Date: ให้เว็บ Auto-fill ช่องหลังให้อัตโนมัติ`);
    }

    // ========================================================
    // 🎯 3. รอโหลดตาราง (โค้ดกันเหนียวของคุณฟลุ๊ค)
    // ========================================================
    const loadingOverlay = this.page.locator('.k-loading-mask').first(); 
    await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
    await this.page.locator('#grid_listbooking tbody[role="rowgroup"]').waitFor({ state: 'attached', timeout: 15000});
    await this.page.waitForLoadState('networkidle');

    
    await this.page.keyboard.press('Enter');
    await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
    await this.page.locator('#grid_listbooking tbody[role="rowgroup"]').waitFor({ state: 'attached', timeout: 15000});
    await this.page.waitForLoadState('networkidle');

    // ---------------------------------------------------------
    // 🔄 เริ่มกระบวนการลบ
    // ---------------------------------------------------------

    // ==========================================
    // 🎯 โหมดที่ 1: โหมด Sniper (ลบด้วย Quote ID ถ้าส่งมา)
    // ==========================================

    if (quoteId !== null) {
        const sniperTargets = Array.isArray(quoteId) ? quoteId : [quoteId];
        console.log(`ได้รับไอดีงานทั้งหมด ${sniperTargets.length} รายการ!`);

        let hasTargetsLeft = true;
        let scanRound = 1; // ตัวนับรอบการค้นหาโดยรวม (ไม่จำกัด)
        let failedAttemptCount = 0; // 🛡️ ตัวนับจำนวนครั้งที่ "ลบไม่สำเร็จติดต่อกัน"
        const maxFailedAttempts = 5; // ขีดจำกัดความอดทน ถ้าลบหน้าเดิมซ้ำๆ ไม่เข้า 5 ครั้ง ให้หยุด!

        while (hasTargetsLeft) {
            console.log(`\n===========================================`);
            console.log(` 🏁 เริ่มสแกนค้นหางานที่ต้องลบ รอบที่ ${scanRound} `);
            console.log(`===========================================`);

            let foundCount = 0;

            // -------------------------------------------------------------
            // 🚀 สเต็ปที่ 1: วนลูปสแกนหา ID บนหน้าจอ "ปัจจุบัน"
            // -------------------------------------------------------------
            for (const targetId of sniperTargets) {
                const targetRow = this.page.locator('tbody tr').filter({ hasText: String(targetId) });
                if (await targetRow.count() > 0) {
                    const checkbox = targetRow.locator('input[name="quote_id[]"]');
                    await checkbox.click(); 
                    await expect(checkbox).toBeChecked();
                    console.log(`✅ ติ๊กเลือก Quote ID [${targetId}] สำเร็จ!`);
                    foundCount++;
                }
            }

            // -------------------------------------------------------------
            // 🚀 สเต็ปที่ 2: ตัดสินใจกดยิง หรือ หยุด
            // -------------------------------------------------------------
            if (foundCount > 0) {
                console.log(`💥 เจอ ${foundCount} รายการ! กำลังกดลบ...`);
                
                await this.page.waitForLoadState('networkidle');
                await expect(this.page.locator('#do_action')).toBeVisible();
                await this.page.locator('#do_action').selectOption(CONFIG.DeleteOption.delete);

                const reasonSelect = this.page.locator('.delform select[name="reason"]');
                await reasonSelect.waitFor({ state: 'visible' });
                await this.page.waitForTimeout(500);
                await reasonSelect.selectOption(CONFIG.DeleteOption.reason);
                await reasonSelect.dispatchEvent('change');
                
                const confirmBtn = this.page.locator('#submit_delete');
                await expect(confirmBtn).toBeEnabled({ timeout: 10000 }); 
                await confirmBtn.click();
                    
                // รอให้เว็บอัปเดตตาราง
                await this.page.locator('.delform').waitFor({ state: 'hidden', timeout: 15000 });
                const loadingOverlay = this.page.locator('.k-loading-mask').first();
                await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}); 
                await loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
                await this.page.locator('#grid_listbooking tbody[role="rowgroup"]').waitFor({ state: 'attached', timeout: 15000 });
                await this.page.waitForLoadState('networkidle');

                console.log(`✨ กดลบรอบที่ ${scanRound} เสร็จสิ้น! ตารางอัปเดตแล้ว กำลังเช็คความเรียบร้อย...`);
                
                // 🕵️‍♂️ เช็คด่วนว่า ลบสำเร็จจริงไหม? หรือเว็บแกล้ง Cannot Delete?
                let stillFoundCount = 0;
                for (const targetId of sniperTargets) {
                    if (await this.page.locator('tbody tr').filter({ hasText: String(targetId) }).count() > 0) {
                        stillFoundCount++;
                    }
                }

                if (stillFoundCount > 0 && stillFoundCount === foundCount) {
                    // ถ้าจำนวนที่เจอเท่าเดิมเป๊ะ แปลว่าลบไม่เข้าเลย!
                    failedAttemptCount++;
                    console.log(`⚠️ คำเตือน: ระบบเว็บลบข้อมูลไม่สำเร็จ (รอบแก้ตัวที่ ${failedAttemptCount}/${maxFailedAttempts})`);
                    
                    if (failedAttemptCount >= maxFailedAttempts) {
                        throw new Error(`💥 ระบบเว็บพังรุนแรง! พยายามลบข้อมูลหน้าเดิมซ้ำ ${maxFailedAttempts} ครั้งแล้วแต่ระบบไม่ยอมลบ! ยุติการทำงาน`);
                    }
                } else {
                    // ถ้าลบสำเร็จ (ถึงแม้จะไม่หมด แต่ขยับไปหน้าถัดไปได้) ให้รีเซ็ตตัวนับการล้มเหลว
                    failedAttemptCount = 0; 
                }

                scanRound++;
                
            } else {
                console.log(`🤷‍♂️ สแกนหน้าปัจจุบันไม่เจอข้อมูลการลบหลงเหลืออยู่แล้ว! `);
                hasTargetsLeft = false; // ทะลวงออกจากลูป while ทันที
            }
        }

        // =========================================================
        // 🚨 สเต็ปที่ 3: ด่านตรวจเช็คซ้ำ (เช็คบิลตอนจบ เพื่อความชัวร์)
        // =========================================================
        console.log(`\n🔎 เช็คขยะหลังจากการลบว่าข้อมูลเหลืออยู่หรือไม่?`);
        
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
        const finalLoading = this.page.locator('.k-loading-mask').first();
        await finalLoading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await finalLoading.waitFor({ state: 'hidden', timeout: 30000 });

        let stubbornJobs = []; 

        for (const targetId of sniperTargets) {
            const remainingRow = this.page.locator('tbody tr').filter({ hasText: String(targetId) });
            if (await remainingRow.count() > 0) {
                stubbornJobs.push(targetId);
            }
        }
        
        if (stubbornJobs.length > 0) {
            expect(stubbornJobs.length, `🚨 แจ้งเตือนบั๊ก!: ข้อมูลค้างในระบบ ${stubbornJobs.length} รายการ ได้แก่ ID: [${stubbornJobs.join(', ')}]`).toBe(0);
        } else {
            console.log(`🎉 ตรวจสอบผ่าน!: ไม่มีข้อมูลตกหล่น!`);
        }
        
        return; 
    }
    // ==========================================
    // 🧹 โหมดที่ 2: โหมดกวาดขยะ (ค้นหา ชื่อ+อีเมล และลุยทุกหน้า)
    // ==========================================
    
    console.log(`🧹 โหมดกวาดขยะ: ค้นหางานตกค้างของ `);

    let hasNextPage = true;
    let isFirstScan = true;

    while (hasNextPage) {
        
        // 🎯 หา "แถว (Row)" ที่มีข้อมูลเฉพาะของเรา (เช่น ชื่อลูกค้า หรืออีเมลที่ใช้จอง)
        // เพื่อป้องกันการไปลบงานของคนอื่นในวันที่เดียวกัน
        // สแกนหาขยะในหน้าปัจจุบัน
        const myQuotes = this.page.locator('tbody tr').filter({ 
        has: this.page.locator('td:nth-child(3)', { hasText: 'fluk' })
        });
        const count = await myQuotes.count();

        // 🚨 ด่านตรวจจับบั๊ก (เฉพาะรอบแรกเท่านั้น)
        if (isFirstScan === true) {
            expect(count, `❌ ค้นหารอบแรกไม่เจอข้อมูล! วันที่ ${CONFIG.Date.StartdateBooking} ถึง ${CONFIG.Date.EnddateBooking} ไม่มีงาน!`).toBeGreaterThan(0);
            // expect(count, `❌ ค้นหารอบแรกไม่เจอข้อมูล! วันที่ ${CONFIG.Date.StartdateBooking}  ไม่มีงาน หรือระบบค้นหาพัง!`).toBeGreaterThan(0);
            isFirstScan = false; // 🔑 โยนกุญแจทิ้ง รอบหน้าจะได้ไม่โดนดักอีก
        } 

        // ถ้าสแกนแล้วไม่เจอขยะ แปลว่าเราลบจนเกลี้ยงทุกหน้าแล้ว! (รวมถึงหน้า 2, 3 ที่ขยับขึ้นมาด้วย)
        if (count === 0) {
            console.log('🎉 หน้าตารางใสปิ๊ง! ไม่พบงานตกค้างแล้ว จบภารกิจกวาดขยะ!');
            hasNextPage = false;
            break; // ทะลวงออกจากลูป while จบการทำงาน
        }

        console.log(`🔎 พบงานของฉันจำนวน ${count} รายการในหน้านี้ กำลังเลือกลบ...`);
         
        // ติ๊กเลือกงานทั้งหมดที่เจอในหน้านี้
        for (let i = 0; i < count; i++) {
            const checkbox = myQuotes.nth(i).locator('input[name="quote_id[]"]');
            await checkbox.click(); 
            await expect(checkbox).toBeChecked();
        }
        console.log(`✅ ติ๊กเลือกงานที่มีทั้งหมด ${count} งานสำเร็จ!`);
    
        // สั่งลบงานที่เลือกในหน้านี้
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator('#do_action')).toBeVisible();
        console.log(`ไอคอน ฟันเฟืองปรากฏแล้วว กำลังทำงานต่อ`);
        await this.page.locator('#do_action').selectOption(CONFIG.DeleteOption.delete);
            

        const reasonSelect = this.page.locator('.delform select[name="reason"]');
        await reasonSelect.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(500);
        await reasonSelect.selectOption(CONFIG.DeleteOption.reason);
        await reasonSelect.dispatchEvent('change');
        const confirmBtn = this.page.locator('#submit_delete');
        await expect(confirmBtn).toBeEnabled({ timeout: 10000 }); 
        await confirmBtn.click();
            
        await this.page.locator('.delform').waitFor({ state: 'hidden', timeout: 15000 });
        const loadingOverlay = this.page.locator('.k-loading-mask').first();
        await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}); 
        await loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
        await this.page.locator('#grid_listbooking tbody[role="rowgroup"]').waitFor({ state: 'attached', timeout: 15000 });
        await this.page.waitForLoadState('networkidle')
        console.log('✅ กวาดขยะหน้านี้สำเร็จ! (ตารางอัปเดตแล้ว กำลังวนกลับไปเช็คซ้ำ...)');
        }

    }
  }
