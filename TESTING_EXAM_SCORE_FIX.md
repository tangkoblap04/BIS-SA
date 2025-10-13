# คู่มือทดสอบระบบหลังแก้ไข Exam Score Calculation

## 🎯 วัตถุประสงค์

ทดสอบว่าระบบคำนวณคะแนนข้อสอบปรนัยถูกต้อง และ HR Dashboard แสดงข้อมูลจริงจากฐานข้อมูล

---

## 📋 เตรียมความพร้อม

### 1. ตรวจสอบระบบ

```bash
# ตรวจสอบ Backend ทำงาน
docker ps | grep back-end-api

# ตรวจสอบ Frontend ทำงาน
curl -s http://localhost:3000 | grep -q "React App" && echo "Frontend OK"

# ตรวจสอบ Database ทำงาน
docker exec back-end-postgres-db-1 psql -U postgres -d postgres -c "SELECT 1"
```

### 2. เตรียมข้อมูลทดสอบ

ต้องมี:
- ✅ บัญชี Employee อย่างน้อย 1 บัญชี
- ✅ บัญชี HR อย่างน้อย 1 บัญชี
- ✅ คอร์สที่มีข้อสอบปรนัย
- ✅ คำถามในข้อสอบ พร้อมคำตอบที่ถูกต้อง

---

## 🧪 การทดสอบ

### ขั้นตอนที่ 1: ทำข้อสอบด้วย Employee

#### 1.1 Login เป็น Employee
```
URL: http://localhost:3000
Email: employee@email.com (หรือบัญชี Employee ของคุณ)
Password: 1234
```

#### 1.2 เลือกคอร์สและเข้าสู่ข้อสอบ
- คลิกที่คอร์สที่มีข้อสอบปรนัย
- คลิก "Take Quiz" หรือ "ทำแบบทดสอบ"

#### 1.3 ทำข้อสอบ
**สำคัญ:** จดคำตอบที่เลือกไว้เพื่อใช้ตรวจสอบภายหลัง

ตัวอย่าง:
```
ข้อ 1: เลือก A ✓ (ถูกต้อง)
ข้อ 2: เลือก B ✗ (ผิด)
ข้อ 3: เลือก C ✓ (ถูกต้อง)
ข้อ 4: เลือก D ✗ (ผิด)
ข้อ 5: เลือก A ✓ (ถูกต้อง)
```

คาดว่าได้คะแนน: 3/5 = 60%

#### 1.4 Submit คำตอบ
- คลิกปุ่ม "Submit" หรือ "ส่งคำตอบ"
- ควรเห็นข้อความแสดงคะแนน

#### 1.5 บันทึกผล
```
เวลาทำข้อสอบ: _______
คะแนนที่แสดง: _______
จำนวนข้อถูก: _______
จำนวนข้อทั้งหมด: _______
```

---

### ขั้นตอนที่ 2: ตรวจสอบในฐานข้อมูล

```bash
docker exec back-end-postgres-db-1 psql -U postgres -d postgres -c "
SELECT 
    er.id,
    u.name as user_name,
    u.role,
    e.title as exam_title,
    e.type as exam_type,
    er.score,
    er.created_at
FROM exam_results er
JOIN users u ON er.user_id = u.id
JOIN exams e ON er.exam_id = e.id
WHERE er.id = (SELECT MAX(id) FROM exam_results)
"
```

**ผลที่คาดหวัง:**
```
 id | user_name     | role     | exam_title      | exam_type       | score | created_at          
----+---------------+----------+-----------------+-----------------+-------+---------------------
 15 | Employee User | employee | แบบทดสอบปรนัย    | multiple_choice | 60.0  | 2025-10-13 07:15:30
```

**เปรียบเทียบ:**
- ✅ คะแนนไม่เป็น 0
- ✅ คะแนนตรงกับที่คำนวณจากคำตอบ
- ✅ exam_type เป็น multiple_choice
- ✅ user_name ถูกต้อง

---

### ขั้นตอนที่ 3: ตรวจสอบใน HR Dashboard

#### 3.1 Logout และ Login เป็น HR
```
URL: http://localhost:3000
Email: hr@email.com
Password: 1234
```

#### 3.2 เข้าสู่ Dashboard
- คลิกเมนู "📊 Dashboard"
- รอให้ข้อมูลโหลด (ควรเห็น loading spinner)

#### 3.3 ตรวจสอบส่วน "Training Scores Overview"

**สิ่งที่ต้องตรวจสอบ:**

1. **Score Statistics (3 กล่อง):**
   ```
   Highest: ____% (สีเขียว)
   Average: ____% (สีน้ำเงิน)
   Lowest:  ____% (สีแดง)
   ```
   - ✅ ค่าไม่เป็น 0.0 (ยกเว้นตอบผิดหมด)
   - ✅ Highest ≥ Average ≥ Lowest
   - ✅ ค่าอยู่ระหว่าง 0-100

