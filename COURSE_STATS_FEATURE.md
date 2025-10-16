# ฟีเจอร์ใหม่: สถิติคะแนนแยกตามคอร์ส

## 📊 ภาพรวม
เพิ่มฟีเจอร์ใหม่ในหน้า HR Dashboard ที่แสดงสถิติคะแนนแยกตามแต่ละคอร์ส พร้อมกราฟและรายละเอียดผู้ทำคะแนน

## ✨ คุณสมบัติ

### 1. Dropdown เลือกคอร์ส
- แสดงรายชื่อคอร์สทั้งหมดในระบบ
- เลือกคอร์สได้เพื่อดูสถิติแยกตามคอร์ส

### 2. แสดงสถิติคะแนน
แบ่งเป็น 3 ส่วนหลัก:

#### 📈 คะแนนสูงสุด (สีเขียว)
- แสดงคะแนนสูงสุดของคอร์ส
- แสดงรายชื่อผู้ที่ทำคะแนนสูงสุด
- หากมีหลายคนทำคะแนนเท่ากัน จะแสดงทุกคน

#### 📊 คะแนนเฉลี่ย (สีน้ำเงิน)
- แสดงคะแนนเฉลี่ยของคอร์ส
- แสดงจำนวนครั้งที่มีการทำแบบทดสอบทั้งหมด

#### 📉 คะแนนต่ำสุด (สีแดง)
- แสดงคะแนนต่ำสุดของคอร์ส
- แสดงรายชื่อผู้ที่ทำคะแนนต่ำสุด
- หากมีหลายคนทำคะแนนเท่ากัน จะแสดงทุกคน

### 3. กราฟแท่งแสดงการกระจายของคะแนน
- แสดงการกระจายของคะแนนในช่วง 0-10%, 11-20%, ..., 91-100%
- ช่วยให้เห็นภาพรวมของการกระจายคะแนนได้ง่าย
- ใช้ Chart.js (Bar Chart)

### 4. ตารางแสดงรายละเอียดทั้งหมด
แสดงข้อมูลในรูปแบบตาราง ประกอบด้วย:
- ชื่อผู้เรียน
- ชื่อแบบทดสอบ
- คะแนนที่ได้ (พร้อมสีแยกตามเกณฑ์)
  - สีเขียว: ≥ 80%
  - สีเหลือง: 60-79%
  - สีแดง: < 60%
- วันที่และเวลาที่ทำแบบทดสอบ

## 🔧 การทำงานทางเทคนิค

### Backend API

#### Endpoint ใหม่: `/api/hr/course-stats/:courseId`
**Method:** GET

**Response Structure:**
```json
{
  "course_id": 1,
  "course_title": "ชื่อคอร์ส",
  "statistics": {
    "max_score": 95.5,
    "min_score": 45.0,
    "avg_score": 72.3,
    "total_scores": 10,
    "max_score_users": [
      {
        "user_id": 2,
        "user_name": "นาย ก",
        "score": 95.5,
        "exam_title": "แบบทดสอบปรนัย",
        "created_at": "2025-10-16T10:30:00Z"
      }
    ],
    "min_score_users": [
      {
        "user_id": 5,
        "user_name": "นาง ข",
        "score": 45.0,
        "exam_title": "แบบทดสอบปรนัย",
        "created_at": "2025-10-15T14:20:00Z"
      }
    ]
  },
  "all_scores": [
    {
      "user_id": 2,
      "user_name": "นาย ก",
      "score": 95.5,
      "exam_title": "แบบทดสอบปรนัย",
      "created_at": "2025-10-16T10:30:00Z"
    }
  ],
  "distribution": [
    { "range": "0-10", "count": 0 },
    { "range": "11-20", "count": 0 },
    { "range": "21-30", "count": 1 },
    ...
    { "range": "91-100", "count": 2 }
  ]
}
```

