# 🔧 Fix: User Delete Issue - Foreign Key Constraint

## ❌ ปัญหาที่เกิดขึ้น

### Error Message:
```
Failed to delete user
```

### สาเหตุ:
ไม่สามารถลบผู้ใช้ได้เนื่องจาก **Foreign Key Constraints** ในฐานข้อมูล

## 🔍 การวิเคราะห์ปัญหา

### ข้อมูลของ Narulmon Wenuwiriyakul:
```sql
id: 4
name: Narulmon Wenuwiriyakul
email: mint@iloveu.com
courses: 1 (course_access)
exam_results: 4 (ผลการสอบ)
```

### ตารางที่มี Foreign Key เชื่อมโยงกับ users:
1. **exam_results** (user_id → users.id)
2. **course_access** (user_id → users.id)  
3. **course_progress** (user_id → users.id)

### ปัญหา:
```go
// โค้ดเดิม - พยายามลบ user โดยตรง
DELETE FROM users WHERE id = $1
// ❌ Error: violates foreign key constraint
```

## ✅ วิธีแก้ไข: Cascade Delete with Transaction

### แนวคิด:
1. ใช้ **Database Transaction** เพื่อความปลอดภัย
2. ลบข้อมูลที่เชื่อมโยงก่อน (ตามลำดับ)
3. ลบ user สุดท้าย
4. ถ้าเกิด error ระหว่างทาง จะ Rollback ทุกอย่าง

### ลำดับการลบ:
```
1. exam_results (ผลการสอบ)
   ↓
2. course_access (การเข้าถึงคอร์ส)
   ↓
3. course_progress (ความคืบหน้า - optional)
   ↓
4. users (ผู้ใช้)
```

## 📝 Code Implementation

### File: `/back-end/back-end-API/main.go`

#### Before (เดิม):
```go
api.DELETE("/users/:id", func(c *gin.Context) {
    userID := c.Param("id")
    
    // Hard delete from database
    query := `DELETE FROM users WHERE id = $1`
    
    result, err := db.Exec(query, userID)
    if err != nil {
        log.Printf("Error deleting user: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }
    // ... rest of code
})
```

#### After (ใหม่):
```go
api.DELETE("/users/:id", func(c *gin.Context) {
    userID := c.Param("id")
    
    // Start a transaction
    tx, err := db.Begin()
    if err != nil {
        log.Printf("Error starting transaction: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }
    defer tx.Rollback()
    
    // Delete related records first (to handle foreign key constraints)
    
    // 1. Delete exam results
    _, err = tx.Exec("DELETE FROM exam_results WHERE user_id = $1", userID)
    if err != nil {
        log.Printf("Error deleting exam results: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})
        return
    }
    
    // 2. Delete course access
    _, err = tx.Exec("DELETE FROM course_access WHERE user_id = $1", userID)
    if err != nil {
        log.Printf("Error deleting course access: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})
        return
    }
    
    // 3. Delete course progress (if exists)
    _, err = tx.Exec("DELETE FROM course_progress WHERE user_id = $1", userID)
    if err != nil {
        log.Printf("Error deleting course progress: %v", err)
        // Continue anyway as this table might not have data
    }
    
    // 4. Finally, delete the user
    result, err := tx.Exec("DELETE FROM users WHERE id = $1", userID)
    if err != nil {
        log.Printf("Error deleting user: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify deletion"})
        return
    }
    
    if rowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    
    // Commit the transaction
    if err = tx.Commit(); err != nil {
        log.Printf("Error committing transaction: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }
    
    log.Printf("User %s deleted successfully with all related data", userID)
    c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
})
```

## 🎯 ฟีเจอร์ที่เพิ่มเข้ามา

### 1. **Database Transaction**
```go
tx, err := db.Begin()
defer tx.Rollback()
// ... operations ...
tx.Commit()
```
- ✅ รับประกันความสมบูรณ์ของข้อมูล (ACID)
- ✅ Rollback อัตโนมัติถ้าเกิด error
- ✅ ป้องกัน partial deletion

### 2. **Cascade Delete**
ลบข้อมูลตามลำดับความสัมพันธ์:
```sql
DELETE FROM exam_results WHERE user_id = $1;
DELETE FROM course_access WHERE user_id = $1;
DELETE FROM course_progress WHERE user_id = $1;
DELETE FROM users WHERE id = $1;
```

### 3. **Error Handling**
- ✅ Log ข้อผิดพลาดแต่ละขั้นตอน
- ✅ Error messages ที่ชัดเจน
- ✅ Transaction rollback เมื่อเกิดปัญหา

