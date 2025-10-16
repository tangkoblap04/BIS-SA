# Feature: แสดงรายชื่อพนักงานที่สามารถทำ Course ได้พร้อมสถานะ

## สรุปการเปลี่ยนแปลง

ในหน้า HR Dashboard ส่วนของ "คะแนนแยกตามคอร์ส" ได้แก้ไขส่วน **"รายชื่อทั้งหมด"** ให้แสดงเฉพาะ:
- ✅ พนักงานที่สามารถเข้าถึง Course นั้นได้ (ตาม Visibility Settings)
- ✅ สถานะว่าทำ Course เสร็จแล้วหรือยังไม่ได้ทำ

---

## การทำงาน

### 1. ระบบจะแสดงพนักงานตาม Visibility ของ Course

#### Visibility = "all" (เปิดให้ทุกคนเห็น)
- แสดง**ทุกคน**ที่มี role = "employee"

#### Visibility = "specific" (เลือกผู้ใช้เฉพาะ)
- แสดงเฉพาะพนักงานที่อยู่ใน `course_access` table

#### Visibility = "position" (เลือกตามตำแหน่ง)
- แสดงเฉพาะพนักงานที่มี position ตรงกับที่กำหนดใน `course_positions` table

#### Visibility = "hidden" (ซ่อนจากทุกคน)
- ไม่แสดงพนักงานเลย (รายการว่าง)

---

## การเปลี่ยนแปลงใน Backend

### 1. อัปเดต API Endpoint `/api/hr/course-stats/:courseId`

**ไฟล์:** `/back-end/back-end-API/main.go`

#### เพิ่มการดึง Visibility
```go
// Get course info and visibility
var courseTitle, visibility string
err := db.QueryRow("SELECT title, visibility FROM courses WHERE id = $1", courseID).Scan(&courseTitle, &visibility)
```

#### เพิ่มการดึงรายชื่อพนักงานที่มีสิทธิ์ตาม Visibility

##### กรณี visibility = "all"
```go
case "all":
    // All employees can access
    query := `SELECT id, name, position FROM users WHERE role = 'employee' ORDER BY name`
    // ... query และเก็บใน eligibleUsers
```

##### กรณี visibility = "specific"
```go
case "specific":
    // Only specific users can access
    query := `
        SELECT u.id, u.name, u.position 
        FROM users u
        JOIN course_access ca ON u.id = ca.user_id
        WHERE ca.course_id = $1 AND u.role = 'employee'
        ORDER BY u.name`
    // ... query และเก็บใน eligibleUsers
```

##### กรณี visibility = "position"
```go
case "position":
    // Only users with specific positions can access
    query := `
        SELECT DISTINCT u.id, u.name, u.position 
        FROM users u
        JOIN course_positions cp ON u.position = cp.position
        WHERE cp.course_id = $1 AND u.role = 'employee'
        ORDER BY u.name`
    // ... query และเก็บใน eligibleUsers
```

#### เพิ่มการตรวจสอบสถานะความสำเร็จ (Completion Status)
```go
// Get completion status for eligible users
completionStatus := make(map[int]bool)
completionQuery := `
    SELECT user_id 
    FROM course_progress 
    WHERE course_id = $1 AND progress >= 100`
rows, err := db.Query(completionQuery, courseID)
// ... scan และเก็บใน completionStatus map
```

#### สร้างรายการพนักงานพร้อมสถานะ
```go
// Build eligible users list with completion status
var eligibleUsersList []map[string]interface{}
for _, user := range eligibleUsers {
    userID := user["user_id"].(int)
    eligibleUsersList = append(eligibleUsersList, map[string]interface{}{
        "user_id":   userID,
        "user_name": user["user_name"],
        "position":  user["position"],
        "completed": completionStatus[userID], // true = ทำเสร็จ, false = ยังไม่ได้ทำ
    })
}
```

#### เพิ่มในการ Response
```go
c.JSON(http.StatusOK, gin.H{
    "course_id":       courseID,
    "course_title":    courseTitle,
    "visibility":      visibility,        // ← เพิ่ม
    "statistics":      ...,
    "all_scores":      ...,
    "distribution":    ...,
    "eligible_users":  eligibleUsersList,  // ← เพิ่ม
})
```

---

## การเปลี่ยนแปลงใน Frontend

### 1. อัปเดต HRDashboard Component

**ไฟล์:** `/front-end/src/components/dashboard/HRDashboard.jsx`

#### แทนที่ตาราง "รายชื่อทั้งหมด" (All Scores List)

