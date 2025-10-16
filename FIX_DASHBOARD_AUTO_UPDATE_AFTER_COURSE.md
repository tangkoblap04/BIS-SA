# แก้ไข: Dashboard ไม่อัปเดตหลังจากทำ Course เสร็จ

## ปัญหา
หลังจากที่ผู้ใช้ทำแบบทดสอบ (Quiz และ Written Exam) เสร็จ ข้อมูลใน Employee Dashboard ไม่มีการอัปเดตอัตโนมัติ

## สาเหตุ

### 1. Backend ไม่อัปเดต Progress
- ฟังก์ชัน `SubmitExamResult` ใน `exam_handler.go` บันทึกผลสอบลง `exam_results` เท่านั้น
- **ไม่ได้อัปเดตความคืบหน้า (progress) ในตาราง `course_progress`**
- Dashboard ดึงข้อมูล progress จากตาราง `course_progress`

### 2. Frontend ไม่ Redirect กลับ Dashboard
- หลังทำแบบทดสอบเสร็จ แค่แสดง alert แต่ไม่ได้นำทางกลับไปที่ Dashboard
- ผู้ใช้ต้องไปที่ Dashboard ด้วยตัวเองถึงจะเห็นข้อมูลอัปเดต

### 3. Dashboard ไม่ Auto-refresh
- EmployeeHomepage ไม่มีกลไก refresh ข้อมูลเมื่อกลับมาที่หน้านั้น

## วิธีแก้ไข

### 1. ✅ แก้ Backend - อัปเดต Progress อัตโนมัติ

**ไฟล์:** `/back-end/back-end-API/handlers/exam_handler.go`

เพิ่มโค้ดในฟังก์ชัน `SubmitExamResult`:

```go
// ตรวจสอบจำนวน exam ทั้งหมดใน course
var totalExams int
db.QueryRow(`
    SELECT COUNT(*) FROM exams 
    WHERE course_id = $1 AND deleted_at IS NULL
`, examResult.CourseID).Scan(&totalExams)

// นับจำนวน exam ที่ user ทำแล้ว
var completedExams int
db.QueryRow(`
    SELECT COUNT(DISTINCT exam_id) FROM exam_results 
    WHERE user_id = $1 AND course_id = $2
`, examResult.UserID, examResult.CourseID).Scan(&completedExams)

// คำนวณ progress
progress := 100.0
if completedExams < totalExams {
    progress = float64(completedExams) / float64(totalExams) * 100.0
}

// อัปเดต progress ใน course_progress
db.Exec(`
    INSERT INTO course_progress (user_id, course_id, progress, updated_at, completed_at)
    VALUES ($1, $2, $3, NOW(), CASE WHEN $3 >= 100 THEN NOW() ELSE NULL END)
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        progress = $3,
        updated_at = NOW(),
        completed_at = CASE WHEN $3 >= 100 THEN NOW() ELSE course_progress.completed_at END
`, examResult.UserID, examResult.CourseID, progress)
```

**ผลลัพธ์:**
- ทุกครั้งที่ส่งผลสอบ progress จะถูกอัปเดตในฐานข้อมูลทันที
- ถ้าทำครบทุก exam ให้ progress = 100% และบันทึก completed_at

### 2. ✅ แก้ Frontend - Redirect กลับ Dashboard

**ไฟล์:** `/front-end/src/pages/CourseDetailPage.jsx`

#### 2.1 แก้ฟังก์ชัน `handleQuizComplete`:
```javascript
const handleQuizComplete = (quizResult) => {
    console.log('Quiz completed:', quizResult);
    
    // บันทึกผล
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    results.push({
        ...quizResult,
        completedAt: new Date().toISOString()
    });
    localStorage.setItem('quizResults', JSON.stringify(results));

    // ตรวจสอบว่าต้องทำ Written Exam หรือไม่
    if (quizResult.goToWrittenExam) {
        setIsQuizCompleted(true);
    } else {
        // ไม่ต้องทำ Written Exam -> กลับ Dashboard
        alert('ยินดีด้วย! คุณได้ทำการเรียนครบหลักสูตรแล้ว');
        setTimeout(() => {
            navigate('/dashboard');
        }, 1000);
    }
};
```

