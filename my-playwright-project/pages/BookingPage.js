// pages/BookingPage.js
import { expect } from '@playwright/test';
import { CONFIG } from '../utils/Config';
import { MapHelper } from '../utils/MapHelper';

export class BookingPage {
  constructor(page) {
    this.page = page;
    this.mapHelper = new MapHelper(page);
  }

  async createNewJobAndBook(jobData) {
    console.log('📝 เริ่มต้นกระบวนการจองงาน (Booking Flow)...');

   
    let maxRetries = 3;
    let attempt = 0;
    let isFormReady = false;

    while (attempt < maxRetries && !isFormReady) {
        attempt++;
        try {
            if (attempt === 1) {
                await expect(this.page.locator('p:has-text("Hello, Fluk")')).toBeVisible();
            } else {
                console.log(`🔄 [รอบแก้ตัวที่ ${attempt}] เริ่มต้นเข้าสู่หน้า New Job ใหม่อีกครั้ง...`);
            }

            // 1. ตรวจสอบและกางเมนู Jobs
            const newJobMenu = this.page.locator('a:has-text("New Job")').first();
            if (!(await newJobMenu.isVisible())) {
                await this.page.locator('.treeview:has-text("Jobs")').click();
                await this.page.waitForLoadState('networkidle');
            }
            await newJobMenu.click();
            await this.page.waitForLoadState('networkidle');

            // 🐛 ดักจับกรณีที่ 1: บั๊กเด้งไปหน้า List Booking (ตามลอจิกของคุณฟลุ๊ค)
            if (this.page.url().includes('list-booking.php')) {
                console.log('⚠️ [บั๊กกรณี 1] ติดหน้า List Booking: กำลังกด New Quote ซ้ำ...');
                await newJobMenu.click();
                await this.page.waitForLoadState('networkidle');
            } else {
                console.log('✅ ไม่พบอาการเด้งไปหน้า List Booking ลุยต่อ...');
            }

            await this.page.locator('h3:has-text("Create a new Quote")').waitFor({ state: 'visible', timeout: 5000 });

            // 2. 🎯 เลือกระบบหัวจั่ว 2 ช่อง (จุดเกิดเหตุหน้าขาวที่คุณฟลุ๊คเจอจากรูปภาพ!)
            await this.page.waitForLoadState('networkidle');
            const profileDropdown = this.page.locator('#internalprofile');
            await profileDropdown.waitFor({ state: 'attached' });
            await profileDropdown.selectOption({ label: jobData.internal_profile });
            await profileDropdown.dispatchEvent('change'); // 💡 หมัดที่ 1: กระทุ้งให้เว็บรู้ตัวว่าเลือกแล้ว
            await this.page.waitForLoadState('networkidle');

            const journeyDropdown = this.page.locator('#default_journey_id');
            await journeyDropdown.waitFor({ state: 'attached' });
            await journeyDropdown.selectOption({ label: jobData.journey_type });
            await journeyDropdown.dispatchEvent('change'); // 💡 หมัดที่ 1: กระทุ้งให้มันวาดฟอร์มครึ่งล่าง
            await this.page.waitForLoadState('networkidle');

            // 🐛 ดักจับกรณีที่ 2: เช็คบั๊กหน้าจอขาว (หลังเลือก Journey เสร็จ)
            console.log('🔎 เลือก profile และ Journey เสร็จแล้ว กำลังรอให้ช่องกรอกข้อมูล (#search_text) โผล่มา...');
            
  
            await this.page.locator('#search_text').waitFor({ state: 'visible', timeout: 5000 });

            // ถ้ารอดมาถึงตรงนี้ แปลว่าหน้าเว็บสมบูรณ์ 100%!
            isFormReady = true;
            console.log('🎉 หน้าฟอร์มมาครบถ้วน ไม่มีบั๊กหน้าจอขาว ปิดระบบป้องกันแล้วทะลวงกรอกข้อมูลต่อได้!');

        } catch (error) {
            console.log(`❌ [บั๊กกรณี 2] อาการหน้าจอขาวกำเริบ! หาช่องกรอกข้อมูลไม่เจอ (พยายามรอบที่ ${attempt}/${maxRetries})`);

            if (attempt === maxRetries) {
                throw new Error('💥 เว็บพังสนิท! ลองรีเซ็ตด้วยโลโก้ 3 รอบแล้วฟอร์มก็ยังหน้าขาวอยู่');
            }

            // 🎯 ท่าไม้ตายหนีหน้าขาว: กด Logo กลับหน้า Dashboard (ไม่ต้อง Refresh)
            console.log('🔄 อาการหนัก! กด Logo เอาไม่อยู่ ต้องกด F5 (Refresh) เพื่อล้างไพ่ซ่อมเว็บ...');
            const cleanBaseUrl = this.page.url().split('#')[0];
            await this.page.goto(cleanBaseUrl + '#!dashboard.php', { waitUntil: 'networkidle' });
            
            // 3. รอจนกว่าจะเห็นคำว่า Hello, Fluk เพื่อคอนเฟิร์มว่าถึงหน้าแรกแล้วจริงๆ
            await expect(this.page.locator('p:has-text("Hello, Fluk")')).toBeVisible();
            console.log('✅ Hard Reset สำเร็จ! กลับมาตั้งหลักที่หน้า Dashboard แล้ว...');
            
            // ปล่อยให้มันวนลูป while กลับไปทำ try ใหม่อีกรอบ...
        }
    }

    
    // กรอกข้อมูลลูกค้า
    await this.page.locator('#search_text').fill(jobData.customer_company);
    await this.page.locator('#email').fill(jobData.customer_email);
    await this.page.locator('#name').fill(jobData.customer_name);
    await this.page.locator('#phone_h').fill(jobData.customer_phone_h);
    await this.page.locator('#phone_m').fill(jobData.customer_phone_m);
    
    await this.page.locator('#passenger_email').fill(jobData.passenger_email);
    await this.page.locator('#passenger_name').fill(jobData.passenger_name);
    await this.page.locator('#passenger_number').fill(jobData.passenger_phone);

    // --- ส่วนเลือกรถและจัดการเรื่อง Bag ---
    await this.page.locator('#default_num_id').selectOption({ label: jobData.pax_count });
    await this.page.locator('#default_num_vehicle').selectOption({ label: jobData.vehicle_count });
    await this.page.locator('#default_car_id').selectOption({ label: jobData.vehicle_type });

    await this.page.waitForLoadState('networkidle');
    const bagDropdown = this.page.locator('#default_bag_id');

    // ✅ สั่งให้หุ่นยนต์ยืนจ้องไว้จนกว่าจะเห็น (Visible)
    await bagDropdown.waitFor({ state: 'visible' });

    await bagDropdown.selectOption({ label: jobData.bag_type });
  
    
    // ใส่ราคา (ใช้ Locator ID ที่คุณหามา)
    await this.page.locator('#price').fill(jobData.price);
    
    // เลือก Referral Source
    await this.page.locator('#know_where').selectOption({ label: jobData.referral_source });

    // กำหนดเป้าหมายกล่อง Dropdown)
    
    const journeyTypeDropdown = this.page.locator('select[id^="journey"]');

    const currentValue = await journeyTypeDropdown.inputValue();

    if (currentValue === '0') {
    
      console.log('🔎 ช่อง Journey Type ยังว่างเปล่าอยู่ กำลังเลือกให้...');
      // สั่งเลือกค่าจากไฟล์ Config
      await journeyTypeDropdown.selectOption({ label: jobData.journey_type });
      await this.page.waitForLoadState('networkidle');
    } else {
    
     console.log(`✅ ช่อง Journey Type มีคนเลือกไว้ให้แล้ว  กำลังไป Step ถัดไปเลย...`);
    }

    // 1. เลือก date การกรอกบนช่อง 
    await this.page.locator('input[id^="collection_datetime_"]').fill(jobData.date_and_time);
    
    // // 📅  2: เลือก Date (วัน/เดือน/ปี) แบบเลือกปฎิทิน
    
    // const pickCalendardate = this.page.locator('.date-button').first();
    // await pickCalendardate.click();


    // const switchToMonth = this.page.locator('.datepicker-days .datepicker-switch');
    // await switchToMonth.click();

    // const switchToYear = this.page.locator('.datepicker-months .datepicker-switch');
    // await switchToYear.click();
    // // (💡 หมายเหตุ: ปกติปฏิทินแบบนี้กดแค่ 2 รอบก็ถึงหน้า ปี แล้วครับ แต่ถ้าเว็บคุณฟลุ๊คต้องกด 3 รอบ ก็ก๊อปปี้ await dateSwitch.click(); เพิ่มไปอีกบรรทัดได้เลยครับ)

    // // 🎯 เลือก ปี (อัปเกรดเป็น :text-is)
    // const targetYear = '2027'; 
    // const yearButton = this.page.locator(`.year:text-is("${targetYear}")`).filter({ state: 'visible' });
    // await yearButton.click();

    // // 🎯 เลือก เดือน (อัปเกรดเป็น :text-is)
    // const targetMonth = 'Jan'; 
    // const monthButton = this.page.locator(`.month:text-is("${targetMonth}")`).filter({ state: 'visible' });
    // await monthButton.click();

    // // 🎯 เลือก วัน (ไฮไลท์สำคัญ! กันบอทตาเหล่ 100%)
    // const targetDay = '1'; 
    // // ทริคโปร: ใส่ :not(.old):not(.new) กันบอทไปกดโดนวันที่ 1 ของเดือนที่แล้ว!
    // const dayButton = this.page.locator(`.day:not(.old):not(.new):text-is("${targetDay}")`).filter({ state: 'visible' });
    // await dayButton.click();


    // // ==========================================
    // // 🕒 ส่วนที่ 2: เลือก Time (ชั่วโมง/นาที)
    // // ==========================================
    // const PickcalendarTime = this.page.locator('.time-button').first();
    // await PickcalendarTime.click();

    // // 🎯 เลือก ชั่วโมง (ตีกรอบโซนหน้าปัดชั่วโมง)
    // const targethour = '8'; 
    // const hourButton = this.page.locator(`.clockpicker-hours .clockpicker-tick:text-is("${targethour}")`).filter({ state: 'visible' });
    // await hourButton.click();

    // // 🎯 เลือก นาที (ตีกรอบโซนหน้าปัดนาที)
    // const targetminute = '00'; 
    // const minuteButton = this.page.locator(`.clockpicker-minutes .clockpicker-tick:text-is("${targetminute}")`).filter({ state: 'visible' });
    // await minuteButton.click();

    

    // --- โหมดที่ 1: ลากหมุดแผนที่ ---
    // await this.page.locator('[id^="showcol"]').click();
    // await this.mapHelper.dragMarker(200, 100); 
    // await this.mapHelper.closeMapWindow();

    // await this.page.locator('[id^="showdest"]').click();
    // await this.mapHelper.dragMarker(-100, 250); 
    // await this.mapHelper.closeMapWindow();

    // --- โหมดที่ 2: พิมพ์ Address (เปิดใช้งาน) ---
    // 1. ช่อง Collection (จุดรับ)
    const collectionInput = this.page.locator('input[id^="addresspicker_"]').first();
    await collectionInput.clear();
    await collectionInput.fill(jobData.collection_address);

    // 2. ช่อง Destination (จุดส่ง)
    const destinationInput = this.page.locator('input[id^="destinationpicker_"]').first();
    await destinationInput.clear();
    await destinationInput.fill(jobData.destination_address);

    //กดปุ่ม Book Now (ใช้ name attribute ที่ได้จากรูปที่ 3 ซึ่งแม่นยำมาก)
    await this.page.locator('button[name="bookNow[0]"]').click();

    // 3. จัดการป๊อปอัพยืนยัน (SweetAlert2)
    const popupTitle = this.page.locator('#swal2-title');
    const okButton = this.page.locator('.swal2-confirm');

    await popupTitle.waitFor({ state: 'visible' });
    await expect(popupTitle).toHaveText('Job Saved!');
    await okButton.click();
    
    
    const bookingLink = this.page.locator('a[rel="#overlay"]:has-text("Booking")');

    // รอจนกว่าจะมองเห็น (Dynamic Wait)
    await bookingLink.waitFor({ state: 'visible' });

    // ยืนยันผล (Assertion)
    await expect(bookingLink).toBeVisible();


    
    // ดึงค่าแอตทริบิวต์ 'title' ออกมาจากตัว bookingLink 
    const myQuoteId = await bookingLink.getAttribute('title'); 
    
    
    // ส่งเลขที่จดได้ (61431) กลับไปให้หัวหน้า (ไฟล์ Test Script)
    return myQuoteId;
  }

