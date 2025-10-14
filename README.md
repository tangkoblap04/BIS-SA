# 🎓 BIS-SA - Business Information System for Staff Assessment

ระบบจัดการการศึกษาและการอบรมสำหรับพนักงาน (Employee Learning Management System)

## 📖 คำอธิบาย

BIS-SA เป็นระบบการเรียนรู้ออนไลน์สำหรับพนักงาน ประกอบด้วย:
- 🏠 **Employee Homepage** - แดชบอร์ดสำหรับพนักงาน
- 📚 **Course Management** - จัดการคอร์สเรียน
- 📝 **Online Exams** - ระบบสอบออนไลน์ (แบบปรนัยและอัตนัย)
- 👥 **User Management** - จัดการผู้ใช้ (HR/Employee)
- 📊 **HR Dashboard** - แดชบอร์ดสำหรับฝ่าย HR พร้อมกราฟและรายงาน
- 🎥 **Video Learning** - ระบบเรียนผ่านวิดีโอ
- 📄 **Report Generation** - สร้างรายงานเป็น PDF

---

## 🛠️ สแต็กเทคโนโลジีที่ใช้

### **Frontend (Client-Side)**
- **React.js 19.2.0** - JavaScript UI Library สำหรับสร้าง User Interface
- **React Router DOM 7.9.3** - Client-side routing สำหรับ Single Page Application (SPA)
- **Tailwind CSS 3.4.17** - Utility-first CSS framework สำหรับ styling
- **React Context API** - State management สำหรับ authentication
- **Recharts 3.2.1** - Library สำหรับสร้างกราฟและ data visualization
- **React ChartJS 2 5.3.0** - Chart.js wrapper สำหรับ React
- **jsPDF 3.0.3** + **jsPDF-AutoTable 5.0.2** - สร้างและ export PDF
- **html2canvas 1.4.1** - Capture HTML elements เป็นภาพ
- **Heroicons React 2.2.0** - Icon library

**ข้อดี:**
- ✅ Component-based architecture ทำให้โค้ดนำกลับมาใช้ใหม่ได้ง่าย
- ✅ Virtual DOM ทำให้ performance ดี
- ✅ SPA architecture ทำให้ user experience ลื่นไหล
- ✅ Ecosystem ใหญ่มีชุมชนและ libraries เยอะ

**ข้อจำกัด:**
- ⚠️ SEO ทำได้ยากกว่า Server-Side Rendering
- ⚠️ Initial load time อาจช้าถ้า bundle ใหญ่

---

### **Backend (Server-Side)**
- **Go (Golang) 1.24.5** - Programming language สำหรับ backend
- **Gin Framework 1.11.0** - Web framework สำหรับ Go (HTTP router และ middleware)
- **Gin-CORS** - Cross-Origin Resource Sharing middleware
- **JWT (JSON Web Tokens)** - Authentication และ authorization
- **Bcrypt (golang.org/x/crypto)** - Password hashing
- **Swagger/OpenAPI** - API documentation (Swaggo)

**ทำไมเลือก Go + Gin:**
- ✅ **Performance สูง** - Compiled language, concurrent programming ด้วย goroutines
- ✅ **Memory efficiency** - ใช้ memory น้อยกว่า Node.js, Python
- ✅ **Fast compilation** - Build เร็ว deploy ง่าย
- ✅ **Built-in concurrency** - Handle multiple requests พร้อมกันได้ดี
- ✅ **Type safety** - Static typing ลด runtime errors
- ✅ **Single binary deployment** - Deploy ง่ายไม่ต้องติดตั้ง dependencies

**Gin Framework:**
- ⚡ เร็วที่สุดในบรรดา Go web frameworks
- 🎯 Middleware support ดี (CORS, Auth, Logging)
- 📝 JSON serialization/deserialization รวดเร็ว
- 🛡️ Input validation และ error handling สะดวก

---

### **Database**
- **PostgreSQL (Latest)** - Relational Database Management System (RDBMS)

**Database Schema:**
- `users` - ข้อมูลผู้ใช้ (HR และ Employee)
- `courses` - ข้อมูลคอร์สเรียน
- `exams` - ข้อมูลข้อสอบ
- `questions` - คำถามในข้อสอบ
- `exam_results` - ผลสอบของผู้ใช้
- `course_progress` - ความคืบหน้าการเรียน
- `course_access` - สิทธิ์การเข้าถึงคอร์ส