#### 2.2 แก้ฟังก์ชัน `handleWrittenExamComplete`:
```javascript
const handleWrittenExamComplete = (examResult) => {
    console.log('Written Exam completed:', examResult);
    
    // บันทึกผล
    const results = JSON.parse(localStorage.getItem('writtenExamResults') || '[]');
    results.push({
        ...examResult,
        completedAt: new Date().toISOString()
    });
    localStorage.setItem('writtenExamResults', JSON.stringify(results));

    alert('ยินดีด้วย! คุณได้ทำการเรียนครบหลักสูตรแล้ว');
    
    // กลับไปที่ Dashboard
    setTimeout(() => {
        navigate('/dashboard');
    }, 1000);
};
```

**ผลลัพธ์:**
- หลังทำแบบทดสอบเสร็จจะ redirect กลับไปที่ Dashboard อัตโนมัติ
- Dashboard จะโหลดข้อมูลใหม่ที่มี progress อัปเดตแล้ว

### 3. ✅ แก้ Frontend - Auto-refresh Dashboard

**ไฟล์:** `/front-end/src/components/dashboard/EmployeeHomepage.jsx`

เพิ่ม useEffect สำหรับ visibility change:

```javascript
// เพิ่ม effect สำหรับ refresh ข้อมูลเมื่อกลับมาที่หน้านี้
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            console.log('Homepage visible - refreshing data');
            fetchCourses();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}, []);
```

**ผลลัพธ์:**
- เมื่อกลับมาที่ Dashboard (เช่น จาก course page หรือ tab อื่น) ข้อมูลจะถูกโหลดใหม่อัตโนมัติ

## สรุปการเปลี่ยนแปลง

### Backend Changes
- ✅ `exam_handler.go` - เพิ่มการอัปเดต `course_progress` เมื่อส่งผลสอบ
- ✅ คำนวณ progress อัตโนมัติจากจำนวน exam ที่ทำแล้ว
- ✅ ตั้งค่า `completed_at` เมื่อ progress = 100%

### Frontend Changes
- ✅ `CourseDetailPage.jsx` - redirect กลับ Dashboard หลังทำแบบทดสอบเสร็จ
- ✅ `EmployeeHomepage.jsx` - เพิ่ม auto-refresh เมื่อ visibility change
- ✅ `EmployeeDashboard.jsx` - มีปุ่ม Refresh และ auto-refresh อยู่แล้ว

## วิธีทดสอบ

1. Login เข้าระบบในฐานะ employee
2. ไปที่หน้า Dashboard และจดจำค่า progress ของ course
3. เข้าไปทำ course และทำแบบทดสอบให้เสร็จ
4. ตรวจสอบว่าระบบ redirect กลับไป Dashboard อัตโนมัติ
5. **ควรเห็นค่า progress อัปเดตเป็น 100%** (ถ้าทำครบทุก exam)

## ข้อมูลเพิ่มเติม

### Database Schema
```sql
CREATE TABLE course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    progress FLOAT DEFAULT 0,
    quiz_score FLOAT,
    written_exam TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

### Progress Calculation Logic
- Progress = (completed_exams / total_exams) × 100%
- ถ้าทำครบทุก exam → progress = 100%
- อัปเดตทันทีเมื่อส่งผลสอบแต่ละตัว

## Build & Deploy

```bash
# Backend
cd /workspaces/BIS-SA/back-end/back-end-API
go build -o main .
cd /workspaces/BIS-SA/back-end
docker-compose restart

# Frontend - ไม่ต้อง build ใหม่ (React hot reload จะจัดการให้)
```

---
**วันที่แก้ไข:** 16 ตุลาคม 2568  
**ผู้แก้ไข:** GitHub Copilot  
**Status:** ✅ แก้ไขเสร็จสมบูรณ์