2. **Recent Scores (รายการคะแนน):**
   - ✅ แสดงชื่อผู้ทำข้อสอบ
   - ✅ แสดงชื่อคอร์สและข้อสอบ
   - ✅ แสดงคะแนนเป็นเปอร์เซ็นต์
   - ✅ สีของ badge ถูกต้อง:
     - เขียว: คะแนน ≥ 80%
     - เหลือง: คะแนน 60-79%
     - แดง: คะแนน < 60%

#### 3.4 ตรวจสอบส่วน "Employee Training Assignment"
- ✅ Pie chart แสดงจำนวนพนักงานที่ได้รับมอบหมายคอร์ส
- ✅ ตัวเลข Total Employees ถูกต้อง

#### 3.5 ตรวจสอบส่วน "Course Progress Overview"
- ✅ Bar chart แสดงคอร์สที่มีคนลงเรียน
- ✅ แสดงจำนวนคนเรียนและคนที่จบ

---

### ขั้นตอนที่ 4: ตรวจสอบ API โดยตรง

```bash
# Get HR Dashboard Stats
curl -X GET http://localhost:8080/api/hr/dashboard-stats | python3 -m json.tool
```

**ผลที่คาดหวัง:**
```json
{
    "employee_stats": {
        "assigned": 1,
        "total": 2,
        "unassigned": 1
    },
    "exam_scores": {
        "avg_score": 60.0,
        "max_score": 60.0,
        "min_score": 60.0,
        "score_count": 1,
        "scores": [
            {
                "course_title": "All user can do",
                "created_at": "2025-10-13T07:15:30.123456Z",
                "exam_title": "แบบทดสอบปรนัย",
                "name": "Employee User",
                "score": 60.0
            }
        ]
    },
    "course_progress": [...]
}
```

**ตรวจสอบ:**
- ✅ `exam_scores.scores[].score` ไม่เป็น 0
- ✅ `avg_score`, `max_score`, `min_score` มีค่าที่สมเหตุสมผล
- ✅ `score_count` ตรงกับจำนวนข้อสอบที่ทำ

---

## 🔍 การทดสอบเพิ่มเติม

### Test Case 1: ตอบถูกทุกข้อ (100%)

1. Login เป็น Employee
2. ทำข้อสอบใหม่
3. เลือกคำตอบที่ถูกต้องทุกข้อ
4. Submit
5. ตรวจสอบว่าได้คะแนน 100%

**ผลที่คาดหวัง:**
- คะแนนแสดง 100.0%
- Badge สีเขียว
- HR Dashboard แสดง Highest Score = 100%

---

### Test Case 2: ตอบผิดทุกข้อ (0%)

1. Login เป็น Employee
2. ทำข้อสอบใหม่
3. เลือกคำตอบที่ผิดทุกข้อ
4. Submit
5. ตรวจสอบว่าได้คะแนน 0%

**ผลที่คาดหวัง:**
- คะแนนแสดง 0.0%
- Badge สีแดง
- HR Dashboard แสดง Lowest Score = 0%

---

### Test Case 3: หลายคนทำข้อสอบ

1. Login เป็น Employee คนที่ 1 → ทำข้อสอบ → ได้ 80%
2. Logout → Login เป็น Employee คนที่ 2 → ทำข้อสอบ → ได้ 60%
3. Login เป็น HR → ดู Dashboard

**ผลที่คาดหวัง:**
- แสดงคะแนนของทั้ง 2 คนในรายการ
- Highest = 80%
- Lowest = 60%
- Average = 70%

---

### Test Case 4: ข้อสอบเขียน (Written Exam)

1. Login เป็น Employee
2. ทำข้อสอบเขียน
3. เขียนคำตอบและ Submit

**ผลที่คาดหวัง:**
- ข้อสอบเขียนยังคงมีคะแนน 0 (ตามปกติ)
- ไม่ส่งผลต่อคะแนนข้อสอบปรนัย
- HR ต้องตรวจและให้คะแนนเอง

---

## 📊 ตรวจสอบ Backend Logs

ขณะทำข้อสอบ ให้ดู logs เพื่อตรวจสอบการคำนวณ:

```bash
docker logs -f back-end-api-1
```

**Log ที่ควรเห็น:**
```
Score calculation: 3 correct out of 5 questions = 60.00%
[GIN] 2025/10/13 - 07:15:30 | 200 | POST "/api/exam-results"
```

---

## ✅ Checklist การทดสอบ