  // =========================================================
  // 🔁 โหมดออโต้แบบที่ 2: โหมดปั๊มของซ้ำ (เอาข้อมูลชุดเดียว มาปั๊ม X รอบ)
  // =========================================================
  /**
   * 
   * @param {number} rounds - จำนวนรอบที่ต้องการให้วนลูปสร้าง (เช่น 1, 2, 3)
   * @param {Object} delectQuotePage - หุ่นยนต์ที่ใช้สำหรับลบงาน (ถ้าสร้างทิ้งไว้ ไม่ต้องการลบ ให้ส่ง null)
   * @param {Array} jobData - ข้อมูลงานเดียวที่จะใช้ในการสร้างซ้ำ (เช่น แถวแรกของ CSV)
   */
  async createMultipleBookingsAndCleanup(rounds, delectQuotePage, jobData) {
    if (typeof rounds !== 'number') {
        throw new Error('ช่อง rounds ต้องส่งตัวเลขมาสิ!');
    }

    console.log(`\n--- 🔁 โหมดข้อมูลเดียว: กำลังสร้างงาน ${rounds} งาน (ข้อมูลลูกค้า: ${jobData.customer_name}) ---`);
    const trashBinIds = [];

    for (let i = 0; i < rounds; i++) {
        console.log(`\n🎬 เริ่มสร้างงานที่ ${i + 1}/${rounds}...`);

        if (i > 0) {
            await this.page.waitForLoadState('networkidle');
            console.log('🔄 กลับไปตั้งต้นที่หน้า Dashboard...');
            await this.page.locator('a.logo').click();
            await this.page.waitForLoadState('networkidle');
        }

        // โยน jobData เข้าไปให้ลูกน้องพิมพ์
        const quoteId = await this.createNewJobAndBook(jobData);
        trashBinIds.push(quoteId);

        // เช็คว่าได้ ID มาจริงไหม
        expect(quoteId).toBeDefined();
        expect(String(quoteId).length).toBeGreaterThan(0);
        console.log(`✅ จองสำเร็จ! ได้ Quote ID: [${quoteId}]`);
    }

    // 🧹 ล้างขยะตอนจบ (ถ้ามี)
    if (trashBinIds.length > 0 && delectQuotePage) {
        console.log(`\n🧹 โหมดข้อมูลเดียว: ลบ ${trashBinIds.length} รายการ...`);
        
        const rawDate = jobData.date_and_time; // เช่น "04 May 2028 08:00"
        const formattedDate = new Date(rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateRangeInfo = {
            startDate: formattedDate 
            
        };

        await delectQuotePage.delectBooking(trashBinIds, dateRangeInfo); 
    }else {
        // ถ้าไม่ได้ส่งมา (เป็น null) ให้ข้ามสเต็ปนี้ไปเลย!
        console.log('\n--- 🛑 ข้ามขั้นตอนการลบ ');
    }
  }

  // =========================================================
  // 📦 โหมดออโต้: วนลูปสร้างงาน X รอบ พร้อมล้างขยะอัตโนมัติตอนจบ
  // =========================================================
  /**
   * 
   * @param {number} rounds - จำนวนรอบที่ต้องการให้วนลูปสร้าง (เช่น 1, 2, 3)
   * @param {Array} jobList - รายการข้อมูลลูกค้าทั้งหมดที่ดึงมาจากไฟล์ CSV
   * @param {Object} delectQuotePage - หุ่นยนต์ที่ใช้สำหรับลบงาน (ถ้าสร้างทิ้งไว้ ไม่ต้องการลบ ให้ส่ง null)
   */
  async createUniqueBookingsMultipleRoundsAndCleanup(rounds, jobList, delectQuotePage) {
    if (typeof rounds !== 'number') {
        throw new Error('เฮ้ยเจ้านาย! ช่อง rounds ต้องส่งตัวเลขมาสิ!');
    }
    const totalJobs = rounds * jobList.length;
    console.log(`\n--- 🌪️ โหมดหลายข้อมูล: ดึงข้อมูลมาได้ ${jobList.length} งาน มาทำซ้ำ ${rounds} รอบ (เป้าหมายทั้งหมด ${totalJobs} งาน) ---`);
    
    // 🗑️ ย้ายตะกร้าขยะส่วนกลางมาไว้ในนี้แทน
    const trashBinIds = []; 

    // 1. 🔄 วนลูปสร้างงานตามจำนวนรอบ (rounds)
    for (let round = 1; round <= rounds; round++) {
        console.log(`\n===========================================`);
        console.log(` 🏁 เริ่มต้นรันรอบใหญ่ที่ ${round}/${rounds} `);
        console.log(`===========================================`);

        // 🎯 ลูปชั้นใน: กวาดข้อมูล "ทุกแถวใน CSV"
        for (let i = 0; i < jobList.length; i++) {
            const currentJob = jobList[i];
            console.log(`\n🎬 [รอบ ${round}] เริ่มสร้างงานที่ ${i + 1}/${jobList.length} (ลูกค้า: ${currentJob.customer_name})...`);

            // ข้ามการกดกลับ Dashboard เฉพาะงานแรกสุดของรอบแรกสุด
            if (round > 1 || i > 0) {
                await this.page.waitForLoadState('networkidle');
                console.log('🔄 กลับไปตั้งต้นที่หน้า Dashboard...');
                await this.page.locator('a.logo').click(); 
                await this.page.waitForLoadState('networkidle');
            }

            // ส่งข้อมูลไปสร้างงาน
            const quoteId = await this.createNewJobAndBook(currentJob);
            trashBinIds.push(quoteId);

            expect(quoteId).toBeDefined();
            expect(String(quoteId).length).toBeGreaterThan(0);
            console.log(`✅ [รอบ ${round}] จองสำเร็จ! ได้ Quote ID: [${quoteId}] ของคุณ ${currentJob.customer_name}`);
        }
    }

    console.log(`\n🎉 สร้างสำเร็จทั้งหมด ${totalJobs} งาน: ${trashBinIds.join(', ')}`);

    // 2. 🧹 ล้างขยะตอนจบ (ถ้ามี)
    if (trashBinIds.length > 0 && delectQuotePage) {
        console.log(`\n🧹 โหมดหลายข้อมูล: หากรอบเวลาเพื่อลบทีเดียว ${trashBinIds.length} รายการ...`);
        
        const allDates = jobList.map(job => new Date(job.date_and_time));
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));

        const dateRangeInfo = {
                startDate: minDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }), 
                endDate: maxDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            };

        await delectQuotePage.delectBooking(trashBinIds, dateRangeInfo); 
    }else {
        // ถ้าไม่ได้ส่งมา (เป็น null) ให้ข้ามสเต็ปนี้ไปเลย!
        console.log('\n--- 🛑 ข้ามขั้นตอนการลบ ');
    }

  } 
  
}