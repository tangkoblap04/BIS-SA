#!/bin/bash

# 🚀 BIS-SA System Startup Script
echo "🚀 เริ่มต้นระบบ BIS-SA..."

# สี ANSI สำหรับการแสดงผล
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ฟังก์ชันตรวจสอบสถานะ
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 สำเร็จ${NC}"
    else
        echo -e "${RED}❌ $1 ล้มเหลว${NC}"
        exit 1
    fi
}

# ตรวจสอบว่าอยู่ใน workspace directory หรือไม่
if [ ! -d "/workspaces/BIS-SA" ]; then
    echo -e "${RED}❌ ไม่พบ workspace directory${NC}"
    exit 1
fi

echo -e "${BLUE}📂 เข้าไปใน workspace directory${NC}"
cd /workspaces/BIS-SA

# 0. เริ่มต้น Docker Containers
echo -e "${YELLOW}🐳 ตรวจสอบและเริ่ม Docker Containers...${NC}"

# ตรวจสอบว่า Docker daemon รันอยู่หรือไม่
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon ไม่ทำงาน กรุณาเริ่ม Docker ก่อน${NC}"
    exit 1
fi

# เริ่ม PostgreSQL container
if ! docker ps | grep -q "back-end-postgres-db-1"; then
    echo -e "${BLUE}🗄️ เริ่ม PostgreSQL container...${NC}"
    docker start back-end-postgres-db-1 > /dev/null 2>&1
    
    # รอให้ PostgreSQL พร้อม
    echo -e "${BLUE}⏳ รอให้ PostgreSQL พร้อม...${NC}"
    for i in {1..30}; do
        if docker exec back-end-postgres-db-1 pg_isready -U postgres > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL พร้อมใช้งาน${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ PostgreSQL ไม่พร้อมใช้งาน${NC}"
            exit 1
        fi
        sleep 1
    done
else
    echo -e "${GREEN}✅ PostgreSQL container รันอยู่แล้ว${NC}"
fi

# 1. เริ่มต้น Backend
echo -e "${YELLOW}🗄️ เริ่มต้น Backend Server...${NC}"
cd /workspaces/BIS-SA/back-end/back-end-API

# ตรวจสอบว่า port 8080 ว่างหรือไม่
if netstat -tlnp | grep -q ":8080"; then
    echo -e "${YELLOW}⚠️ Port 8080 ถูกใช้อยู่ กำลังหยุด process...${NC}"
    sudo fuser -k 8080/tcp
    sleep 2
fi

# เริ่มต้น Go server
echo -e "${BLUE}🔧 เริ่มต้น Go server...${NC}"
nohup go run main.go seed.go > server.log 2>&1 &
sleep 5

# ตรวจสอบว่า server รันแล้ว
echo -e "${BLUE}🔍 ตรวจสอบ Backend Health...${NC}"
curl -s http://localhost:8080/api/health > /dev/null
check_status "Backend Server"

# 2. Seed ข้อมูลเริ่มต้น
echo -e "${YELLOW}📊 กำลัง Seed ข้อมูลเริ่มต้น...${NC}"
curl -s -X POST http://localhost:8080/seed > /dev/null
check_status "Database Seeding"

# ตรวจสอบ login
echo -e "${BLUE}🔐 ทดสอบการ Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"employee@example.com","password":"emp123456"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Login ทดสอบสำเร็จ${NC}"
else
    echo -e "${RED}❌ Login ทดสอบล้มเหลว${NC}"
    exit 1
fi

# 3. เตรียม Frontend
echo -e "${YELLOW}🌐 เตรียม Frontend...${NC}"
cd /workspaces/BIS-SA/front-end

# ตรวจสอบว่ามี node_modules หรือไม่
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 ติดตั้ง npm dependencies...${NC}"
    npm install --silent
    check_status "npm install"
fi

# ตรวจสอบว่า port 3000 ว่างหรือไม่
if netstat -tlnp | grep -q ":3000"; then
    echo -e "${YELLOW}⚠️ Port 3000 ถูกใช้อยู่ กำลังหยุด process...${NC}"
    sudo fuser -k 3000/tcp
    sleep 2
fi

# แสดงสรุปผลการเริ่มต้น
echo ""
echo -e "${GREEN}🎉 ระบบเริ่มต้นเสร็จสิ้น!${NC}"
echo ""
echo -e "${BLUE}📍 ข้อมูลสำคัญ:${NC}"
echo -e "   • Backend API: ${YELLOW}http://localhost:8080/api${NC}"
echo -e "   • Frontend: ${YELLOW}http://localhost:3000${NC} (จะเริ่มต้นใน terminal นี้)"
echo ""
echo -e "${BLUE}👥 ข้อมูล Login:${NC}"
echo -e "   • Employee: ${YELLOW}employee@example.com / emp123456${NC}"
echo -e "   • HR: ${YELLOW}hr@example.com / hr123456${NC}"
echo ""
echo -e "${YELLOW}🚀 กำลังเริ่มต้น Frontend Server...${NC}"
echo -e "${BLUE}💡 กด Ctrl+C เพื่อหยุด Frontend Server${NC}"
echo ""

# เริ่มต้น Frontend (รันใน foreground)
npm start