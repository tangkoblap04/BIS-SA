# 📄 Make Report Feature - HR Dashboard PDF Export

## Overview
ฟีเจอร์ "Make Report" ช่วยให้ HR สามารถ export ข้อมูลจากหน้า HR Dashboard เป็นไฟล์ PDF ได้อย่างสะดวกและรวดเร็ว

## ✨ Features

### 1. **ปุ่ม Make Report ใน Navbar**
- แสดงเฉพาะเมื่ออยู่ในหน้า Dashboard
- Design ที่สวยงามและเข้ากับ UI ของระบบ
- มี icon download และ hover effect

### 2. **เนื้อหาใน PDF Report**

#### 📊 **Section 1: Employee Training Assignment**
- จำนวนพนักงานทั้งหมด
- จำนวนพนักงานที่ถูก assign courses
- จำนวนพนักงานที่ยังไม่ได้ assign
- แสดงเป็น percentage

#### 📈 **Section 2: Training Scores Overview**
- จำนวนข้อสอบทั้งหมด
- คะแนนสูงสุด (Highest Score)
- คะแนนเฉลี่ย (Average Score)
- คะแนนต่ำสุด (Lowest Score)
- ตารางคะแนนล่าสุด 10 รายการ
  - ชื่อนักเรียน
  - ชื่อคอร์ส
  - ชื่อข้อสอบ
  - คะแนน

#### 📚 **Section 3: Course Progress Overview**
- รายชื่อคอร์ส
- จำนวนคนที่ลงทะเบียน (Total Enrolled)
- จำนวนคนที่ทำเสร็จ (Completed)
- อัตราความสำเร็จ (Completion Rate %)

### 3. **PDF Formatting**
- ✅ Header พร้อมวันที่สร้างรายงาน
- ✅ ตารางข้อมูลที่จัดเรียงอย่างเป็นระเบียบ
- ✅ สีสัน theme ตามระบบ (สีม่วง-น้ำเงิน)
- ✅ หมายเลขหน้าอัตโนมัติ
- ✅ ชื่อไฟล์: `HR-Dashboard-Report-YYYY-MM-DD.pdf`

## 🛠️ Technical Implementation

### Libraries ที่ใช้
```json
{
  "jspdf": "^2.5.x",
  "jspdf-autotable": "^3.8.x",
  "html2canvas": "^1.4.x"
}
```

### Component Structure
```
HRDashboard.jsx
├── exportToPDF() function
│   ├── สร้าง PDF document
│   ├── เพิ่ม header และ title
│   ├── สร้างตารางข้อมูล
│   └── บันทึกไฟล์
│
└── ส่ง prop onExportPDF ไปยัง HRNavbar

HRNavbar.jsx
├── รับ prop onExportPDF
└── แสดงปุ่ม Make Report (ถ้ามี callback)
```

### Key Functions

#### `exportToPDF()`
```javascript
const exportToPDF = () => {
  const doc = new jsPDF();
  
  // 1. สร้าง Header
  doc.setFontSize(18);
  doc.text('HR Dashboard Report', 14, 20);
  
  // 2. สร้างตาราง Employee Stats
  doc.autoTable({
    head: [['Category', 'Count', 'Percentage']],
    body: [...employeeData],
    theme: 'grid'
  });
  
  // 3. สร้างตาราง Training Scores
  doc.autoTable({
    head: [['Student Name', 'Course', 'Exam', 'Score']],
    body: [...scoresData],
    theme: 'striped'
  });
  
  // 4. สร้างตาราง Course Progress
  doc.autoTable({
    head: [['Course', 'Enrolled', 'Completed', 'Rate']],
    body: [...progressData]
  });
  
  // 5. บันทึกไฟล์
  doc.save(`HR-Dashboard-Report-${date}.pdf`);
};
```

## 📋 Usage

### สำหรับผู้ใช้งาน (HR)
1. เข้าสู่หน้า HR Dashboard
2. คลิกปุ่ม **"Make Report"** ที่ Navbar ด้านบน
3. ระบบจะสร้างและดาวน์โหลดไฟล์ PDF อัตโนมัติ
4. ไฟล์จะถูกบันทึกใน Downloads folder

