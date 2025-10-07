import CourseCard from './CourseCard';

function CourseList({ selectedRoles }) {
  const courses = [
    {
      id: 'manager-1',
      title: "การบริหารจัดการร้านอาหาร",
      description: "เรียนรู้การบริหารจัดการทีม การควบคุมต้นทุน และการพัฒนาธุรกิจ",
      instructor: "อ.สมชาย",
      duration: "16 ชั่วโมง",
      role: "manager",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0"
    },
    {
      id: 'waiter-1',
      title: "การบริการลูกค้าสำหรับพนักงานเสิร์ฟ",
      description: "เรียนรู้เทคนิคการบริการลูกค้า การจดจำเมนู และการจัดการคำสั่งอาหาร",
      instructor: "อ.สมหญิง",
      duration: "8 ชั่วโมง",
      role: "waiter",
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937"
    },
    {
      id: 'cashier-1',
      title: "การจัดการการเงินและการคิดเงิน",
      description: "เรียนรู้ระบบ POS การรับชำระเงิน และการจัดการบัญชี",
      instructor: "อ.ใจดี",
      duration: "10 ชั่วโมง",
      role: "cashier",
      image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0"
    },
    {
      id: 'service-1',
      title: "การบริการทั่วไปในร้านอาหาร",
      description: "เรียนรู้งานบริการทั่วไป การทำความสะอาด และการจัดการพื้นที่",
      instructor: "อ.รักงาน",
      duration: "6 ชั่วโมง",
      role: "service",
      image: "https://images.unsplash.com/photo-1562887245-138c2f45013e"
    }
  ];

  const filteredCourses = selectedRoles.length === 0
    ? courses
    : courses.filter(course => selectedRoles.includes(course.role));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export default CourseList;