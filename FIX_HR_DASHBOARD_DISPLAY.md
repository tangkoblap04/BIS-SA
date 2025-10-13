# Fix: HR Dashboard ไม่แสดง Training Scores และ Course Progress

## 🔍 ปัญหาที่พบ

เมื่อ user ทำข้อสอบและเข้าคอร์สแล้ว HR Dashboard ยังคงแสดงข้อความว่า:
1. ❌ "ยังไม่มีข้อมูลคะแนนสอบ" (Training Scores Overview)
2. ❌ "ยังไม่มีข้อมูลความก้าวหน้าคอร์ส" (Course Progress Overview)

แม้ว่าข้อมูลจะอยู่ในฐานข้อมูลแล้วก็ตาม

---

## 🔧 สาเหตุและการแก้ไข

### ปัญหาที่ 1: Course Progress เป็น null

**สาเหตุ:**
- Backend query ใช้ตาราง `course_progress` ซึ่งว่างเปล่า
- Query มี condition `WHERE c.id IN (SELECT DISTINCT course_id FROM course_progress)` ซึ่งไม่ return อะไรเลย

**การแก้ไข:**
เปลี่ยนจากใช้ `course_progress` เป็นใช้:
- `course_access` - นับจำนวนพนักงานที่ถูกมอบหมายคอร์ส
- `exam_results` - นับจำนวนพนักงานที่ทำข้อสอบแล้ว (ถือว่าเข้าเรียนแล้ว)

**ไฟล์:** `/back-end/back-end-API/main.go` (บรรทัดประมาณ 1588-1620)

```go
// Before (ใช้ course_progress ที่ว่างเปล่า)
progressQuery := `
    SELECT c.id, c.title,
        COUNT(DISTINCT cp.user_id) as total_enrolled,
        COUNT(DISTINCT CASE WHEN cp.completed_at IS NOT NULL THEN cp.user_id END) as completed_count
    FROM courses c
    LEFT JOIN course_progress cp ON c.id = cp.course_id
    WHERE c.id IN (SELECT DISTINCT course_id FROM course_progress)
    ...
`

// After (ใช้ course_access และ exam_results)
progressQuery := `
    SELECT c.id, c.title,
        COUNT(DISTINCT ca.user_id) as total_enrolled,
        COUNT(DISTINCT er.user_id) as completed_count
    FROM courses c
    LEFT JOIN course_access ca ON c.id = ca.course_id
    LEFT JOIN exam_results er ON c.id = er.course_id 
        AND er.user_id IN (SELECT id FROM users WHERE role = 'employee')
    WHERE ca.user_id IN (SELECT id FROM users WHERE role = 'employee')
    GROUP BY c.id, c.title
    HAVING COUNT(DISTINCT ca.user_id) > 0
    ORDER BY total_enrolled DESC
    LIMIT 5
`
```

**ผลลัพธ์:**
- ✅ แสดงคอร์สที่มีพนักงานถูกมอบหมาย
- ✅ นับจำนวนพนักงานที่เข้าเรียน (มี exam_results)
- ✅ แสดงสถิติได้ถูกต้อง

---

### ปัญหาที่ 2: Training Scores แสดงว่าไม่มีข้อมูล

**สาเหตุ:**
Frontend มีการ map ข้อมูลผิด:
- API response ใช้ **snake_case**: `score_count`, `max_score`, `min_score`, `avg_score`
- Frontend state ใช้ **camelCase**: `scoreCount`, `maxScore`, `minScore`, `avgScore`
- ตอนแรกใช้ spread operator `...data.exam_scores` ซึ่งไม่ได้แปลงชื่อ field

**การแก้ไข:**
Map ข้อมูลอย่างชัดเจนจาก snake_case เป็น camelCase

**ไฟล์:** `/front-end/src/components/dashboard/HRDashboard.jsx` (บรรทัด 54-78)

```jsx
// Before (ไม่ map ชื่อ field)
setExamScores(data.exam_scores || {
  scores: [],
  maxScore: 0,
  minScore: 0,
  avgScore: 0,
  scoreCount: 0
});

// After (map ชื่อ field อย่างชัดเจน)
const examScoresData = data.exam_scores || {};
setExamScores({
  scores: examScoresData.scores || [],
  maxScore: examScoresData.max_score || 0,
  minScore: examScoresData.min_score || 0,
  avgScore: examScoresData.avg_score || 0,
  scoreCount: examScoresData.score_count || 0  // ⭐ แปลง score_count เป็น scoreCount
});
```

**ผลลัพธ์:**
- ✅ `examScores.scoreCount` มีค่าถูกต้อง
- ✅ Condition `examScores.scoreCount > 0` ทำงานได้
- ✅ แสดงคะแนนและสถิติออกมา

---

## 📊 ผลลัพธ์หลังแก้ไข

### API Response
```json
{
  "employee_stats": {
    "total": 3,
    "assigned": 1,
    "unassigned": 2
  },
  "exam_scores": {
    "scores": [
      {
        "name": "Thanin Tangkoblap",
        "score": 100,
        "course_title": "Example of Examination",
        "exam_title": "แบบทดสอบปรนัย",
        "created_at": "2025-10-13T07:35:19Z"
      }
    ],
    "max_score": 100,
    "min_score": 0,
    "avg_score": 20,
    "score_count": 5
  },
  "course_progress": [
    {
      "id": 2,
      "name": "Test exam",
      "total": 1,
      "completed": 1
    }
  ]
}
```