**ทำไมเลือก PostgreSQL:**
- ✅ **ACID Compliance** - Transaction safety สูง เหมาะกับข้อมูลสำคัญ
- ✅ **Relational Integrity** - Foreign keys, constraints ป้องกันข้อมูลผิดพลาด
- ✅ **JSON Support** - สามารถเก็บ JSON data (exam answers, quiz options)
- ✅ **Rich data types** - Array, JSONB, UUID, Timestamp with timezone
- ✅ **Advanced indexing** - B-tree, Hash, GiST, GIN indexes
- ✅ **Full-text search** - Built-in search capabilities
- ✅ **MVCC** - Multi-Version Concurrency Control สำหรับ concurrent access
- ✅ **Mature และ stable** - พัฒนามากกว่า 30 ปี

**การ Scale PostgreSQL:**
- 📈 **Vertical Scaling** - เพิ่ม CPU, RAM, Storage ได้ง่าย
- 📊 **Read Replicas** - สร้าง replica servers สำหรับ read operations
- 🔄 **Connection Pooling** - ใช้ PgBouncer หรือ built-in pooling
- 💾 **Partitioning** - แบ่ง tables ใหญ่เป็น partitions
- 🔗 **Sharding** - แบ่งข้อมูลไปหลาย databases (ซับซ้อนกว่า)
- ☁️ **Managed Services** - AWS RDS, Google Cloud SQL, Azure Database auto-scaling

**ข้อจำกัดด้าน Scaling:**
- ⚠️ Horizontal scaling ทำได้ยากกว่า NoSQL
- ⚠️ Sharding ต้อง implement เองหรือใช้ tools เสริม (Citus Data)
- ⚠️ Write scaling มีข้อจำกัดมากกว่า read scaling

**เมื่อไหร่ควรพิจารณาเปลี่ยน:**
- หาก traffic สูงมากๆ (millions of requests/second)
- หาก data structure ไม่มี schema ชัดเจน → NoSQL (MongoDB)
- หาก ต้องการ high availability และ partition tolerance → Cassandra, DynamoDB

---

### **DevOps & Infrastructure**
- **Docker** - Container platform สำหรับ packaging applications
- **Docker Compose** - Multi-container orchestration
- **pgAdmin 4** - PostgreSQL management tool (Web-based GUI)

**Container Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   React App     │───▶│   Go + Gin      │───▶│   Database      │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    pgAdmin      │
                                               │   Port: 5050    │
                                               └─────────────────┘
```

**Docker Benefits:**
- ✅ **Consistent environments** - Dev, staging, production เหมือนกัน
- ✅ **Isolation** - แต่ละ service แยกกัน
- ✅ **Easy deployment** - Build once, run anywhere
- ✅ **Version control** - Docker images มี versioning
- ✅ **Resource efficiency** - เบากว่า Virtual Machines

**Connection Pooling:**
- Backend ใช้ `db.SetMaxOpenConns(25)` และ `db.SetMaxIdleConns(20)`
- ช่วยจัดการ database connections อย่างมีประสิทธิภาพ

---

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Bcrypt** - Password hashing algorithm (cost factor 10)
- **CORS** - Cross-Origin Resource Sharing enabled
- **Environment Variables** - Sensitive data (DB credentials)

**Security Features:**
- 🔐 Passwords เข้ารหัสด้วย bcrypt (ไม่เก็บ plain text)
- 🎫 JWT tokens สำหรับ session management
- 🛡️ Role-based access control (HR vs Employee)
- 🔒 Database constraints (CHECK, UNIQUE, FOREIGN KEY)
- 🚪 Protected routes ใน frontend (ProtectedRoute component)

---

---

## 📊 Architecture Patterns

### **1. Three-Tier Architecture**
```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                      │
│              (React Frontend - Port 3000)                 │
│  - User Interface                                         │
│  - React Components                                       │
│  - Client-side Routing                                    │
│  - State Management (Context API)                         │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP/REST API
                        │ JSON
