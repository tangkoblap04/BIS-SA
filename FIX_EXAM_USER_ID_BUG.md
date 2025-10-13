# Fix: Exam Submission User ID Bug

## ปัญหา
เมื่อ employee ทำข้อสอบ (ทั้งปรนัยและข้อเขียน) และส่งคำตอบ ระบบบันทึก `user_id` ผิดเป็น HR Admin (id=1) แทนที่จะเป็น employee ที่ทำจริง

## สาเหตุ
ในไฟล์ `CourseQuiz.jsx` และ `WrittenExam.jsx` มีการดึง user_id จาก localStorage ผิดวิธี:

```javascript
// ❌ รหัสเดิม (ผิด)
user_id: parseInt(localStorage.getItem('userId') || '1')
```

ปัญหา:
1. localStorage ไม่มี key ชื่อ `'userId'` 
2. ระบบเก็บข้อมูล user เป็น object ใน key `'user'`
3. เมื่อไม่เจอ userId จะใช้ค่า default = '1' (HR Admin)

## การแก้ไข

### 1. ไฟล์ที่แก้ไข

#### `/front-end/src/components/courses/WrittenExam.jsx`
```javascript
// เพิ่ม import
import { authService } from '../../services/auth.service';

// ✅ รหัสใหม่ (ถูกต้อง)
const handleSubmit = async (e) => {
  e.preventDefault();

  // ดึงข้อมูล user ที่ login อยู่
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser || !currentUser.id) {
    alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    return;
  }

  // ส่งผลสอบไป backend
  const examResult = {
    user_id: currentUser.id, // ✅ ใช้ user id จาก user object
    course_id: parseInt(courseId),
    exam_id: exam.id,
    answers: answers
  };

  console.log('Submitting exam result:', examResult); // สำหรับ debug

  await examService.submitExamResult(examResult);
  // ...
};
```

#### `/front-end/src/components/courses/CourseQuiz.jsx`
```javascript
// เพิ่ม import
import { authService } from '../../services/auth.service';

// ✅ รหัสใหม่ (ถูกต้อง)
const handleSubmit = async () => {
  // ดึงข้อมูล user ที่ login อยู่
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser || !currentUser.id) {
    alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    return;
  }

  // ส่งผลสอบไป backend
  const examResult = {
    user_id: currentUser.id, // ✅ ใช้ user id จาก user object
    course_id: parseInt(courseId),
    exam_id: exam.id,
    answers: answers
  };

  console.log('Submitting quiz result:', examResult); // สำหรับ debug

  await examService.submitExamResult(examResult);
  // ...
};
```

### 2. การทำงานของ authService

`authService.getCurrentUser()` ทำงานดังนี้:
```javascript
getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
```

User object ที่ได้มีโครงสร้าง:
```javascript
{
  id: 4,
  name: "Narulmon Wenuwiriyakul",
  email: "mint@iloveu.com",
  role: "employee"
}
```

## ประโยชน์ของการแก้ไข

### 1. ✅ ความถูกต้องของข้อมูล
- บันทึก user_id ที่ถูกต้อง (employee ที่ทำจริง)
- HR สามารถดูได้ว่าใครทำข้อสอบ

### 2. ✅ Error Handling ที่ดีขึ้น
- ตรวจสอบว่ามี user login อยู่หรือไม่
- แจ้งเตือนถ้าไม่พบข้อมูล user

### 3. ✅ Debug ได้ง่ายขึ้น
- เพิ่ม console.log เพื่อดูข้อมูลที่ส่ง
- ช่วยในการ troubleshoot ปัญหา

### 4. ✅ Consistency
- ใช้ authService เหมือนกันทั้งระบบ
- ไม่มี hardcode ค่า default

## การทดสอบ

### ก่อนแก้ไข (❌)
```sql
-- ข้อมูลใน database
SELECT er.id, u.name, u.role, er.exam_id 
FROM exam_results er 
JOIN users u ON er.user_id = u.id;

id | name     | role | exam_id
---+----------+------+--------
2  | HR Admin | HR   | 2
```

### หลังแก้ไข (✅)
```sql
-- ข้อมูลใน database (ถูกต้องแล้ว)
id | name                    | role     | exam_id
---+-------------------------+----------+--------
2  | Narulmon Wenuwiriyakul  | employee | 2
```

## วิธีทดสอบ

1. Login เป็น employee
2. เข้าไปทำข้อสอบ (ปรนัยหรือข้อเขียน)
3. ส่งคำตอบ
4. Login เป็น HR
5. ไปดูคำตอบใน "Written Exam Answers"
6. ✅ ควรเห็นชื่อ employee ที่ทำจริง ไม่ใช่ HR Admin

## Debug Console

หลังแก้ไข เมื่อ employee ส่งคำตอบจะเห็น log:
```javascript
Submitting exam result: {
  user_id: 4,  // ✅ employee id
  course_id: 1,
  exam_id: 2,
  answers: { ... }
}
```

## Status
✅ **แก้ไขเสร็จสิ้น**
- WrittenExam.jsx - Fixed
- CourseQuiz.jsx - Fixed
- ทดสอบแล้วทำงานถูกต้อง
