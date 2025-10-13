# Exam Answers Feature - Combined View

## สิ่งที่ได้ทำ

ได้อัพเกรดหน้า "Written Exam Answers" ให้สามารถแสดงผลทั้ง:
1. **ข้อสอบปรนัย (Multiple Choice)** - แสดงเปอร์เซ็นต์คะแนน
2. **ข้อสอบข้อเขียน (Written)** - แสดงคำถามและคำตอบแบบละเอียด

ในหน้าเดียวกัน **จัดกลุ่มตาม user**

## Backend API

### เพิ่ม Endpoint ใหม่

**GET `/api/exam-answers/:courseId`**

ดึงข้อมูลข้อสอบทั้งหมด (ปรนัยและข้อเขียน) จัดกลุ่มตาม user

#### Response Format
```json
{
  "answers": [
    {
      "user_id": 4,
      "user_name": "Narulmon Wenuwiriyakul",
      "submitted_at": "2025-10-13T05:53:47.089636Z",
      "multiple_choice": {
        "exam_id": 1,
        "exam_title": "แบบทดสอบปรนัย",
        "score": 85.5,
        "total_questions": 10,
        "correct_answers": 9,
        "submitted_at": "2025-10-13T05:53:47.089636Z"
      },
      "written": {
        "exam_id": 2,
        "exam_title": "แบบทดสอบเขียน",
        "question_answers": [
          {
            "question_id": 1,
            "question_text": "คำถามที่ 1",
            "answer": "คำตอบของพนักงาน",
            "points": 10
          }
        ],
        "submitted_at": "2025-10-13T05:53:47.089636Z"
      }
    }
  ]
}
```

### คุณสมบัติของ API

1. **Group by User** - จัดกลุ่มข้อมูลตาม user_id
2. **Calculate MC Score** - คำนวณคะแนนข้อสอบปรนัยอัตโนมัติ
3. **Parse Answers** - แปลง JSON answers ให้เป็นข้อมูลที่ใช้งานง่าย
4. **Support Both Types** - รองรับทั้งข้อสอบปรนัยและข้อเขียนในครั้งเดียว

## Frontend

### อัพเดท Service

**`exam.service.js`**
```javascript
// เพิ่ม method ใหม่
async getAllExamAnswers(courseId) {
  // ดึงข้อมูลจาก /api/exam-answers/:courseId
}
```

### อัพเดท Component

**`WriteExamAnswers.jsx`**

#### การแสดงผลใหม่:

1. **User Card** - แสดงชื่อผู้ทำข้อสอบเป็น header

2. **Multiple Choice Section** (ถ้ามี)
   - พื้นหลังสีม่วง (purple-50)
   - แสดงคะแนนเปอร์เซ็นต์ขนาดใหญ่
   - สีคะแนน:
     - เขียว: ≥80%
     - เหลือง: 60-79%
     - แดง: <60%
   - แสดงจำนวนข้อที่ถูก/ทั้งหมด

3. **Written Exam Section** (ถ้ามี)
   - พื้นหลังสีเขียว (green-50)
   - แสดงคำถามและคำตอบทุกข้อ
   - แสดงชื่อผู้ตอบในแต่ละคำถาม
   - border สีฟ้าด้านซ้ายของแต่ละคำถาม

## UI Design

### Color Scheme

- **Purple (ม่วง)**: ข้อสอบปรนัย (Multiple Choice)
- **Green (เขียว)**: ข้อสอบข้อเขียน (Written)
- **Blue (น้ำเงิน)**: คำถามและหัวข้อ
- **Score Colors**:
  - 🟢 Green: ≥80% (ดีมาก)
  - 🟡 Yellow: 60-79% (ปานกลาง)
  - 🔴 Red: <60% (ต้องปรับปรุง)

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│  👤 Narulmon Wenuwiriyakul                      │
│  ส่งเมื่อ: 13 ต.ค. 2568 เวลา 12:53            │
├─────────────────────────────────────────────────┤
│  ✓ แบบทดสอบปรนัย  [purple background]         │
│     Score: 85.5%  (9/10 ข้อ)                   │
├─────────────────────────────────────────────────┤
│  ✍️ แบบทดสอบเขียน  [green background]          │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ คำถามที่ 1  [blue badge]                │  │
│  │ ❓ คำถาม...                             │  │
│  │ ✍️ คำตอบ:                               │  │
│  │    คำตอบของพนักงาน...                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ คำถามที่ 2  [blue badge]                │  │
│  │ ...                                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Features

