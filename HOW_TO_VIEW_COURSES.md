# 📋 วิธีดูข้อมูล Course ที่สร้างแล้ว

## ✅ วิธีการดูรายการ Course:

### 🖥️ **ผ่าน Frontend (แนะนำ)**

1. **เข้าสู่ระบบ:**
   - ไป http://localhost:3000
   - Login ด้วย HR account: `thanin@company.com` / `password123`

2. **เข้า HR Dashboard:**
   - จะเข้าสู่หน้า HR Dashboard อัตโนมัติ
   - ดู sidebar ทางซ้าย

3. **คลิก "View All Courses":**
   - จะเห็นปุ่ม "View All Courses" ใน sidebar
   - คลิกเพื่อดูรายการคอร์สทั้งหมด

### 📊 **ข้อมูลที่จะเห็นในรายการ Course:**
- **ชื่อคอร์ส** (Title)
- **คำอธิบาย** (Description) 
- **หมวดหมู่** (Category) - แสดงเป็นป้ายสีเขียว
- **ระยะเวลา** - แปลงจากนาทีเป็นชั่วโมง/นาที
- **ผู้สร้าง** (Creator Name)
- **วันที่สร้าง** - แสดงในรูปแบบภาษาไทย
- **Video URL** (ถ้ามี) - เป็นลิงก์คลิกได้
- **ID** - แสดงเป็นป้ายสีฟ้า

### 🔧 **ฟีเจอร์เพิ่มเติม:**
- **ปุ่มรีเฟรช** - อัปเดตรายการล่าสุด
- **ปุ่มแก้ไข** (เตรียมไว้สำหรับอนาคต)
- **ปุ่มลบ** (เตรียมไว้สำหรับอนาคต)
- **ปุ่มดูรายละเอียด** (เตรียมไว้สำหรับอนาคต)
- **จำนวนคอร์สทั้งหมด** - แสดงด้านล่าง

---

## 🌐 **ผ่าน API โดยตรง:**

### 1. ดูรายการคอร์สทั้งหมด:
```bash
curl http://localhost:8080/api/courses | jq
```

### 2. ดูคอร์สตาม ID:
```bash
curl http://localhost:8080/api/courses/1 | jq
```

### 3. ผลลัพธ์ที่ได้:
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Customer Service",
      "description": "Learn the basics of excellent customer service",
      "category": "customer-service",
      "duration": 120,
      "video_url": "https://www.youtube.com/watch?v=example",
      "created_by": 1,
      "creator_name": "Thanin Tangkoblap",
      "created_at": "2025-10-12T03:20:27.826155Z"
    }
  ]
}
```

---

## 🎯 **Navigation ใน HR Dashboard:**

```
HR Dashboard
├── Dashboard (หน้าแรก)
├── Written Exam Answers  
├── Course Management
├── Create Course (สร้างคอร์สใหม่)
├── View All Courses (👈 ดูรายการคอร์ส)
└── Add User
```

---

## 📝 **หมายเหตุ:**
- รายการจะแสดงคอร์สล่าสุดก่อน (เรียงตาม created_at DESC)
- ถ้าไม่มีคอร์สจะแสดงข้อความ "ยังไม่มีคอร์สในระบบ"
- สามารถรีเฟรชรายการได้ตลอดเวลา
- Category จะแสดงเป็นภาษาไทยแทน code

🎉 **ตอนนี้คุณสามารถดูข้อมูล Course ที่สร้างแล้วได้ทั้งผ่าน UI และ API!**