### ข้อควรทราบ
- ✅ ปุ่ม Make Report จะแสดงเฉพาะในหน้า Dashboard เท่านั้น
- ✅ รายงานจะแสดงข้อมูล Real-time จาก API
- ✅ ถ้าไม่มีข้อมูลในส่วนใด จะแสดงข้อความ "No data available"
- ✅ รองรับข้อมูลภาษาไทย

## 🎨 Design Highlights

### ปุ่ม Make Report
```jsx
<button className="flex items-center space-x-2 px-4 py-2 
                   bg-blue-600 text-white rounded-md 
                   hover:bg-blue-700 transition-colors 
                   shadow-sm hover:shadow-md">
  <DownloadIcon />
  <span>Make Report</span>
</button>
```

### สี Theme ใน PDF
- **Primary Color**: `#4F46E5` (Indigo-600)
- **Success Color**: `#34D399` (Green-400)
- **Text Color**: `#1F2937` (Gray-800)
- **Border Color**: `#E5E7EB` (Gray-200)

## 📊 Sample Report Structure

```
┌─────────────────────────────────────────────────┐
│          HR Dashboard Report                    │
│   Generated: 13 ตุลาคม 2568                     │
│   BIS-SA Training Management System             │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Employee Training Assignment                │
│  ┌────────────────┬────────┬────────────┐      │
│  │ Category       │ Count  │ Percentage │      │
│  ├────────────────┼────────┼────────────┤      │
│  │ Total          │   4    │   100%     │      │
│  │ Assigned       │   1    │   25.0%    │      │
│  │ Not Assigned   │   3    │   75.0%    │      │
│  └────────────────┴────────┴────────────┘      │
│                                                 │
│  2. Training Scores Overview                    │
│  ┌─────────────────┬─────────────┐            │
│  │ Metric          │ Value       │            │
│  ├─────────────────┼─────────────┤            │
│  │ Total Exams     │ 6           │            │
│  │ Highest Score   │ 100.0%      │            │
│  │ Average Score   │ 33.3%       │            │
│  │ Lowest Score    │ 0.0%        │            │
│  └─────────────────┴─────────────┘            │
│                                                 │
│  Recent Exam Scores:                            │
│  ┌──────────┬─────────┬─────────┬────────┐   │
│  │ Student  │ Course  │ Exam    │ Score  │   │
│  ├──────────┼─────────┼─────────┼────────┤   │
│  │ แพรวา   │ Example │ ทดสอบ  │ 100.0% │   │
│  │ Thanin   │ Example │ ทดสอบ  │ 100.0% │   │
│  │ ...      │ ...     │ ...     │ ...    │   │
│  └──────────┴─────────┴─────────┴────────┘   │
│                                                 │
│  3. Course Progress Overview                    │
│  ┌──────────┬──────────┬───────────┬──────┐  │
│  │ Course   │ Enrolled │ Completed │ Rate │  │
│  ├──────────┼──────────┼───────────┼──────┤  │
│  │ Test     │    1     │     1     │ 100% │  │
│  └──────────┴──────────┴───────────┴──────┘  │
│                                                 │
│              Page 1 of 1                        │
└─────────────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### ปัญหา: ปุ่ม Make Report ไม่แสดง
**Solution**: ตรวจสอบว่าอยู่ในหน้า Dashboard tab หรือไม่

### ปัญหา: PDF ไม่มีข้อมูล
**Solution**: รอให้ข้อมูลโหลดเสร็จก่อน (Loading indicator หายไป)

### ปัญหา: ไม่สามารถ download ได้
**Solution**: ตรวจสอบ browser permissions สำหรับ file download

## 🚀 Future Enhancements

- [ ] เพิ่ม Chart/Graph ใน PDF
- [ ] เพิ่มตัวเลือกช่วงเวลา (Date Range)
- [ ] Export เป็น Excel format
- [ ] ส่ง email report อัตโนมัติ
- [ ] Template customization
- [ ] Scheduled reports

## 📝 Notes

- รายงานจะถูกสร้างจากข้อมูล Real-time
- ไฟล์ชื่อจะมีวันที่สร้างแนบมาด้วย
- รองรับข้อมูลภาษาไทยและอักษรพิเศษ
- Responsive สำหรับหน้ากระดาษ A4

---

**Last Updated**: October 13, 2025  
**Version**: 1.0.0  
**Developer**: BIS-SA Development Team