### 1. 📊 Multiple Choice Display
- เปอร์เซ็นต์คะแนนแบบใหญ่ชัดเจน
- จำนวนข้อที่ถูก/ทั้งหมด
- Color-coded ตามระดับคะแนน
- วันเวลาที่ส่ง

### 2. ✍️ Written Exam Display
- แสดงคำถามทั้งหมด
- คำตอบของแต่ละคำถาม
- ชื่อผู้ตอบในแต่ละคำถาม
- คะแนนต่อคำถาม

### 3. 👤 User Grouping
- จัดกลุ่มตามผู้ทำข้อสอบ
- แสดงข้อสอบทั้งสองประเภทในการ์ดเดียว
- ง่ายต่อการเปรียบเทียบ

### 4. 🎨 Visual Design
- ใช้สีแยกประเภทข้อสอบ
- Icon ที่ชัดเจน
- Layout ที่อ่านง่าย
- Responsive design

## การใช้งาน

### สำหรับ HR

1. เข้าหน้า "คำตอบข้อสอบทั้งหมด"
2. เลือกคอร์สจาก dropdown
3. ระบบจะแสดง:
   - ชื่อพนักงานที่ทำข้อสอบ
   - คะแนนข้อสอบปรนัย (ถ้ามี)
   - คำตอบข้อสอบข้อเขียน (ถ้ามี)

### ข้อมูลที่ได้

**ข้อสอบปรนัย:**
- คะแนนเปอร์เซ็นต์
- จำนวนข้อที่ถูก
- จำนวนข้อทั้งหมด

**ข้อสอบข้อเขียน:**
- คำถามทั้งหมด
- คำตอบของแต่ละข้อ
- คะแนนแต่ละข้อ

## การทดสอบ

### Backend
```bash
# ทดสอบ endpoint
curl http://localhost:8080/api/exam-answers/1 | jq '.'
```

### Frontend
1. Login เป็น HR
2. คลิก "คำตอบข้อสอบทั้งหมด"
3. เลือกคอร์ส
4. ตรวจสอบการแสดงผล

## ข้อมูลที่ต้องมี

เพื่อให้ระบบแสดงข้อมูล ต้องมี:

1. **Employee ทำข้อสอบปรนัย**
   - ไปที่หน้าคอร์ส
   - ทำแบบทดสอบปรนัย
   - ส่งคำตอบ

2. **Employee ทำข้อสอบข้อเขียน**
   - ไปที่หน้าคอร์ส
   - ทำแบบทดสอบเขียน
   - ส่งคำตอบ

3. **ข้อมูลจะถูกบันทึกใน `exam_results` table**

## Database Schema

### exam_results
```sql
CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    exam_id INTEGER REFERENCES exams(id),
    score FLOAT DEFAULT 0,
    answers TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### exams
```sql
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('multiple_choice', 'written')),
    ...
);
```

## ไฟล์ที่แก้ไข

### Backend
- `/back-end/back-end-API/main.go`
  - เพิ่ม endpoint GET `/api/exam-answers/:courseId`
  - Logic คำนวณคะแนนข้อสอบปรนัย
  - Group data by user

### Frontend
- `/front-end/src/services/exam.service.js`
  - เพิ่ม method `getAllExamAnswers()`
  
- `/front-end/src/components/dashboard/WriteExamAnswers.jsx`
  - อัพเดท UI ให้แสดงทั้งสองประเภท
  - เพิ่ม Multiple Choice section
  - ปรับ layout และสี

## Status

✅ **Backend API พร้อมใช้งาน**
- Endpoint `/api/exam-answers/:courseId` ทำงานได้
- คำนวณคะแนนข้อสอบปรนัยอัตโนมัติ
- Group by user เรียบร้อย

✅ **Frontend พร้อมใช้งาน**
- UI สวยงาม แยกประเภทชัดเจน
- แสดงคะแนนปรนัยและคำตอบข้อเขียน
- Responsive และใช้งานง่าย

⚠️ **ต้องมีข้อมูลทดสอบ**
- ต้องมี employee ทำข้อสอบก่อน
- จึงจะเห็นข้อมูลในหน้านี้
