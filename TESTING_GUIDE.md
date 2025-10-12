# BIS-SA Authentication & User Management Test Guide

## ตอนนี้ระบบพร้อมใช้งานแล้ว! 🎉

### 1. เปิดเว็บไซต์
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 2. User Accounts สำหรับทดสอบ

#### HR Account:
- Email: `thanin@company.com`
- Password: `password123`
- Role: HR

#### Employee Account:
- Email: `employee@company.com`
- Password: `emp123456`
- Role: employee

### 3. การทดสอบ Login และ Role Management

#### ทดสอบ HR Login:
1. เปิด http://localhost:3000
2. ใส่ Email: `thanin@company.com`
3. ใส่ Password: `password123`
4. จะถูก redirect ไป `/hr-dashboard`
5. สามารถเข้าถึง:
   - HR Dashboard
   - Add User (เพิ่มผู้ใช้ใหม่)
   - Course Management
   - ดูข้อมูลผู้ใช้ทั้งหมด

#### ทดสอบ Employee Login:
1. Logout จาก HR account
2. ใส่ Email: `employee@company.com`
3. ใส่ Password: `emp123456`
4. จะถูก redirect ไป `/dashboard`
5. สามารถเข้าถึง:
   - Employee Dashboard
   - Courses
   - Take Exams

### 4. การเพิ่มผู้ใช้ใหม่
1. Login ด้วย HR account
2. ไป HR Dashboard
3. คลิก "Add User"
4. กรอกข้อมูล:
   - ชื่อ-นามสกุล
   - อีเมล
   - รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
   - เลือก Role: HR หรือ Employee
5. กด "เพิ่มผู้ใช้"

### 5. Features ที่ทำงานได้แล้ว:
✅ Login Page เป็นหน้าแรก
✅ Authentication with JWT
✅ Role-based Access Control
✅ HR Dashboard
✅ Employee Dashboard
✅ Add User functionality
✅ Password hashing
✅ Protected Routes
✅ Role-based Redirect after Login
✅ Logout functionality

### 6. API Endpoints:
- POST `/api/login` - Login
- POST `/api/users` - Create User (HR only)
- GET `/api/users` - Get All Users (HR only)
- GET `/api/health` - Health Check

### 7. การทดสอบ Role Protection:
- ลองเข้า `/hr-dashboard` ด้วย Employee account → จะถูก redirect
- ลองเข้า `/dashboard` ด้วย HR account → ใช้งานได้ปกติ

🚀 **ระบบพร้อมใช้งานแล้ว!**