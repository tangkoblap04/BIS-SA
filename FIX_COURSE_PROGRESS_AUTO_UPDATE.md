# FIX: Course Progress Auto-Update

## 🐛 ปัญหา
ทำแบบทดสอบเสร็จแล้ว แต่สถิติในหน้า Employee Dashboard ไม่อัปเดท:
- ✗ `completed_courses` ยังเป็น 0
- ✗ `completed_hours` ยังเป็น 0  
- ✗ ไม่มี achievement badge

## 🔍 สาเหตุ
เมื่อส่งผลการทำแบบทดสอบ (`POST /api/exam-results`):
- ✅ บันทึกลงตาราง `exam_results` 
- ✗ **ไม่ได้**อัปเดตตาราง `course_progress`

ทำให้ query ใน `/api/dashboard/:userId` ไม่เห็นความคืบหน้า:
```sql
SELECT COALESCE(cp.progress, 0) as progress
FROM courses c
LEFT JOIN course_progress cp ON c.id = cp.course_id AND cp.user_id = $1
-- ถ้าไม่มี record ใน course_progress -> progress = 0
```

## ✅ การแก้ไข

### Backend - main.go
เพิ่มการอัปเดต `course_progress` อัตโนมัติหลังจากบันทึก `exam_results`:

```go
// POST /api/exam-results
api.POST("/exam-results", func(c *gin.Context) {
    // ... บันทึก exam_results ...
    
    // ✨ NEW: Update course progress
    
    // 1. นับว่าคอร์สนี้มีแบบทดสอบทั้งหมดกี่ตัว
    var examCount int
    db.QueryRow(`
        SELECT COUNT(*) FROM exams 
        WHERE course_id = $1 AND deleted_at IS NULL
    `, examResult.CourseID).Scan(&examCount)
    
    // 2. นับว่า user ทำแบบทดสอบไปกี่ตัวแล้ว (DISTINCT exam_id)
    var completedExams int
    db.QueryRow(`
        SELECT COUNT(DISTINCT exam_id) FROM exam_results 
        WHERE user_id = $1 AND course_id = $2
    `, examResult.UserID, examResult.CourseID).Scan(&completedExams)
    
    // 3. คำนวณ progress
    progress := (float64(completedExams) / float64(examCount)) * 100.0
    // ถ้าทำครบทุกตัว -> progress = 100%
    
    // 4. อัปเดตหรือสร้าง record
    db.Exec(`
        INSERT INTO course_progress 
            (user_id, course_id, progress, updated_at, completed_at)
        VALUES ($1, $2, $3, NOW(), CASE WHEN $3 >= 100 THEN NOW() ELSE NULL END)
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET 
            progress = $3,
            updated_at = NOW(),
            completed_at = CASE WHEN $3 >= 100 THEN NOW() ELSE course_progress.completed_at END
    `, examResult.UserID, examResult.CourseID, progress)
})
```

### ตัวอย่างการทำงาน

#### กรณีมี 2 แบบทดสอบ (Multiple Choice + Written)
```
คอร์ส "Test public" มี:
- แบบทดสอบปรนัย (exam_id = 3)
- แบบทดสอบเขียน (exam_id = 4)

User 2 ทำแบบทดสอบ:
1. ทำปรนัย -> completedExams = 1, examCount = 2
   -> progress = 50%
   
2. ทำเขียน -> completedExams = 2, examCount = 2
   -> progress = 100% ✓
   -> completed_at = NOW()
```

#### ผลลัพธ์ใน course_progress table:
```sql
user_id | course_id | progress | completed_at
--------|-----------|----------|----------------------------
   2    |     2     |   100    | 2025-10-16 16:49:04.939389
```

## 📊 ผลกระทบ

### ก่อนแก้ไข
```json
{
  "stats": {
    "total_courses": 2,
    "completed_courses": 0,      // ✗ ไม่อัปเดท
    "in_progress_courses": 0,
    "total_hours": 2,
    "completed_hours": 0         // ✗ ไม่อัปเดท
  },
  "achievements": []             // ✗ ไม่มี
}
```

### หลังแก้ไข
```json
{
  "stats": {
    "total_courses": 2,
    "completed_courses": 1,      // ✓ อัปเดทแล้ว
    "in_progress_courses": 0,
    "total_hours": 2,
    "completed_hours": 1         // ✓ อัปเดทแล้ว
  },
  "achievements": [              // ✓ มี achievement
    {
      "id": 1,
      "title": "นักเรียนดีเด่น",
      "description": "เรียนจบ 1 คอร์สแล้ว",
      "icon": "🏆",
      "type": "completion"
    }
  ]
}
```