### ฟังก์ชันพื้นฐาน
- [ ] Employee สามารถ Login ได้
- [ ] Employee เห็นคอร์สที่ได้รับมอบหมาย
- [ ] Employee สามารถเข้าถึงข้อสอบได้
- [ ] ข้อสอบแสดงคำถามถูกต้อง
- [ ] สามารถเลือกคำตอบได้
- [ ] Submit ข้อสอบสำเร็จ
- [ ] แสดงคะแนนหลัง Submit

### การคำนวณคะแนน
- [ ] คะแนนถูกคำนวณถูกต้อง (ตรงกับการคำนวณด้วยมือ)
- [ ] คะแนนอยู่ระหว่าง 0-100
- [ ] บันทึกลงฐานข้อมูลถูกต้อง
- [ ] Backend log แสดงการคำนวณ

### HR Dashboard
- [ ] HR สามารถ Login ได้
- [ ] Dashboard โหลดข้อมูลโดยไม่มี error
- [ ] แสดง Employee Assignment Pie Chart
- [ ] แสดง Training Scores Overview
- [ ] คะแนนแสดงไม่ใช่ 0
- [ ] สีของ badge ถูกต้องตามคะแนน
- [ ] แสดง Course Progress Bar Chart
- [ ] ตัวเลขสถิติถูกต้อง

### API Endpoints
- [ ] GET /api/hr/dashboard-stats ทำงาน
- [ ] Response ไม่มี error
- [ ] ข้อมูล exam_scores ถูกต้อง
- [ ] ข้อมูล employee_stats ถูกต้อง

---

## 🐛 Troubleshooting

### ปัญหา: คะแนนยังเป็น 0

**แก้ไข:**
1. ตรวจสอบ Backend rebuild แล้วหรือยัง:
   ```bash
   docker logs back-end-api-1 | grep "Listening"
   ```
2. ตรวจสอบ exam type ในฐานข้อมูล:
   ```sql
   SELECT id, title, type FROM exams;
   ```
3. ตรวจสอบ questions มี correct_answer หรือไม่:
   ```sql
   SELECT id, question_text, correct_answer FROM questions WHERE exam_id = 1;
   ```

### ปัญหา: HR Dashboard ไม่แสดงข้อมูล

**แก้ไข:**
1. เปิด Browser Console (F12) → ดู Network tab
2. ตรวจสอบ request ไปที่ `/api/hr/dashboard-stats`
3. ดู response มี error หรือไม่
4. ตรวจสอบ CORS:
   ```bash
   curl -v http://localhost:8080/api/hr/dashboard-stats
   ```

### ปัญหา: Frontend แสดง "กำลังโหลดข้อมูล..." ตลอด

**แก้ไข:**
1. ตรวจสอบ API ตอบกลับหรือไม่:
   ```bash
   curl http://localhost:8080/api/hr/dashboard-stats
   ```
2. ตรวจสอบ Browser Console มี error:
   - Network error
   - CORS error
   - Authentication error

---

## 📝 สรุปผลการทดสอบ

### Test Results Template:

```
วันที่ทดสอบ: ___________
ผู้ทดสอบ: ___________

Test Case 1: ตอบถูก 3/5 ข้อ
Expected: 60%
Actual: _____%
Status: [ ] Pass [ ] Fail

Test Case 2: ตอบถูกทุกข้อ
Expected: 100%
Actual: _____%
Status: [ ] Pass [ ] Fail

Test Case 3: ตอบผิดทุกข้อ
Expected: 0%
Actual: _____%
Status: [ ] Pass [ ] Fail

HR Dashboard:
- Highest Score: _____%
- Average Score: _____%
- Lowest Score: _____%
- Recent Scores List: [ ] แสดงถูกต้อง [ ] มีปัญหา
- Badge Colors: [ ] ถูกต้อง [ ] ผิด

Overall Status: [ ] ✅ All Tests Passed [ ] ❌ Some Tests Failed

หมายเหตุ:
_________________________________
_________________________________
```

---

## 🎉 เมื่อผ่านการทดสอบทั้งหมด

ระบบพร้อมใช้งานแล้ว! ✅

**คุณสมบัติที่ใช้งานได้:**
- ✅ พนักงานทำข้อสอบปรนัยแล้วได้คะแนนทันที
- ✅ คะแนนคำนวณอัตโนมัติจากคำตอบที่ถูกต้อง
- ✅ HR ดูคะแนนของพนักงานทั้งหมดใน Dashboard
- ✅ สถิติและกราฟแสดงข้อมูลจริงจากฐานข้อมูล
- ✅ ระบบพร้อมใช้งานจริง

---

**เอกสารนี้สร้างเมื่อ:** 13 ตุลาคม 2025  
**Version:** 1.0  
**Status:** Active Testing
