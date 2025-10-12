# แก้ไขปัญหา HR ไม่สามารถเข้า /add-user ได้

## ปัญหาที่พบ:
1. **ไม่มีลิงก์ในหน้า HR Dashboard** - ไม่มีปุ่มหรือลิงก์ให้ HR คลิกไปหน้า Add User
2. **Route configuration ผิด** - ใช้ nested Routes ที่ซับซ้อนเกินไป

## การแก้ไข:

### 1. เพิ่มปุ่ม "Add User" ใน HR Dashboard
```jsx
// เพิ่มปุ่มใน HRDashboard.jsx
<button
  onClick={() => navigate('/hr-dashboard/add-user')}
  className="w-full text-left px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
>
  Add User
</button>
```

### 2. แก้ไข Route Configuration ใน App.jsx
เปลี่ยนจาก nested routes เป็น separate routes:
```jsx
// Before (ปัญหา)
<Route path="/hr-dashboard/*" element={...}>
  <Routes>
    <Route index element={<HRDashboard />} />
    <Route path="add-user" element={<AddUser />} />
  </Routes>
</Route>

// After (แก้ไขแล้ว)
<Route path="/hr-dashboard" element={...} />
<Route path="/hr-dashboard/add-user" element={...} />
```

### 3. แก้ไข Default Route
เพิ่ม logic เพื่อ redirect ตาม role:
```jsx
<Route
  path="/"
  element={
    user ? (
      user.role === 'HR' ? (
        <Navigate to="/hr-dashboard" replace />
      ) : (
        <Navigate to="/dashboard" replace />
      )
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>
```

## วิธีทดสอบ:
1. Login ด้วย HR account: `thanin@company.com` / `password123`
2. จะเห็นปุ่ม "Add User" ใน sidebar ของ HR Dashboard
3. คลิกปุ่ม "Add User" จะไปหน้า `/hr-dashboard/add-user`
4. สามารถเพิ่มผู้ใช้ใหม่ได้ทั้ง HR และ Employee role

## URLs ที่ใช้งานได้แล้ว:
- `/login` - หน้า Login
- `/hr-dashboard` - HR Dashboard (HR only)
- `/hr-dashboard/add-user` - Add User Page (HR only)
- `/dashboard` - Employee Dashboard (Employee only)
- `/courses` - Courses Page (ทั้ง HR และ Employee)

🎉 **ตอนนี้ HR สามารถเข้าหน้า Add User ได้แล้ว!**