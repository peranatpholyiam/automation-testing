
// ไฟล์: tests/TestCase/CsvReader.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างฟังก์ชันชื่อ readCsv และส่งออก (export) ไปให้ไฟล์อื่นเรียกใช้ได้
export function readCsv(fileName) {
    const csvFilePath = path.join(__dirname, '..', 'data', fileName);
    
    // สั่งอ่านไฟล์
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // แปลงข้อมูลเป็นตาราง (Array) แล้วส่งค่ากลับไป (return)
    return parse(fileContent, {
        columns: true,          
        skip_empty_lines: true  
    });
}