## 🔄 Retroactive Update

สำหรับ user ที่ทำแบบทดสอบไปแล้วก่อนหน้านี้ ต้องอัปเดตด้วยตนเอง:

```sql
-- หา user ที่ทำแบบทดสอบครบแล้ว แต่ course_progress ยังไม่ถูกต้อง
INSERT INTO course_progress (user_id, course_id, progress, updated_at, completed_at)
SELECT 
    er.user_id,
    er.course_id,
    CASE 
        WHEN COUNT(DISTINCT er.exam_id) >= (
            SELECT COUNT(*) FROM exams 
            WHERE course_id = er.course_id AND deleted_at IS NULL
        ) THEN 100
        ELSE (COUNT(DISTINCT er.exam_id)::float / (
            SELECT COUNT(*) FROM exams 
            WHERE course_id = er.course_id AND deleted_at IS NULL
        )) * 100
    END as progress,
    NOW(),
    CASE 
        WHEN COUNT(DISTINCT er.exam_id) >= (
            SELECT COUNT(*) FROM exams 
            WHERE course_id = er.course_id AND deleted_at IS NULL
        ) THEN NOW()
        ELSE NULL
    END as completed_at
FROM exam_results er
GROUP BY er.user_id, er.course_id
ON CONFLICT (user_id, course_id) 
DO UPDATE SET 
    progress = EXCLUDED.progress,
    updated_at = EXCLUDED.updated_at,
    completed_at = EXCLUDED.completed_at;
```

หรือแบบง่าย ๆ สำหรับ user 2, course 2:
```sql
INSERT INTO course_progress (user_id, course_id, progress, updated_at, completed_at)
VALUES (2, 2, 100, NOW(), NOW())
ON CONFLICT (user_id, course_id)
DO UPDATE SET progress = 100, updated_at = NOW(), completed_at = NOW();
```

## 📝 ไฟล์ที่แก้ไข

### Backend
- `/workspaces/BIS-SA/back-end/back-end-API/main.go`
  - เพิ่ม logic ใน `POST /api/exam-results` endpoint
  - อัปเดต `course_progress` อัตโนมัติหลังบันทึก exam result

### Database
- Manual update สำหรับข้อมูลเก่า (one-time migration)

## 🧪 การทดสอบ

### 1. ทดสอบ Flow ปกติ
```bash
# 1. ทำแบบทดสอบปรนัย
curl -X POST http://localhost:8080/api/exam-results \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "course_id": 2,
    "exam_id": 3,
    "answers": {"4": 0}
  }'

# 2. ตรวจสอบ progress (ควรเป็น 50% ถ้ามี 2 แบบทดสอบ)
curl http://localhost:8080/api/dashboard/2 | grep progress

# 3. ทำแบบทดสอบเขียน
curl -X POST http://localhost:8080/api/exam-results \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "course_id": 2,
    "exam_id": 4,
    "answers": {"5": "answer", "6": "answer"}
  }'

# 4. ตรวจสอบ progress (ควรเป็น 100%)
curl http://localhost:8080/api/dashboard/2 | grep completed_courses
# ผลลัพธ์: "completed_courses": 1 ✓
```

### 2. ตรวจสอบ Database
```sql
-- ดู course_progress
SELECT cp.*, c.title 
FROM course_progress cp 
JOIN courses c ON cp.course_id = c.id;

-- ดูจำนวนแบบทดสอบที่ทำแล้ว
SELECT user_id, course_id, COUNT(DISTINCT exam_id) as completed_exams
FROM exam_results
GROUP BY user_id, course_id;
```

## ✅ Checklist

- [x] เพิ่ม auto-update course_progress
- [x] คำนวณ progress จากจำนวนแบบทดสอบที่ทำแล้ว
- [x] ตั้งค่า completed_at เมื่อ progress = 100%
- [x] Log การอัปเดตเพื่อ debug
- [x] Handle error ไม่ให้กระทบ exam submission
- [x] Retroactive update สำหรับข้อมูลเก่า
- [x] ทดสอบว่า dashboard แสดงค่าถูกต้อง

## 🎯 ผลลัพธ์

ตอนนี้เมื่อทำแบบทดสอบเสร็จ:
1. ✅ `exam_results` ถูกบันทึก
2. ✅ `course_progress` อัปเดทอัตโนมัติ
3. ✅ Dashboard แสดงสถิติถูกต้อง
4. ✅ Achievement badges ปรากฏขึ้น
5. ✅ Progress bar แสดงความคืบหน้าจริง
