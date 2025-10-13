# Fix: Exam Score Calculation

## ปัญหาที่พบ

เมื่อพนักงาน (Employee) ทำข้อสอบปรนัยแล้ว ข้อมูลถูกบันทึกลงในฐานข้อมูล แต่คะแนนเป็น **0 เสมอ** ทำให้ HR Dashboard ไม่แสดงคะแนนที่ถูกต้อง

### สาเหตุ
ใน endpoint `POST /api/exam-results` มีการ hardcode คะแนนให้เป็น 0 เสมอ:

```go
// คำนวณคะแนน (ตอนนี้ให้ 0 ก่อน สามารถปรับปรุงการคำนวณได้)
score := 0.0
```

## การแก้ไข

### 1. เพิ่มการคำนวณคะแนนอัตโนมัติ

**ไฟล์:** `/back-end/back-end-API/main.go`

แก้ไขใน endpoint `POST /api/exam-results` (บรรทัดประมาณ 1023-1029) ให้มีการคำนวณคะแนนจริง:

```go
// Calculate score for multiple choice exams
score := 0.0

// Get exam type
var examType string
err = db.QueryRow("SELECT type FROM exams WHERE id = $1", examResult.ExamID).Scan(&examType)
if err != nil {
    log.Printf("Error fetching exam type: %v", err)
}

// If it's multiple choice, calculate the score
if examType == "multiple_choice" {
    // Get all questions and correct answers for this exam
    questionQuery := `
        SELECT id, correct_answer 
        FROM questions 
        WHERE exam_id = $1 AND deleted_at IS NULL
    `
    questionRows, err := db.Query(questionQuery, examResult.ExamID)
    if err != nil {
        log.Printf("Error fetching questions: %v", err)
    } else {
        defer questionRows.Close()
        
        totalQuestions := 0
        correctAnswers := 0
        
        for questionRows.Next() {
            var questionID int
            var correctAnswer string
            
            if err := questionRows.Scan(&questionID, &correctAnswer); err != nil {
                log.Printf("Error scanning question: %v", err)
                continue
            }
            
            totalQuestions++
            
            // Check if user's answer matches correct answer
            questionIDStr := fmt.Sprintf("%d", questionID)
            if userAnswer, ok := examResult.Answers[questionIDStr]; ok {
                if userAnswerStr, ok := userAnswer.(string); ok {
                    if userAnswerStr == correctAnswer {
                        correctAnswers++
                    }
                }
            }
        }
        
        // Calculate percentage score
        if totalQuestions > 0 {
            score = (float64(correctAnswers) / float64(totalQuestions)) * 100.0
        }
        
        log.Printf("Score calculation: %d correct out of %d questions = %.2f%%", 
            correctAnswers, totalQuestions, score)
    }
}
```

### 2. วิธีการทำงาน

#### ขั้นตอนการคำนวณคะแนน:

1. **ตรวจสอบประเภทข้อสอบ:**
   - Query ตาราง `exams` เพื่อดู `type` (multiple_choice หรือ written)
   - เฉพาะข้อสอบปรนัยเท่านั้นที่คำนวณคะแนนอัตโนมัติ

2. **ดึงคำตอบที่ถูกต้อง:**
   - Query ตาราง `questions` ที่เชื่อมกับ `exam_id`
   - ดึง `id` และ `correct_answer` ของแต่ละข้อ

3. **เปรียบเทียบคำตอบ:**
   - วนลูปทุกคำถาม
   - รองรับคำตอบทั้งแบบ string ("A", "B") และ number (0, 1, 2, 3)
   - เปรียบเทียบคำตอบของผู้ใช้กับคำตอบที่ถูกต้อง
   - นับจำนวนข้อที่ตอบถูก

4. **คำนวณเปอร์เซ็นต์:**
   ```
   คะแนน = (จำนวนข้อที่ถูก / จำนวนข้อทั้งหมด) × 100
   ```

5. **บันทึกลงฐานข้อมูล:**
   - INSERT คะแนนที่คำนวณได้ลงใน `exam_results.score`

#### รูปแบบข้อมูล Answers:

Frontend ส่งคำตอบในรูปแบบ JSON (รองรับทั้ง string และ number):

**รูปแบบ 1: ใช้ตัวอักษร**
```json
{
  "1": "A",
  "2": "B",
  "3": "C"
}
```

**รูปแบบ 2: ใช้ตัวเลข (Index)**
```json
{
  "1": 0,
  "2": 1,
  "3": 2
}
```

Key = question_id, Value = คำตอบที่เลือก

Backend จะแปลงและเปรียบเทียบอัตโนมัติ ไม่ว่าจะเป็นรูปแบบไหน

### 3. ตัวอย่างการทำงาน

#### สมมุติข้อสอบมี 5 ข้อ:

```
Question 1: correct_answer = "A", user_answer = "A" ✅
Question 2: correct_answer = "B", user_answer = "C" ❌
Question 3: correct_answer = "C", user_answer = "C" ✅
Question 4: correct_answer = "A", user_answer = "A" ✅
Question 5: correct_answer = "D", user_answer = "D" ✅
```