### HR Dashboard จะแสดง:

#### 1. Employee Training Assignment
- ✅ Pie chart แสดงอัตราส่วน assigned vs unassigned
- ✅ Total: 3 employees
- ✅ 1 Assigned, 2 Not Assigned

#### 2. Training Scores Overview
- ✅ Highest Score: 100.0%
- ✅ Average Score: 20.0%
- ✅ Lowest Score: 0.0%
- ✅ รายการคะแนนล่าสุด 5 รายการพร้อม badge สี
- ✅ แสดงชื่อพนักงาน, คอร์ส, และคะแนน

#### 3. Course Progress Overview
- ✅ Bar chart แสดงความก้าวหน้า
- ✅ แสดง "Test exam": 1 enrolled, 1 completed
- ✅ เปรียบเทียบ Total vs Completed

---

## 🧪 การทดสอบ

### 1. ตรวจสอบ API
```bash
curl -s http://localhost:8080/api/hr/dashboard-stats | python3 -m json.tool
```

**ผลที่คาดหวัง:**
- ✅ `course_progress` ไม่เป็น null
- ✅ `exam_scores.score_count` > 0
- ✅ มีข้อมูลคอร์สที่มีคนเข้าเรียน

### 2. ตรวจสอบ Frontend
```
1. Login เป็น HR: hr@email.com / 1234
2. ไปที่ Dashboard
3. เปิด Browser Console (F12)
4. ดู console.log:
   - "Dashboard data received: {...}"
   - "Exam scores set: {scoreCount: 5, ...}"
```

**ผลที่คาดหวัง:**
- ✅ scoreCount มีค่า > 0
- ✅ แสดงกราฟและตารางคะแนน
- ✅ แสดงกราฟความก้าวหน้าคอร์ส

### 3. ตรวจสอบ Database
```sql
-- ตรวจสอบ course_access
SELECT ca.course_id, c.title, COUNT(*) as assigned_count
FROM course_access ca
JOIN courses c ON ca.course_id = c.id
JOIN users u ON ca.user_id = u.id
WHERE u.role = 'employee'
GROUP BY ca.course_id, c.title;

-- ตรวจสอบ exam_results
SELECT c.title, COUNT(DISTINCT er.user_id) as users_with_results
FROM exam_results er
JOIN courses c ON er.course_id = c.id
JOIN users u ON er.user_id = u.id
WHERE u.role = 'employee'
GROUP BY c.title;
```

---

## 🔍 Root Cause Analysis

### ทำไม course_progress ว่างเปล่า?

ระบบไม่มีการบันทึกข้อมูลลง `course_progress` table อัตโนมัติ มีเพียง endpoint:
```go
POST /api/course-progress
```

แต่ไม่มีส่วนไหนของ Frontend เรียกใช้เมื่อ:
- User เข้าดูคอร์ส
- User เล่น video
- User ทำข้อสอบ

**แนวทางแก้ไขระยะยาว:**
1. เพิ่ม auto-tracking เมื่อ user เข้าคอร์ส
2. บันทึก progress เมื่อดู video
3. อัพเดท completed_at เมื่อทำข้อสอบผ่าน

**แนวทางปัจจุบัน (Quick Fix):**
ใช้ `course_access` และ `exam_results` แทน เพราะ:
- course_access มีข้อมูลการมอบหมายแล้ว
- exam_results มีข้อมูลการทำข้อสอบแล้ว
- ไม่ต้องแก้ไข Frontend หลายจุด

---

## 📁 ไฟล์ที่แก้ไข

### Backend
- ✅ `/back-end/back-end-API/main.go`
  - แก้ไข query course_progress ให้ใช้ course_access และ exam_results
  - เพิ่ม error logging

### Frontend
- ✅ `/front-end/src/components/dashboard/HRDashboard.jsx`
  - แก้ไขการ map ข้อมูลจาก snake_case เป็น camelCase
  - เพิ่ม console.log เพื่อ debug

### Actions Required
- ✅ Rebuild backend container
- ✅ Hot reload frontend (อัตโนมัติ)
- ✅ Refresh browser

---

## ✅ สรุป

### ปัญหาหลัก
1. ❌ Course progress query ใช้ตารางที่ว่างเปล่า
2. ❌ Field name mismatch (snake_case vs camelCase)

### การแก้ไข
1. ✅ เปลี่ยนจาก course_progress เป็น course_access + exam_results
2. ✅ Map ข้อมูล API response อย่างชัดเจน
3. ✅ เพิ่ม logging เพื่อ debug

### ผลลัพธ์
- ✅ Training Scores Overview แสดงคะแนนจริง
- ✅ Course Progress Overview แสดงความก้าวหน้า
- ✅ กราฟและสถิติทำงานถูกต้อง
- ✅ Dashboard มีข้อมูลครบถ้วน

---

**วันที่แก้ไข:** 13 ตุลาคม 2025  
**Status:** ✅ Fixed and Tested  
**Backend Rebuilt:** ✅ Yes  
**Frontend Updated:** ✅ Yes
