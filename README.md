# 🎓 BIS-SA - Business Information System for Staff Assessment

ระบบจัดการการศึกษาและการอบรมสำหรับพนักงาน (Employee Learning Management System)

## 📖 คำอธิบาย

BIS-SA เป็นระบบการเรียนรู้ออนไลน์สำหรับพนักงาน ประกอบด้วย:
- 🏠 **Employee Homepage** - แดชบอร์ดสำหรับพนักงาน
- 📚 **Course Management** - จัดการคอร์สเรียน
- 📝 **Online Exams** - ระบบสอบออนไลน์
- 👥 **User Management** - จัดการผู้ใช้ (HR/Employee)

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React.js** - UI Framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data Visualization

### Backend  
- **Go (Golang)** - API Server
- **Gin Framework** - Web Framework
- **PostgreSQL** - Database
- **JWT** - Authentication

## 🚀 การเริ่มต้นใช้งาน

### วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ)

```bash
# เริ่มต้นระบบทั้งหมด
./start-system.sh

# หยุดระบบ
./stop-system.sh
```

### วิธีที่ 2: เริ่มต้นแบบ Manual

ดูรายละเอียดใน [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🌐 URLs สำคัญ

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health

## 👥 ข้อมูล Login สำหรับทดสอบ

### Employee Account
- **Email:** `employee@example.com`
- **Password:** `emp123456`
- **หน้าหลัก:** Employee Dashboard

### HR Account
- **Email:** `hr@example.com`  
- **Password:** `hr123456`
- **หน้าหลัก:** HR Dashboard

## 📁 โครงสร้าง Project

```
BIS-SA/
├── back-end/
│   └── back-end-API/
│       ├── main.go              # เซิร์ฟเวอร์หลัก
│       ├── seed.go              # ข้อมูลเริ่มต้น
│       ├── handlers/            # API handlers
│       ├── models/              # Data models
│       └── routes/              # API routes
├── front-end/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── dashboard/       # Homepage & dashboards
│   │   │   ├── courses/         # Course components
│   │   │   └── common/          # Shared components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── contexts/            # React contexts
│   └── public/                  # Static files
├── SETUP_GUIDE.md              # คู่มือการเริ่มต้น
├── start-system.sh             # สคริปต์เริ่มต้นระบบ
└── stop-system.sh              # สคริปต์หยุดระบบ
```

## ✨ คุณสมบัติหลัก

### 🎯 Employee Features
- **สวยงามและใช้งานง่าย** - Homepage ที่ออกแบบสวยงาม
- **ติดตามความคืบหน้า** - กราฟและแผนภูมิแสดงผลการเรียน
- **คอร์สเรียนออนไลน์** - ดูคอร์สและเริ่มเรียนได้ทันที
- **ระบบสอบออนไลน์** - ทำข้อสอบและดูผลคะแนน

### 👨‍💼 HR Features
- **จัดการผู้ใช้** - เพิ่ม/ลบ/แก้ไขข้อมูลผู้ใช้
- **จัดการคอร์ส** - สร้างและจัดการคอร์สเรียน
- **รายงานและสถิติ** - ดูผลการเรียนและความคืบหน้า

## 🎨 Screenshots

### Employee Homepage
- แดชบอร์ดสวยงามพร้อมสถิติการเรียน
- กราฟแสดงความคืบหน้า
- Quick actions และเมนูด่วน

### Courses Page
- การ์ดคอร์สแบบ Gradient
- ระบบกรองตามหมวดหมู่
- ข้อมูลคอร์สครบถ้วน

## 🔧 การพัฒนา

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/login` - เข้าสู่ระบบ
- `GET /api/courses` - ดึงข้อมูลคอร์ส
- `POST /seed` - สร้างข้อมูลเริ่มต้น

### การเพิ่มฟีเจอร์ใหม่
1. เพิ่ม API endpoint ใน `back-end-API/`
2. เพิ่ม React component ใน `front-end/src/`
3. อัพเดท routing ใน `App.jsx`

## 🐛 การแก้ไขปัญหา

### ปัญหาทั่วไป
- **Port ถูกใช้:** รันสคริปต์ `./stop-system.sh` ก่อน
- **Backend ไม่ทำงาน:** ตรวจสอบ `server.log`
- **Frontend error:** ตรวจสอบ browser console

### การ Reset ระบบ
```bash
# หยุดระบบ
./stop-system.sh

# ลบ logs และ cache
rm -f back-end/back-end-API/server.log
rm -rf front-end/node_modules

# เริ่มต้นใหม่
./start-system.sh
```

## 📝 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE)

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Requests และ Issues! 

---

🚀 **Happy Learning!** สร้างโดย [@tangkoblap04](https://github.com/tangkoblap04)