**การคำนวณ:**
- ดึงข้อมูลคะแนนทั้งหมดจากตาราง `exam_results` ที่เป็น `multiple_choice` เท่านั้น
- คำนวณคะแนนสูงสุด, ต่ำสุด, เฉลี่ย
- จัดกลุ่มคะแนนเป็นช่วง 10% สำหรับกราฟ
- เรียงข้อมูลตามคะแนนจากมากไปน้อย

### Frontend Components

#### State Management
```javascript
const [selectedCourse, setSelectedCourse] = useState('');
const [courseList, setCourseList] = useState([]);
const [courseStats, setCourseStats] = useState(null);
const [loadingCourseStats, setLoadingCourseStats] = useState(false);
```

#### Functions
1. `fetchCourseList()` - ดึงรายชื่อคอร์สทั้งหมด
2. `fetchCourseStats(courseId)` - ดึงสถิติของคอร์สที่เลือก

#### UI Components
1. **Dropdown** - เลือกคอร์ส
2. **Statistics Cards** - แสดงคะแนนสูงสุด/เฉลี่ย/ต่ำสุด
3. **Bar Chart** - แสดงการกระจายคะแนน
4. **Table** - แสดงรายละเอียดทั้งหมด

## 📁 ไฟล์ที่แก้ไข

### Backend
- `/workspaces/BIS-SA/back-end/back-end-API/main.go`
  - เพิ่ม endpoint `/api/hr/course-stats/:courseId`

### Frontend
- `/workspaces/BIS-SA/front-end/src/components/dashboard/HRDashboard.jsx`
  - เพิ่ม state และ functions
  - เพิ่ม UI section ใหม่

## 🎨 การออกแบบ UI

### Color Scheme
- **คะแนนสูงสุด:** สีเขียว (green-50, green-600, green-700)
- **คะแนนเฉลี่ย:** สีน้ำเงิน (blue-50, blue-600, blue-700)
- **คะแนนต่ำสุด:** สีแดง (red-50, red-600, red-700)

### Layout
- Grid 3 คอลัมน์สำหรับ statistics cards
- กราฟแท่งสูง 320px
- ตารางแสดงผลแบบ responsive พร้อม hover effect

## 🚀 การใช้งาน

1. เข้าสู่ระบบด้วยบัญชี HR
2. ไปที่หน้า Dashboard
3. เลื่อนลงมาจนเจอส่วน "คะแนนแยกตามคอร์ส"
4. เลือกคอร์สจาก Dropdown
5. ดูสถิติคะแนน, กราฟ และรายละเอียด

## 📝 หมายเหตุ

- ฟีเจอร์นี้แสดงเฉพาะคะแนนจากแบบทดสอบปรนัย (multiple_choice) เท่านั้น
- ถ้าไม่มีคะแนนในคอร์ส จะแสดงข้อความ "ยังไม่มีข้อมูลคะแนนสำหรับคอร์สนี้"
- กราฟจะอัพเดทอัตโนมัติเมื่อเปลี่ยนคอร์ส
- รองรับการแสดงผลหลายคนที่ทำคะแนนเท่ากัน

## 🐛 Testing

### ทดสอบ Backend
```bash
# ทดสอบ API endpoint
curl http://localhost:8080/api/hr/course-stats/1
```

### ทดสอบ Frontend
1. เข้า http://localhost:3000
2. Login ด้วย hr@example.com / hr123456
3. ตรวจสอบ dropdown และการแสดงผลสถิติ

## 🔄 การอัพเดทระบบ

### Backend
```bash
cd /workspaces/BIS-SA/back-end
docker-compose down
docker-compose up -d --build
```

### Frontend
```bash
cd /workspaces/BIS-SA/front-end
npm start
```

## ✅ สถานะ
- ✅ Backend API สำเร็จ
- ✅ Frontend UI สำเร็จ
- ✅ Integration สำเร็จ
- ✅ Responsive Design สำเร็จ
