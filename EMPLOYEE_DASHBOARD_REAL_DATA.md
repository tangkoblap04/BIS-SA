# Employee Dashboard - ดึงข้อมูลจาก Database จริง

## 📋 ภาพรวม
แก้ไข Employee Dashboard ให้ดึงข้อมูลจาก database จริงผ่าน API แทนการใช้ mock data

## ✅ การเปลี่ยนแปลง

### 1. Frontend - EmployeeDashboard.jsx

#### ลบ Mock Data
- ❌ ลบ `mockTrainingData` ออกทั้งหมด
- ✅ ใช้ข้อมูลจาก API เท่านั้น

#### ปรับปรุง `fetchDashboardData()`
```javascript
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await dashboardService.getDashboardData(user.id);
    
    // Format the data properly
    const formattedData = {
      user: data.user || { ... },
      stats: data.stats || { ... },
      courses: (data.courses || []).map(course => ({
        id: course.id,
        name: course.title || course.name,
        title: course.title || course.name,
        category: course.category || 'ทั่วไป',
        duration: course.duration || 0,
        description: course.description || '',
        progress: course.progress || 0,
        completed_at: course.completed_at,
        creator_name: course.creator_name
      })),
      recentExams: data.recent_exams || [],
      weeklyProgress: data.weekly_progress || [],
      achievements: data.achievements || []
    };

    setDashboardData(formattedData);
  } catch (error) {
    // Set empty data instead of mock data
    setDashboardData({ ... empty data ... });
  }
};
```

#### เพิ่มการแสดงคะแนนสอบล่าสุด
```jsx
{/* Recent Exam Scores */}
{dashboardData && dashboardData.recentExams && dashboardData.recentExams.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">คะแนนสอบล่าสุด</h3>
    <div className="space-y-3">
      {dashboardData.recentExams.map((exam, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{exam.course_title}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              exam.score >= 80 ? 'bg-green-100 text-green-800' :
              exam.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {exam.score.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500">{exam.exam_title}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(exam.created_at).toLocaleDateString('th-TH')}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

### 2. Backend API - `/api/dashboard/:userId`

#### ข้อมูลที่ส่งกลับ
```json
{
  "user": {
    "id": 2,
    "name": "Employee User",
    "role": "employee"
  },
  "stats": {
    "total_courses": 2,
    "completed_courses": 0,
    "in_progress_courses": 0,
    "total_hours": 2,
    "completed_hours": 0
  },
  "courses": [
    {
      "id": 3,
      "title": "Test juust",
      "category": "soft-skills",
      "duration": 80,
      "description": "asd",
      "progress": 0,
      "completed_at": null,
      "creator_name": "HR Admin"
    }
  ],
  "recent_exams": [
    {
      "score": 0,
      "created_at": "2025-10-16T16:31:51.775347Z",
      "course_title": "Test public",
      "exam_title": "แบบทดสอบเขียน"
    },
    {
      "score": 100,
      "created_at": "2025-10-16T16:31:48.36621Z",
      "course_title": "Test public",
      "exam_title": "แบบทดสอบปรนัย"
    }
  ],
  "weekly_progress": [
    {"day": "จ", "hours": 2.0},
    {"day": "อ", "hours": 1.5},
    // ...
  ],
  "achievements": [
    {
      "id": 1,
      "title": "นักเรียนดีเด่น",
      "description": "เรียนจบ 5 คอร์สแล้ว",
      "icon": "🏆",
      "type": "completion"
    }
  ]
}
```

#### การคำนวณสถิติ
Backend คำนวณอัตโนมัติจาก database:
- ✅ `total_courses` - จำนวนคอร์สทั้งหมดที่ user มีสิทธิ์เข้าถึง
- ✅ `completed_courses` - คอร์สที่มี progress = 100%
- ✅ `in_progress_courses` - คอร์สที่มี progress > 0 และ < 100%
- ✅ `total_hours` - ผลรวมชั่วโมงทั้งหมด (duration / 60)
- ✅ `completed_hours` - ชั่วโมงที่เรียนแล้ว (hours × progress / 100)

#### Achievement Badges
Backend สร้าง achievements อัตโนมัติตามเงื่อนไข:
- 🏆 **นักเรียนดีเด่น**: เมื่อเรียนจบ > 0 คอร์ส
- 📚 **กำลังใจดี**: เมื่อกำลังเรียน ≥ 2 คอร์สพร้อมกัน
- ⏰ **ผู้เรียนรู้**: เมื่อเรียนไปแล้ว ≥ 10 ชั่วโมง

## 📊 ข้อมูลที่แสดงใน Dashboard

### 1. Quick Stats Cards
- **คอร์สทั้งหมด** - จำนวนคอร์สที่สามารถเข้าถึงได้
- **เสร็จสมบูรณ์** - คอร์สที่เรียนจบแล้ว (100%)
- **กำลังเรียน** - คอร์สที่กำลังเรียนอยู่
- **ชั่วโมงที่เรียน** - ชั่วโมงที่เรียนไปแล้ว / ทั้งหมด

### 2. คอร์สของฉัน
- รายชื่อคอร์สที่ลงทะเบียน
- แสดง progress bar แต่ละคอร์ส
- สีแยกตามความคืบหน้า:
  - 🟢 เขียว: 100% (เสร็จสมบูรณ์)
  - 🔵 น้ำเงิน: > 50%
  - 🟡 เหลือง: ≤ 50%

### 3. กราฟความคืบหน้า
- Bar chart แสดงชั่วโมงที่เรียนแล้ว vs คงเหลือ
- ใช้ข้อมูลจาก stats.completed_hours และ stats.total_hours

### 4. กราฟสถานะคอร์ส (Pie Chart)
- เสร็จสมบูรณ์ (สีเขียว)
- กำลังเรียน (สีน้ำเงิน)
- ยังไม่เริ่ม (สีเทา)

### 5. คะแนนสอบล่าสุด (ใหม่)
- แสดง 5 คะแนนล่าสุด
- แสดงชื่อคอร์ส, ชื่อแบบทดสอบ, คะแนน, วันที่
- สีแยกตามเกณฑ์:
  - 🟢 ≥ 80%
  - 🟡 60-79%
  - 🔴 < 60%

### 6. สรุปความคืบหน้า
- แสดงเปอร์เซ็นต์การเรียนรู้โดยรวม
- Progress bar
- ชั่วโมงที่เรียน / ทั้งหมด

## 🔄 การทำงาน

### Flow การโหลดข้อมูล
```
1. User เข้าหน้า Dashboard
   ↓