┌───────────────────────▼──────────────────────────────────┐
│                   APPLICATION LAYER                       │
│                (Go Backend - Port 8080)                   │
│  - Business Logic                                         │
│  - API Endpoints (REST)                                   │
│  - Authentication & Authorization                         │
│  - Data Validation                                        │
└───────────────────────┬──────────────────────────────────┘
                        │ SQL Queries
                        │ Database Driver (lib/pq)
┌───────────────────────▼──────────────────────────────────┐
│                      DATA LAYER                           │
│              (PostgreSQL - Port 5432)                     │
│  - Data Storage                                           │
│  - Data Integrity (Constraints)                           │
│  - Transactions                                           │
│  - Indexing                                               │
└──────────────────────────────────────────────────────────┘
```

### **2. RESTful API Design**
- **Resource-based URLs**: `/api/users`, `/api/courses`, `/api/exams`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- **JSON Format**: Request และ Response ใช้ JSON

### **3. MVC-inspired Structure (Backend)**
- **Models** (`models/`) - Data structures และ database entities
- **Handlers** (`handlers/`) - Request handlers (Controllers)
- **Routes** (`routes/`) - API route definitions

### **4. Component-based Architecture (Frontend)**
- **Reusable Components**: Navbar, CourseCard, VideoPlayer
- **Page Components**: LoginPage, CoursePage, CourseDetailPage
- **Dashboard Components**: EmployeeDashboard, HRDashboard
- **Context Providers**: AuthContext สำหรับ global state

---

## 🚀 การเริ่มต้นใช้งาน

### วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ) ⭐

```bash
# เริ่มต้นระบบทั้งหมด (Backend + Frontend)
./start-system.sh

