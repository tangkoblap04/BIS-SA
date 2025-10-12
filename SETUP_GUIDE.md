# 🚀 คู่มือการเริ่มต้นระบบ BIS-SA

เมื่อเปิด Codespace ใหม่ ให้ทำตามขั้นตอนเหล่านี้เพื่อให้ระบบทำงานได้ปกติ

## 📋 ขั้นตอนการเริ่มต้น

### 1. 🗄️ เริ่มต้น Backend (Go API Server)

```bash
# เข้าไปใน directory backend
cd /workspaces/BIS-SA/back-end/back-end-API

# เริ่มต้น Go server (รันใน background)
nohup go run main.go seed.go > server.log 2>&1 &

# ตรวจสอบว่า server รันแล้ว
curl http://localhost:8080/api/health
```

**Expected Output:** `{"status":"ok"}`

### 2. 📊 Seed ข้อมูลเริ่มต้น

```bash
# เรียก seed endpoint เพื่อสร้างข้อมูลผู้ใช้และคอร์ส
curl -X POST http://localhost:8080/seed

# ตรวจสอบการ login
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"emp123456"}'
```

**Expected Output:** Response จะมี `token` และ `user` data

### 3. 🌐 เริ่มต้น Frontend (React App)

```bash
# เปิด terminal ใหม่
# เข้าไปใน directory frontend  
cd /workspaces/BIS-SA/front-end

# ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
npm install

# เริ่มต้น React development server
npm start
```

**Expected Output:** 
```
Compiled successfully!

You can now view front-end in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.0.x.x:3000
```

### 4. 🧪 ตรวจสอบระบบ

```bash
# ตรวจสอบ Backend Health
curl http://localhost:8080/api/health

# ตรวจสอบ Frontend
curl -s http://localhost:3000 | grep -o "<title>.*</title>"

# ตรวจสอบ processes ที่รันอยู่
ps aux | grep -E "(go run|react-scripts)"
```

## 👥 ข้อมูล Login สำหรับทดสอบ

### Employee Account
- **Email:** `employee@example.com`
- **Password:** `emp123456`
- **หลังจาก login:** จะไปหน้า `/dashboard` (Employee Homepage)

### HR Account  
- **Email:** `hr@example.com`
- **Password:** `hr123456`
- **หลังจาก login:** จะไปหน้า `/hr-dashboard` (HR Dashboard)

## 🌍 URLs สำคัญ

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health
- **Login Page:** http://localhost:3000/login
- **Employee Dashboard:** http://localhost:3000/dashboard
- **Courses Page:** http://localhost:3000/courses

## 🔧 คำสั่งเพิ่มเติม

### หยุดและเริ่มต้นใหม่

```bash
# หยุด Backend
sudo fuser -k 8080/tcp

# หยุด Frontend  
pkill -f "react-scripts start"

# เริ่มต้นใหม่ (ตามขั้นตอนข้างต้น)
```

### ตรวจสอบ Logs

```bash
# ดู Backend logs
cd /workspaces/BIS-SA/back-end/back-end-API
tail -f server.log

# ดู Frontend logs (ใน terminal ที่รัน npm start)
```

### Database Reset

```bash
# ถ้าต้องการ reset ข้อมูล
curl -X POST http://localhost:8080/seed
```

## 🚨 การแก้ไขปัญหาทั่วไป

### ปัญหา: Port ถูกใช้แล้ว
```bash
# Backend (port 8080)
sudo fuser -k 8080/tcp

# Frontend (port 3000) 
sudo fuser -k 3000/tcp
```

### ปัญหา: Go modules
```bash
cd /workspaces/BIS-SA/back-end/back-end-API
go mod tidy
go mod download
```

### ปัญหา: npm dependencies
```bash
cd /workspaces/BIS-SA/front-end
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist การทดสอบ

- [ ] Backend server รันอยู่ที่ port 8080
- [ ] Frontend server รันอยู่ที่ port 3000  
- [ ] API health check ผ่าน
- [ ] Login ด้วย employee account ได้
- [ ] หน้า dashboard แสดงได้
- [ ] หน้า courses แสดงได้
- [ ] Navigate ระหว่างหน้าได้ปกติ

## 🎯 One-liner เริ่มต้นทั้งระบบ

หากต้องการเริ่มต้นทั้งระบบด้วยคำสั่งเดียว:

```bash
# เริ่มต้น Backend
cd /workspaces/BIS-SA/back-end/back-end-API && nohup go run main.go seed.go > server.log 2>&1 & 

# รอ 3 วินาที แล้ว seed ข้อมูล
sleep 3 && curl -X POST http://localhost:8080/seed

# เริ่มต้น Frontend (รันใน terminal ใหม่)
cd /workspaces/BIS-SA/front-end && npm start
```

---

💡 **คำแนะนำ:** เก็บไฟล์นี้ไว้ใน workspace เพื่อใช้เป็นคู่มืออ้างอิง!