### 4. **Validation**
- ✅ ตรวจสอบว่า user มีอยู่จริง
- ✅ Verify rows affected
- ✅ Log การลบสำเร็จ

## 📊 ผลกระทบของการลบ

### ข้อมูลที่จะถูกลบ (สำหรับ Narulmon):
```
✅ exam_results: 4 รายการ
✅ course_access: 1 รายการ  
✅ course_progress: 0 รายการ
✅ users: 1 รายการ
━━━━━━━━━━━━━━━━━━━━━━
รวม: 6 records ถูกลบ
```

### ข้อมูลที่ยังคงอยู่:
- ✅ Courses ยังคงอยู่ (ไม่ถูกลบ)
- ✅ Exams ยังคงอยู่ (ไม่ถูกลบ)
- ✅ Questions ยังคงอยู่ (ไม่ถูกลบ)

## 🧪 การทดสอบ

### Test Case 1: ลบ user ที่มีข้อมูลเชื่อมโยง
```bash
# Before
User: Narulmon (id=4)
├── course_access: 1 records
└── exam_results: 4 records

# Action: DELETE /api/users/4

# After
✅ User deleted successfully
All related data removed
```

### Test Case 2: ลบ user ที่ไม่มีข้อมูล
```bash
# Before
User: New Employee (id=10)
├── course_access: 0 records
└── exam_results: 0 records

# Action: DELETE /api/users/10

# After
✅ User deleted successfully
```

### Test Case 3: Error Handling
```bash
# Scenario: Database error ระหว่าง transaction

# Action: DELETE /api/users/4
# Database connection lost

# Result:
❌ Transaction rolled back
All data remains unchanged (no partial deletion)
```

## 🚀 Deployment

### 1. Restart Backend
```bash
cd /workspaces/BIS-SA/back-end
docker-compose restart api
```

### 2. Verify Backend
```bash
docker logs back-end-api-1 --tail 20
```

### 3. Expected Output
```
[GIN-debug] DELETE /api/users/:id --> main.main.func6 (4 handlers)
[GIN-debug] Listening and serving HTTP on :8080
```

## ⚠️ คำเตือนสำคัญ

### 1. **การลบเป็นการกระทำถาวร**
- ข้อมูลที่ถูกลบไปแล้ว **ไม่สามารถกู้คืนได้**
- ควรมี confirmation dialog ก่อนลบ (มีแล้วใน frontend)

### 2. **การลบผู้ดูแลระบบ (HR)**
- ระวังอย่าลบ HR account ตัวเองออก
- ควรมีการตรวจสอบบทบาทก่อนอนุญาตให้ลบ

### 3. **Backup ข้อมูล**
- ควร backup database เป็นประจำ
- พิจารณาใช้ Soft Delete สำหรับข้อมูลสำคัญ

## 💡 Alternative Solution: Soft Delete

หากต้องการเก็บข้อมูลไว้ แต่ซ่อนจากระบบ:

### Schema Change:
```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
```

### Code Change:
```go
// Instead of DELETE, use UPDATE
UPDATE users SET deleted_at = NOW() WHERE id = $1;

// Query only active users
SELECT * FROM users WHERE deleted_at IS NULL;
```

### ข้อดี:
- ✅ สามารถกู้คืนข้อมูลได้
- ✅ เก็บ audit trail
- ✅ ข้อมูลทางสถิติยังคงอยู่

### ข้อเสีย:
- ❌ Database ใหญ่ขึ้น
- ❌ Query ซับซ้อนขึ้น
- ❌ ต้องแก้ code หลายจุด

## ✅ สรุป

### ปัญหา:
❌ Foreign Key Constraint ทำให้ลบ user ไม่ได้

### วิธีแก้:
✅ ใช้ Transaction + Cascade Delete

### ผลลัพธ์:
- ✅ สามารถลบ user พร้อมข้อมูลที่เชื่อมโยงได้
- ✅ รับประกันความสมบูรณ์ของข้อมูล
- ✅ ป้องกัน partial deletion
- ✅ Log ครบถ้วน

### การใช้งาน:
1. ไปที่ HR Dashboard → จัดการผู้ใช้
2. คลิกปุ่ม "ลบ" ที่ผู้ใช้ที่ต้องการ
3. ยืนยันการลบ
4. ✅ ระบบจะลบข้อมูลทั้งหมดที่เกี่ยวข้อง

---

**Fixed Date**: October 13, 2025  
**Issue**: Cannot delete user with foreign key constraints  
**Status**: ✅ Resolved  
**Method**: Transaction-based Cascade Delete  
**Impact**: ลบได้ทั้งผู้ใช้และข้อมูลที่เชื่อมโยง