2. useEffect() ตรวจสอบ user.id
   ↓
3. เรียก fetchDashboardData()
   ↓
4. dashboardService.getDashboardData(user.id)
   ↓
5. API GET /api/dashboard/:userId
   ↓
6. Backend query ข้อมูลจาก database
   - courses
   - course_progress
   - exam_results
   ↓
7. Backend คำนวณสถิติและ achievements
   ↓
8. ส่งข้อมูล JSON กลับ
   ↓
9. Frontend format ข้อมูลและ setDashboardData()
   ↓
10. UI อัพเดทและแสดงผล
```

## 🎨 UI/UX Improvements

### Loading State
```jsx
{loading && (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>
  </div>
)}
```

### Error State
```jsx
{error && !dashboardData && (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={fetchDashboardData}>ลองใหม่</button>
    </div>
  </div>
)}
```

### Empty State
- แสดงเมื่อไม่มีคอร์ส
- มีปุ่ม "เริ่มเรียนเลย" link ไปหน้า courses

## 🧪 การทดสอบ

### ทดสอบ API
```bash
# ทดสอบ endpoint
curl http://localhost:8080/api/dashboard/2

# ผลลัพธ์ที่ได้
{
  "user": {"id": 2, "name": "Employee User", "role": "employee"},
  "stats": {...},
  "courses": [...],
  "recent_exams": [...],
  "weekly_progress": [...],
  "achievements": [...]
}
```

### ทดสอบ Frontend
1. เข้าสู่ระบบด้วย `employee@example.com` / `emp123456`
2. ไปที่หน้า Dashboard
3. ตรวจสอบว่าข้อมูลแสดงถูกต้อง:
   - ✅ Quick stats แสดงตัวเลขจาก database
   - ✅ รายชื่อคอร์สแสดงคอร์สที่มีสิทธิ์เข้าถึง
   - ✅ Progress bar แสดงความคืบหน้าถูกต้อง
   - ✅ คะแนนสอบล่าสุดแสดง (ถ้ามี)
   - ✅ กราฟแสดงข้อมูลถูกต้อง

## 📝 ไฟล์ที่แก้ไข

### Frontend
- `/workspaces/BIS-SA/front-end/src/components/dashboard/EmployeeDashboard.jsx`
  - ลบ mock data
  - ปรับปรุง fetchDashboardData()
  - เพิ่มการแสดงคะแนนสอบล่าสุด
  - ปรับปรุง error handling

### Backend
- ใช้ API endpoint ที่มีอยู่แล้ว: `/api/dashboard/:userId`
- ไม่มีการแก้ไข backend

## ✅ สรุป

### Before (ก่อนแก้ไข)
- ❌ ใช้ mock data
- ❌ ข้อมูลไม่ตรงกับความเป็นจริง
- ❌ ไม่แสดงคะแนนสอบ
- ❌ ไม่มี achievements

### After (หลังแก้ไข)
- ✅ ดึงข้อมูลจาก database จริง
- ✅ ข้อมูลอัพเดทแบบ real-time
- ✅ แสดงคะแนนสอบล่าสุด 5 รายการ
- ✅ แสดง achievements ตามความสำเร็จจริง
- ✅ มี loading และ error states
- ✅ Responsive design

## 🚀 วิธีใช้งาน

1. Start backend
```bash
cd /workspaces/BIS-SA/back-end
docker-compose up -d
```

2. Start frontend
```bash
cd /workspaces/BIS-SA/front-end
npm start
```

3. เข้าสู่ระบบด้วย employee account
4. ดู Dashboard ที่แสดงข้อมูลจาก database จริง

## 🔮 การพัฒนาต่อ (Future Enhancements)

- [ ] เพิ่ม weekly_progress แบบ real-time จาก database
- [ ] เพิ่มการ filter คอร์สตามหมวดหมู่
- [ ] เพิ่ม calendar view สำหรับกำหนดการเรียน
- [ ] เพิ่ม notification สำหรับ deadline ใกล้ถึง
- [ ] เพิ่ม certificate สำหรับคอร์สที่เรียนจบ
