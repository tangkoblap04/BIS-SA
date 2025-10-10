import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data
const mockTrainingData = {
  userInfo: {
    name: 'คุณสมชาย ใจดี',
    position: 'พนักงานเสิร์ฟ',
    imageUrl: '/images/waiter.png',
    currentCourse: {
      name: 'การบริการลูกค้าเบื้องต้น',
      progress: 65
    }
  },
  // Example:
  totalHours: 24,
  completedHours: 16,
  courses: [
    {
      id: 1,
      name: 'การบริการลูกค้าเบื้องต้น',
      totalModules: 5,
      completedModules: 5,
      duration: 8,
      progress: 100
    },
    {
      id: 2,
      name: 'การจัดการข้อร้องเรียน',
      totalModules: 4,
      completedModules: 2,
      duration: 8,
      progress: 50
    },
    {
      id: 3,
      name: 'การทำงานเป็นทีม',
      totalModules: 6,
      completedModules: 3,
      duration: 8,
      progress: 30
    }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function EmployeeDashboard() {
  // ข้อมูลสำหรับ Overall Progress Pie Chart
  const overallProgressData = [
    { name: 'เรียนแล้ว', value: mockTrainingData.completedHours },
    { name: 'ยังไม่ได้เรียน', value: mockTrainingData.totalHours - mockTrainingData.completedHours }
  ];

  // ข้อมูลสำหรับ Course Progress Pie Chart
  const courseProgressData = [
    { 
      name: 'ความคืบหน้า', 
      value: mockTrainingData.userInfo.currentCourse.progress 
    },
    { 
      name: 'คงเหลือ', 
      value: 100 - mockTrainingData.userInfo.currentCourse.progress 
    }
  ];


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ดการอบรม</h1>

      {/* Employee Info Section - Top */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img
              src={mockTrainingData.userInfo.imageUrl}
              alt="ตำแหน่งงาน"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"%2F%3E%3C%2Fsvg%3E';
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {mockTrainingData.userInfo.name}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
              {mockTrainingData.userInfo.position}
            </div>
            <p className="text-gray-600 mt-2">
              กำลังเรียน: {mockTrainingData.userInfo.currentCourse.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course List Section - Left Half */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">รายละเอียดคอร์ส</h2>
          <div className="space-y-6">
            {mockTrainingData.courses.map((course) => (
              <div key={course.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{course.name}</h3>
                    <p className="text-sm text-gray-600">
                      {course.completedModules} จาก {course.totalModules} บทเรียน | 
                      ระยะเวลา {course.duration} ชั่วโมง
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${course.progress === 100 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}`}>
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      course.progress === 100 
                        ? 'bg-green-600' 
                        : course.progress > 50 
                          ? 'bg-blue-600' 
                          : 'bg-yellow-600'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Progress Chart - Right Half */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            ความคืบหน้าคอร์สปัจจุบัน
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => 
                    name === 'ความคืบหน้า' ? `${value}%` : ''
                  }
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseProgressData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {mockTrainingData.userInfo.currentCourse.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

}

export default EmployeeDashboard;