# หยุดระบบ
./stop-system.sh
```

**สคริปต์จะทำอะไร:**
1. ✅ ตรวจสอบ Docker daemon
2. ✅ เริ่ม PostgreSQL container
3. ✅ เริ่ม Backend API container
4. ✅ รอให้ services พร้อม (health checks)
5. ✅ ตรวจสอบข้อมูลในฐานข้อมูล
6. ✅ ทดสอบ login
7. ✅ ติดตั้ง npm dependencies (ถ้ายังไม่มี)
8. ✅ เริ่ม Frontend server

### วิธีที่ 2: เริ่มต้นแบบ Manual

#### 1. เริ่ม Backend (Docker)
```bash
cd /workspaces/BIS-SA/back-end
docker-compose up -d
```

#### 2. ตรวจสอบ Backend
```bash
curl http://localhost:8080/api/health
# Response: {"status":"ok"}
```

#### 3. เริ่ม Frontend
```bash
cd /workspaces/BIS-SA/front-end
npm install  # ครั้งแรกเท่านั้น
npm start
```

### วิธีที่ 3: Development Mode (ไม่ใช้ Docker สำหรับ Backend)

#### 1. เริ่ม PostgreSQL
```bash
cd /workspaces/BIS-SA/back-end
docker-compose up postgres-db -d
```

#### 2. รัน Backend แบบ local
```bash
cd /workspaces/BIS-SA/back-end/back-end-API
go run main.go seed.go
```

#### 3. รัน Frontend
```bash
cd /workspaces/BIS-SA/front-end
npm start
```

---

## 🌐 URLs สำคัญ

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health
- **Swagger Docs:** http://localhost:8080/swagger/index.html
- **pgAdmin:** http://localhost:5050 (user: admin@admin.com, pass: admin)

---

## 👥 ข้อมูล Login สำหรับทดสอบ

### Employee Account
- **Email:** `employee@example.com`
- **Password:** `emp123456`
- **สิทธิ์:** ดูคอร์ส, ทำแบบทดสอบ, ดูผลการเรียน

### HR Account
- **Email:** `hr@example.com`
- **Password:** `hr123456`
- **สิทธิ์:** จัดการผู้ใช้, สร้างคอร์ส, ดู Dashboard, จัดการข้อสอบ

---

## 📁 โครงสร้างโปรเจค

```
BIS-SA/
├── back-end/
│   ├── docker-compose.yml          # Docker services definition
│   ├── schema.sql                  # Database schema
│   └── back-end-API/
│       ├── main.go                 # Entry point
│       ├── seed.go                 # Seed data
│       ├── Dockerfile              # Backend container image
│       ├── go.mod                  # Go dependencies
│       ├── handlers/               # Request handlers
│       │   ├── auth_handler.go
│       │   ├── user_handler.go
│       │   ├── course_handler.go
│       │   └── exam_handler.go
│       ├── models/                 # Data models
│       │   ├── user.go
│       │   ├── course.go
│       │   ├── exam_result.go
│       │   └── question.go
│       ├── routes/                 # API routes
│       │   └── routes.go
│       └── docs/                   # Swagger documentation
│
├── front-end/
│   ├── package.json                # npm dependencies
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx                 # Main app component
│       ├── index.js                # Entry point
│       ├── components/             # React components
│       │   ├── AddUser.jsx
│       │   ├── EditUser.jsx
│       │   ├── ManageUsers.jsx
│       │   ├── common/             # Shared components
│       │   │   ├── Navbar.jsx
│       │   │   └── HRNavbar.jsx
│       │   ├── courses/            # Course components
│       │   │   ├── CourseCard.jsx
│       │   │   ├── CourseList.jsx
│       │   │   ├── CourseQuiz.jsx
│       │   │   ├── VideoPlayer.jsx
│       │   │   └── WrittenExam.jsx
│       │   └── dashboard/          # Dashboard components
│       │       ├── EmployeeDashboard.jsx
│       │       ├── HRDashboard.jsx
│       │       └── WriteExamAnswers.jsx
│       ├── contexts/               # React contexts
│       │   └── AuthContext.jsx
│       ├── pages/                  # Page components
│       │   ├── LoginPage.jsx
│       │   ├── CoursePage.jsx
│       │   └── CourseDetailPage.jsx
│       └── services/               # API services
│           ├── api.service.js      # Base API config
│           ├── auth.service.js     # Authentication
│           ├── user.service.js     # User operations
│           ├── course.service.js   # Course operations
│           ├── exam.service.js     # Exam operations
│           └── dashboard.service.js # Dashboard data
│
├── start-system.sh                 # Start script
├── stop-system.sh                  # Stop script
└── README.md                       # Documentation
```

---

## 🔑 Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (HR/Employee)
- Protected routes
- Session management

### 2. Course Management
- สร้าง/แก้ไข/ลบคอร์ส (HR only)
- อัพโหลดวิดีโอ (YouTube URL)
- กำหนด category และ duration
- ควบคุม visibility (all/specific/hidden)
- กำหนดสิทธิ์การเข้าถึงแบบเฉพาะเจาะจง

### 3. Exam System
- **แบบปรนัย (Multiple Choice)** - คำนวณคะแนนอัตโนมัติ
- **แบบอัตนัย (Written Exam)** - HR ให้คะแนนและเขียนคำตอบตัวอย่าง
- บันทึกผลสอบ
- ดูประวัติการสอบ

### 4. Dashboard & Reports
- **Employee Dashboard:**
  - คอร์สที่กำลังเรียน
  - ความคืบหน้า (Progress)
  - คะแนนสอบ
  
- **HR Dashboard:**
  - สถิติพนักงานทั้งหมด
  - กราฟแสดงผลการเรียน
  - จำนวนคอร์สและผู้ใช้
  - Export PDF reports

### 5. User Management (HR)
- เพิ่ม/แก้ไข/ลบผู้ใช้
- จัดการ roles
- ดูรายชื่อผู้ใช้ทั้งหมด

---

## 🎯 API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/users` - Create user

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Course Management
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (HR only)
- `PUT /api/courses/:id` - Update course (HR only)
- `DELETE /api/courses/:id` - Delete course (HR only)
- `GET /api/courses/:id/access` - Check user access

### Exam System
- `GET /api/exams/course/:courseId` - Get exams for course
- `POST /api/exam-results` - Submit exam result
- `GET /api/exam-answers/:courseId` - Get exam answers (HR view)

### Dashboard
- `GET /api/dashboard/:userId` - Get employee dashboard data
- `GET /api/hr/dashboard-stats` - Get HR dashboard statistics

### Course Progress
- `POST /api/course-progress` - Update course progress

---

## 🔧 Environment Variables

