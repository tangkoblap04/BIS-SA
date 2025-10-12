import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { courseService } from '../../services/course.service';
import { Link } from 'react-router-dom';

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

function EmployeeDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    completedHours: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      const coursesData = response.courses || response || [];
      setCourses(coursesData);

      // คำนวณสถิติ
      const total = coursesData.length;
      const completed = coursesData.filter(course => course.progress === 100).length;
      const inProgress = coursesData.filter(course => course.progress > 0 && course.progress < 100).length;
      const totalHours = coursesData.reduce((sum, course) => sum + (course.duration || 8), 0);
      const completedHours = coursesData.reduce((sum, course) => {
        const progress = course.progress || 0;
        return sum + ((course.duration || 8) * progress / 100);
      }, 0);

      setStats({
        totalCourses: total,
        completedCourses: completed,
        inProgressCourses: inProgress,
        totalHours,
        completedHours: Math.round(completedHours)
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      // ใช้ mock data ถ้า API ไม่ทำงาน
      setCourses(mockTrainingData.courses);
      setStats({
        totalCourses: mockTrainingData.courses.length,
        completedCourses: mockTrainingData.courses.filter(c => c.progress === 100).length,
        inProgressCourses: mockTrainingData.courses.filter(c => c.progress > 0 && c.progress < 100).length,
        totalHours: mockTrainingData.totalHours,
        completedHours: mockTrainingData.completedHours
      });
    } finally {
      setLoading(false);
    }
  };

  // ข้อมูลสำหรับ charts
  const courseStatusData = [
    { name: 'เสร็จสมบูรณ์', value: stats.completedCourses, fill: '#10B981' },
    { name: 'กำลังเรียน', value: stats.inProgressCourses, fill: '#3B82F6' },
    { name: 'ยังไม่เริ่ม', value: stats.totalCourses - stats.completedCourses - stats.inProgressCourses, fill: '#E5E7EB' }
  ];

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'สวัสดีตอนเช้า' :
    currentTime.getHours() < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 border-4 border-white/30">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {greeting}! {user?.name || 'ผู้ใช้'}
                </h1>
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {user?.role === 'employee' ? 'พนักงาน' : user?.role || 'ผู้ใช้'}
                </div>
                <p className="mt-2 text-blue-100">
                  ยินดีต้อนรับสู่ระบบการเรียนรู้ออนไลน์
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">วันที่</p>
              <p className="text-xl font-semibold">
                {new Date().toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คอร์สทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">เสร็จสมบูรณ์</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">กำลังเรียน</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ชั่วโมงที่เรียน</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedHours}</p>
                <p className="text-xs text-gray-500">จาก {stats.totalHours} ชั่วโมง</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Course List Section - Left 2/3 */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Courses */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">คอร์สของฉัน</h2>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ดูทั้งหมด
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-4">
                {courses.slice(0, 4).map((course, index) => (
                  <div key={course.id || index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{course.name || course.title}</h3>
                        <p className="text-sm text-gray-600">
                          ระยะเวลา {course.duration || 8} ชั่วโมง
                          <span className="mx-2">•</span>
                          หมวดหมู่: {course.category || 'ทั่วไป'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${(course.progress || 0) === 100
                          ? 'bg-green-100 text-green-800'
                          : (course.progress || 0) > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {course.progress || 0}%
                        </span>
                        <Link
                          to={`/courses/${course.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          เรียนต่อ
                        </Link>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${(course.progress || 0) === 100
                          ? 'bg-green-500'
                          : (course.progress || 0) > 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                          }`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500">ยังไม่มีคอร์สเรียน</p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      เริ่มเรียนเลย
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">ความคืบหน้าการเรียนรู้</h3>
              <div className="h-64">
                {stats.totalHours > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'ชั่วโมงเรียน', เรียนแล้ว: stats.completedHours, คงเหลือ: stats.totalHours - stats.completedHours }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="เรียนแล้ว" fill="#10B981" />
                      <Bar dataKey="คงเหลือ" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>ยังไม่มีข้อมูลการเรียนรู้</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Course Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">สถานะคอร์ส</h3>
              <div className="h-64">
                {stats.totalCourses > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {courseStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p>ยังไม่มีข้อมูลคอร์ส</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">เมนูด่วน</h3>
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">เรียนคอร์ส</p>
                    <p className="text-sm text-gray-500">ดูคอร์สทั้งหมด</p>
                  </div>
                </Link>

                <button className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group w-full">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium">ทำแบบทดสอบ</p>
                    <p className="text-sm text-gray-500">ทดสอบความรู้</p>
                  </div>
                </button>

                <button className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group w-full">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium">ดูผลการเรียน</p>
                    <p className="text-sm text-gray-500">รายงานคะแนน</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">สรุปความคืบหน้า</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">เปอร์เซ็นต์ที่เรียนแล้ว</span>
                  <span className="font-bold text-blue-900">
                    {stats.totalHours > 0 ? Math.round((stats.completedHours / stats.totalHours) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${stats.totalHours > 0 ? (stats.completedHours / stats.totalHours) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  {stats.completedHours} จาก {stats.totalHours} ชั่วโมง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;