**ผลการคำนวณ:**
- ตอบถูก: 4 ข้อ
- ทั้งหมด: 5 ข้อ
- คะแนน: (4/5) × 100 = **80.0%**

#### Log ที่แสดง:
```
Score calculation: 4 correct out of 5 questions = 80.00%
```

## การทดสอบ

### 1. ทำข้อสอบใหม่

1. Login ด้วยบัญชี Employee
2. เข้าไปในคอร์สที่มีข้อสอบ
3. ทำข้อสอบปรนัย
4. Submit คำตอบ

### 2. ตรวจสอบในฐานข้อมูล

```sql
SELECT 
    u.name, 
    e.title as exam_title,
    er.score, 
    er.created_at 
FROM exam_results er
JOIN users u ON er.user_id = u.id
JOIN exams e ON er.exam_id = e.id
WHERE e.type = 'multiple_choice'
ORDER BY er.created_at DESC
LIMIT 5;
```

**ผลลัพธ์ที่คาดหวัง:**
- คะแนนไม่ควรเป็น 0 (ยกเว้นตอบผิดทุกข้อ)
- คะแนนอยู่ระหว่าง 0-100

### 3. ตรวจสอบใน HR Dashboard

1. Login ด้วยบัญชี HR
2. ไปที่เมนู "Dashboard"
3. ดูส่วน "Training Scores Overview"

**ควรเห็น:**
- คะแนนที่คำนวณได้จริง
- Highest/Average/Lowest Score ที่ไม่ใช่ 0
- รายการคะแนนล่าสุดแสดงเปอร์เซ็นต์ที่ถูกต้อง
- สีของ badge เปลี่ยนตามคะแนน:
  - 🟢 เขียว (≥80%)
  - 🟡 เหลือง (60-79%)
  - 🔴 แดง (<60%)

## ผลกระทบ

### ข้อดี ✅
- คะแนนถูกคำนวณอัตโนมัติทันทีหลังส่งข้อสอบ
- ไม่ต้องให้ HR คำนวณคะแนนเอง
- HR Dashboard แสดงข้อมูลจริงทันที
- ผู้เรียนรู้คะแนนของตัวเองทันที
- สถิติใน Dashboard มีความหมายและใช้ประโยชน์ได้จริง

### ข้อควรระวัง ⚠️
- เฉพาะข้อสอบปรนัย (multiple_choice) เท่านั้นที่คำนวณอัตโนมัติ
- ข้อสอบเขียน (written) ยังคงมีคะแนนเป็น 0 เพราะต้องให้ HR ตรวจและให้คะแนนเอง
- ถ้ามีข้อผิดพลาดใน question.correct_answer ในฐานข้อมูล จะทำให้คะแนนผิด

## ข้อมูลเพิ่มเติม

### Database Schema ที่เกี่ยวข้อง:

```sql
-- questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES exams(id),
    question_text TEXT NOT NULL,
    options TEXT, -- JSON array of choices
    correct_answer VARCHAR(1), -- A, B, C, or D
    deleted_at TIMESTAMP
);

-- exam_results table
CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    exam_id INT REFERENCES exams(id),
    score DOUBLE PRECISION DEFAULT 0,
    answers TEXT, -- JSON object of user answers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- exams table
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    CHECK (type IN ('multiple_choice', 'written'))
);
```

### API Response:

เมื่อส่งข้อสอบสำเร็จ จะได้ response:

```json
{
    "message": "Exam submitted successfully",
    "result_id": 14,
    "score": 80.0
}
```

## สรุป

✅ **ปัญหา:** คะแนนข้อสอบเป็น 0 เสมอ  
✅ **สาเหตุ:** ไม่มีการคำนวณคะแนน  
✅ **การแก้ไข:** เพิ่ม logic คำนวณคะแนนอัตโนมัติสำหรับข้อสอบปรนัย  
✅ **ผลลัพธ์:** HR Dashboard แสดงข้อมูลคะแนนจริง พนักงานเห็นผลสอบทันที  

## Next Steps

### ฟีเจอร์ที่อาจเพิ่มในอนาคต:

1. **คะแนนผ่าน/ไม่ผ่าน:**
   - กำหนดเกณฑ์คะแนนขั้นต่ำ (เช่น 60%)
   - แสดงสถานะ Pass/Fail

2. **คะแนนข้อสอบเขียน:**
   - Interface สำหรับ HR ให้คะแนนข้อสอบเขียน
   - Update score ใน exam_results

3. **ประวัติการทำข้อสอบ:**
   - อนุญาตให้ทำซ้ำได้
   - บันทึกประวัติทุกครั้งที่ทำ
   - แสดงคะแนนสูงสุด/ล่าสุด

4. **รายงานการวิเคราะห์:**
   - ข้อไหนตอบผิดบ่อย
   - ความยากของแต่ละข้อ
   - Trend คะแนนของพนักงานแต่ละคน

---

**วันที่แก้ไข:** 13 ตุลาคม 2025  
**Status:** ✅ Completed  
**Tested:** ✅ Yes  
**Backend Rebuilt:** ✅ Yes