Backend (`.env` in `back-end/back-end-API/`):
```env
DB_HOST=postgres-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
APP_ENV=development
JWT_SECRET=your-secret-key-here
```

---

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:8080/api/health
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"emp123456"}'
```

### Get All Users
```bash
curl http://localhost:8080/api/users
```

---

## 🐛 Troubleshooting

### Backend ไม่เริ่ม
```bash
# ตรวจสอบ logs
docker logs back-end-api-1

# Restart container
docker restart back-end-api-1
```

### Database connection error
```bash
# ตรวจสอบว่า PostgreSQL ทำงาน
docker ps | grep postgres

# ตรวจสอบ logs
docker logs back-end-postgres-db-1
```

### Frontend error
```bash
# ลบ node_modules และติดตั้งใหม่
cd front-end
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port already in use
```bash
# หา process ที่ใช้ port
sudo lsof -i :8080  # Backend
sudo lsof -i :3000  # Frontend

# Kill process
sudo fuser -k 8080/tcp
sudo fuser -k 3000/tcp
```

---

## 📈 Performance Considerations

### Backend Optimizations
- ✅ Connection pooling (25 max connections)
- ✅ Exponential backoff retry สำหรับ DB connection
- ✅ Compiled binary (Go) - เร็วกว่า interpreted languages
- ✅ Goroutines สำหรับ concurrent requests

### Database Optimizations
- ✅ Indexes บน frequently queried columns (id, email, user_id, course_id)
- ✅ Foreign key constraints ช่วย query optimization
- ✅ UNIQUE constraints ป้องกัน duplicates
- ✅ Timestamp indexes สำหรับ time-based queries

### Frontend Optimizations
- ✅ Component lazy loading (React.lazy)
- ✅ Memoization สำหรับ expensive computations
- ✅ Virtual scrolling สำหรับ long lists
- ⚠️ ควรเพิ่ม: Code splitting, Image optimization, Caching

---

## 🚀 Scaling Recommendations

### เมื่อ Traffic เพิ่มขึ้น:

**Level 1: Optimize Current Setup**
- เพิ่ม CPU/RAM ให้ containers
- เพิ่ม database connection pool size
- เพิ่ม indexes ใน database
- Enable caching (Redis)

**Level 2: Horizontal Scaling**
- ใช้ Load Balancer (NGINX, HAProxy)
- รัน multiple backend instances
- PostgreSQL read replicas
- CDN สำหรับ static assets

**Level 3: Cloud & Microservices**
- ย้ายไป Kubernetes (K8s)
- แยก services (Auth, Course, Exam แยกกัน)
- ใช้ managed database (AWS RDS, Cloud SQL)
- Object storage สำหรับวิดีโอ (S3, Cloud Storage)

---

## 📚 สรุปความรู้ที่ใช้

### Programming Languages
- **Go** - Backend development, concurrent programming
- **JavaScript (ES6+)** - Frontend development
- **SQL** - Database queries และ schema design

### Frameworks & Libraries
- **Gin** - Go web framework
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS

### Database Concepts
- RDBMS (Relational Database)
- ACID properties
- Normalization
- Foreign keys & constraints
- Indexing strategies

### Architecture & Design Patterns
- Three-tier architecture
- RESTful API design
- MVC pattern
- Component-based architecture
- Repository pattern

### DevOps & Tools
- Docker containerization
- Docker Compose orchestration
- Version control (Git)
- Environment variables
- Shell scripting

### Security
- Password hashing (Bcrypt)
- JWT authentication
- CORS policies
- SQL injection prevention (prepared statements)
- Role-based access control (RBAC)

### Web Technologies
- HTTP/HTTPS protocols
- JSON data format
- REST API principles
- SPA (Single Page Application)
- CORS (Cross-Origin Resource Sharing)

---

## 📖 การศึกษาเพิ่มเติม

### Go & Backend
- [Go by Example](https://gobyexample.com/)
- [Gin Framework Documentation](https://gin-gonic.com/)
- [Effective Go](https://golang.org/doc/effective_go)

### React & Frontend
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

### PostgreSQL
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 👨‍💻 Development Team

Project developed as part of BIS-SA (Business Information System for Staff Assessment)

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- Go community
- React community
- PostgreSQL team
- Docker team
- All open-source contributors

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