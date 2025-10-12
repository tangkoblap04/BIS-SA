#!/bin/bash

# 🛑 BIS-SA System Stop Script
echo "🛑 หยุดระบบ BIS-SA..."

# สี ANSI สำหรับการแสดงผล
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ฟังก์ชันหยุด process
stop_process() {
    local port=$1
    local name=$2
    
    if netstat -tlnp 2>/dev/null | grep -q ":$port"; then
        echo -e "${YELLOW}🔄 หยุด $name (port $port)...${NC}"
        sudo fuser -k $port/tcp 2>/dev/null
        sleep 2
        
        if ! netstat -tlnp 2>/dev/null | grep -q ":$port"; then
            echo -e "${GREEN}✅ $name หยุดแล้ว${NC}"
        else
            echo -e "${RED}❌ ไม่สามารถหยุด $name ได้${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️ $name ไม่ได้รันอยู่${NC}"
    fi
}

# หยุด Frontend (port 3000 และ 3001)
stop_process 3000 "Frontend Server"
stop_process 3001 "Frontend Server (Alt Port)"

# หยุด Backend (port 8080)
stop_process 8080 "Backend Server"

# หยุด Go processes
echo -e "${YELLOW}🔄 หยุด Go processes...${NC}"
pkill -f "go run main.go seed.go" 2>/dev/null

# หยุด React processes
echo -e "${YELLOW}🔄 หยุด React processes...${NC}"
pkill -f "react-scripts start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# ตรวจสอบผลลัพธ์
sleep 2

echo ""
echo -e "${GREEN}🎉 ระบบหยุดเรียบร้อยแล้ว!${NC}"
echo ""

# แสดงสถานะ processes
echo -e "${BLUE}📊 สถานะ Processes:${NC}"
if ps aux | grep -E "(go run|react-scripts|npm start)" | grep -v grep > /dev/null; then
    echo -e "${YELLOW}⚠️ ยังมี processes ที่เหลืออยู่:${NC}"
    ps aux | grep -E "(go run|react-scripts|npm start)" | grep -v grep
else
    echo -e "${GREEN}✅ ไม่มี processes ที่เกี่ยวข้องรันอยู่${NC}"
fi

echo ""
echo -e "${BLUE}📍 หากต้องการเริ่มต้นระบบใหม่:${NC}"
echo -e "   ${YELLOW}./start-system.sh${NC}"