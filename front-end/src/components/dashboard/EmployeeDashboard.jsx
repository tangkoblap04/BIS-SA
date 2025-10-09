import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data
const mockTrainingData = {
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
  const courseProgressData = mockTrainingData.courses.map(course => ({
    name: course.name,
    value: course.progress
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ดการอบรม</h1>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            ความคืบหน้าการอบรมโดยรวม
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overallProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            ความคืบหน้าแต่ละคอร์ส
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course List Section */}
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
    </div>
  );
}

export default EmployeeDashboard;