**เดิม:** แสดงรายชื่อผู้ที่ทำข้อสอบแล้วพร้อมคะแนน
```jsx
<h3>รายชื่อทั้งหมด</h3>
<table>
    {courseStats.all_scores.map((score, idx) => (
        <tr>
            <td>{score.user_name}</td>
            <td>{score.exam_title}</td>
            <td>{score.score.toFixed(1)}%</td>
            <td>{score.created_at}</td>
        </tr>
    ))}
</table>
```

**ใหม่:** แสดงรายชื่อพนักงานที่มีสิทธิ์เข้าถึง Course พร้อมสถานะ
```jsx
<h3>รายชื่อพนักงานที่สามารถทำ Course นี้ได้</h3>
<table>
    <thead>
        <tr>
            <th>ชื่อพนักงาน</th>
            <th>ตำแหน่ง</th>
            <th>สถานะ</th>
        </tr>
    </thead>
    <tbody>
        {courseStats.eligible_users && courseStats.eligible_users.length > 0 ? (
            courseStats.eligible_users.map((user, idx) => (
                <tr key={idx}>
                    <td>{user.user_name}</td>
                    <td>{user.position || '-'}</td>
                    <td>
                        {user.completed ? (
                            <span className="bg-green-100 text-green-800">
                                ✓ ทำเสร็จแล้ว
                            </span>
                        ) : (
                            <span className="bg-yellow-100 text-yellow-800">
                                ⏱ ยังไม่ได้ทำ
                            </span>
                        )}
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="3">ไม่มีพนักงานที่สามารถเข้าถึง Course นี้ได้</td>
            </tr>
        )}
    </tbody>
</table>
```

#### UI/UX ของ Badge สถานะ

**ทำเสร็จแล้ว** (Completed)
- สีเขียว: `bg-green-100 text-green-800`
- ไอคอน: ✓ (checkmark ในวงกลม)
- ข้อความ: "ทำเสร็จแล้ว"

**ยังไม่ได้ทำ** (Not Completed)
- สีเหลือง: `bg-yellow-100 text-yellow-800`
- ไอคอน: ⏱ (นาฬิกา)
- ข้อความ: "ยังไม่ได้ทำ"

---

## ตัวอย่างการใช้งาน

### กรณีที่ 1: Course "Customer Service" (visibility = "all")

**พนักงานทั้งหมดในระบบ:**
1. นาย A (Manager) - **ทำเสร็จแล้ว** ✅
2. นาง B (Waiter) - **ยังไม่ได้ทำ** ⏱
3. นางสาว C (Barista) - **ยังไม่ได้ทำ** ⏱
4. นาย D (Cashier) - **ทำเสร็จแล้ว** ✅

**ตารางจะแสดง:** ทั้ง 4 คน พร้อมสถานะ

---

### กรณีที่ 2: Course "Coffee Making" (visibility = "position", positions = ["Barista"])

**พนักงานทั้งหมดในระบบ:**
1. นาย A (Manager) 
2. นาง B (Waiter)
3. นางสาว C (Barista) - **ทำเสร็จแล้ว** ✅
4. นาย D (Cashier)
5. นางสาว E (Barista) - **ยังไม่ได้ทำ** ⏱

**ตารางจะแสดง:** เฉพาะคนที่มี position = "Barista" (นางสาว C และ E) พร้อมสถานะ

---

### กรณีที่ 3: Course "Management Training" (visibility = "specific", selected users = [1, 3])

**พนักงานทั้งหมดในระบบ:**
1. นาย A (Manager) - user_id = 1 - **ทำเสร็จแล้ว** ✅
2. นาง B (Waiter) - user_id = 2
3. นางสาว C (Barista) - user_id = 3 - **ยังไม่ได้ทำ** ⏱
4. นาย D (Cashier) - user_id = 4

**ตารางจะแสดง:** เฉพาะ นาย A และ นางสาว C พร้อมสถานะ

---

## การตรวจสอบสถานะความสำเร็จ (Completion Logic)

สถานะ "ทำเสร็จแล้ว" ถูกกำหนดจาก table `course_progress`:

```sql
SELECT user_id 
FROM course_progress 
WHERE course_id = $1 AND progress >= 100
```

- **progress >= 100** = ทำเสร็จแล้ว (completed = true)
- **progress < 100 หรือไม่มีใน table** = ยังไม่ได้ทำ (completed = false)

---

## ประโยชน์ของ Feature นี้

### สำหรับ HR:
1. ✅ **มองเห็นภาพรวม** - เห็นว่าใครบ้างที่ควรทำ Course นี้
2. ✅ **ติดตามความคืบหน้า** - รู้ทันทีว่าใครทำเสร็จแล้ว ใครยังไม่ได้ทำ
3. ✅ **ตรงตาม Visibility** - แสดงเฉพาะพนักงานที่มีสิทธิ์เข้าถึง Course
4. ✅ **ช่วยในการติดตาม** - สามารถเตือนพนักงานที่ยังไม่ได้ทำได้

### เปรียบเทียบก่อนและหลัง:

| ก่อน | หลัง |
|------|------|
| แสดงเฉพาะคนที่ทำข้อสอบแล้ว | แสดงทุกคนที่มีสิทธิ์เข้าถึง Course |
| ไม่รู้ว่าใครบ้างที่ยังไม่ได้ทำ | เห็นสถานะชัดเจน: ทำเสร็จ vs ยังไม่ได้ทำ |
| แสดงคะแนนข้อสอบ | แสดงสถานะการทำ Course ทั้งหมด |

---

## ไฟล์ที่แก้ไข

### Backend
1. ✅ `/back-end/back-end-API/main.go`
   - เพิ่มการดึง visibility ของ Course
   - เพิ่มการกรองพนักงานตาม visibility settings
   - เพิ่มการตรวจสอบสถานะความสำเร็จจาก course_progress
   - เพิ่ม field `eligible_users` และ `visibility` ใน response

### Frontend
1. ✅ `/front-end/src/components/dashboard/HRDashboard.jsx`
   - แทนที่ตาราง "รายชื่อทั้งหมด" จาก `all_scores` เป็น `eligible_users`
   - เพิ่มคอลัมน์ "ตำแหน่ง" และ "สถานะ"
   - เพิ่ม UI badge สำหรับสถานะ (เขียว = เสร็จ, เหลือง = ยังไม่ได้ทำ)

---

## วิธีการทดสอบ

### 1. ทดสอบผ่าน API
```bash
# ทดสอบ Course ที่มี visibility = "all"
curl http://localhost:8080/api/hr/course-stats/2 | jq '.eligible_users'

# ทดสอบ Course ที่มี visibility = "position"
curl http://localhost:8080/api/hr/course-stats/4 | jq '.eligible_users'

# ทดสอบ Course ที่มี visibility = "specific"
curl http://localhost:8080/api/hr/course-stats/3 | jq '.eligible_users'
```

### 2. ทดสอบผ่าน UI
1. เข้าสู่ระบบด้วย HR account
2. ไปที่หน้า "Dashboard"
3. เลือก Course จากดรอปดาวน์ "คะแนนแยกตามคอร์ส"
4. เลื่อนลงไปที่ตาราง "รายชื่อพนักงานที่สามารถทำ Course นี้ได้"
5. ตรวจสอบว่า:
   - แสดงเฉพาะพนักงานที่มีสิทธิ์ตาม visibility
   - มีคอลัมน์ "ตำแหน่ง" แสดงอย่างถูกต้อง
   - สถานะแสดง "ทำเสร็จแล้ว" (เขียว) หรือ "ยังไม่ได้ทำ" (เหลือง)

---

## Technical Notes

### 1. Performance Considerations
- API query ถูกแยกเป็น 3 queries:
  1. ดึงพนักงานที่มีสิทธิ์ตาม visibility
  2. ดึงสถานะความสำเร็จจาก course_progress
  3. ดึงคะแนนสอบเพื่อสถิติ
- ใช้ `map[int]bool` สำหรับ O(1) lookup ของสถานะ completion

### 2. Database Tables ที่เกี่ยวข้อง
- `users` - ข้อมูลพนักงาน (id, name, position, role)
- `courses` - ข้อมูล Course (id, title, visibility)
- `course_access` - รายชื่อผู้ใช้ที่มีสิทธิ์ (visibility = "specific")
- `course_positions` - รายการตำแหน่งที่มีสิทธิ์ (visibility = "position")
- `course_progress` - สถานะการทำ Course (progress >= 100 = เสร็จ)

### 3. Edge Cases ที่ต้องระวัง
- ✅ Course ที่ visibility = "hidden" จะไม่แสดงพนักงานเลย
- ✅ พนักงานที่ไม่มี position (NULL) จะแสดง "-" ในตาราง
- ✅ Course ที่ไม่มีใครมีสิทธิ์จะแสดงข้อความ "ไม่มีพนักงาน..."

---

**วันที่สร้าง:** 16 ตุลาคม 2568  
**ผู้พัฒนา:** GitHub Copilot  
**Status:** ✅ ทดสอบและใช้งานได้แล้ว
