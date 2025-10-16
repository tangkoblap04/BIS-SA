import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { courseService } from '../../services/course.service';
import { Link } from 'react-router-dom';

// Mock data สำหรับ demo
const mockAchievements = [
    {
        id: 1,
        title: 'นักเรียนดีเด่น',
        description: 'เรียนจบคอร์สแรกเรียบร้อยแล้ว',
        icon: '🏆',
        date: '2024-01-15',
        type: 'gold'
    },
    {
        id: 2,
        title: 'กำลังใจดี',
        description: 'เรียนต่อเนื่อง 7 วันติดต่อกัน',
        icon: '🔥',
        date: '2024-01-20',
        type: 'streak'
    },
    {
        id: 3,
        title: 'ผู้เรียนรู้',
        description: 'ชมวิดีโอครบ 10 ชั่วโมง',
        icon: '📚',
        date: '2024-01-25',
        type: 'learning'
    }
];

const mockUpcomingDeadlines = [
    {
        id: 1,
        courseName: 'การบริการลูกค้าเบื้องต้น',
        deadline: '2024-02-15',
        type: 'exam',
        urgent: false
    },
    {
        id: 2,
        courseName: 'การจัดการข้อร้องเรียน',
        deadline: '2024-02-10',
        type: 'assignment',
        urgent: true
    }
];

function EmployeeHomepage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalHours: 0,
        completedHours: 0,
        weeklyProgress: []
    });

    useEffect(() => {
        fetchCourses();
        generateWeeklyProgress();
    }, []);

    // เพิ่ม effect สำหรับ refresh ข้อมูลเมื่อกลับมาที่หน้านี้
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('Homepage visible - refreshing data');
                fetchCourses();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getAllCourses();
            const coursesData = response.courses || response || [];
            setCourses(coursesData.slice(0, 6)); // แสดงเพียง 6 คอร์สล่าสุด

            // คำนวณสถิติ
            const total = coursesData.length;
            const completed = coursesData.filter(course => (course.progress || 0) === 100).length;
            const inProgress = coursesData.filter(course => (course.progress || 0) > 0 && (course.progress || 0) < 100).length;
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
            // ใช้ mock data
            setCourses([]);
            setStats({
                totalCourses: 3,
                completedCourses: 1,
                inProgressCourses: 2,
                totalHours: 24,
                completedHours: 16
            });
        } finally {
            setLoading(false);
        }
    };

    const generateWeeklyProgress = () => {
        // Mock weekly progress data
        const weeklyData = [
            { day: 'จ', hours: 2 },
            { day: 'อ', hours: 1.5 },
            { day: 'พ', hours: 3 },
            { day: 'พฤ', hours: 2.5 },
            { day: 'ศ', hours: 1 },
            { day: 'ส', hours: 0 },
            { day: 'อา', hours: 2 }
        ];
        setStats(prev => ({ ...prev, weeklyProgress: weeklyData }));
    };

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
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white rounded-full transform translate-x-32 -translate-y-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white rounded-full transform -translate-x-24 translate-y-24"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 border-4 border-white/30 shadow-xl">
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    {greeting}!
                                </h1>
                                <h2 className="text-2xl font-semibold text-blue-100 mb-3">
                                    {user?.name || 'ผู้ใช้'}
                                </h2>
                                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {user?.role === 'employee' ? 'พนักงาน' : user?.role || 'ผู้ใช้'}
                                </div>
                            </div>
                        </div>

                        <div className="text-center lg:text-right">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <p className="text-blue-100 text-sm mb-1">วันนี้</p>
                                <p className="text-2xl font-bold mb-2">
                                    {new Date().toLocaleDateString('th-TH', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </p>
                                <p className="text-blue-200 text-sm">
                                    {new Date().toLocaleDateString('th-TH', {
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">คอร์สทั้งหมด</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                                <p className="text-xs text-green-600 mt-1">▲ เพิ่มขึ้น 12%</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">เสร็จสมบูรณ์</p>
                                <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
                                <p className="text-xs text-green-600 mt-1">✓ ยอดเยี่ยม!</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">กำลังเรียน</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.inProgressCourses}</p>
                                <p className="text-xs text-blue-600 mt-1">📚 เก่งมาก!</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">ชั่วโมงเรียน</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.completedHours}</p>
                                <p className="text-xs text-gray-500 mt-1">จาก {stats.totalHours} ชั่วโมง</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Courses and Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Courses */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">คอร์สของฉัน</h2>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                                >
                                    ดูทั้งหมด
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.length > 0 ? courses.map((course, index) => (
                                    <div key={course.id || index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300 group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {course.name || course.title || `คอร์สที่ ${index + 1}`}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    ⏱️ {course.duration || 8} ชั่วโมง
                                                    <span className="mx-2">•</span>
                                                    📂 {course.category || 'ทั่วไป'}
                                                </p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${(course.progress || 0) === 100 ? 'bg-green-500'
                                                            : (course.progress || 0) > 50 ? 'bg-blue-500'
                                                                : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${course.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${(course.progress || 0) === 100 ? 'bg-green-100 text-green-800'
                                                : (course.progress || 0) > 0 ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {course.progress || 0}%
                                            </span>
                                            <Link
                                                to={`/courses/${course.id || index}`}
                                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                {(course.progress || 0) === 0 ? 'เริ่มเรียน' : 'เรียนต่อ'}
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-12">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีคอร์สเรียน</h3>
                                        <p className="text-gray-600 mb-4">เริ่มต้นการเรียนรู้ของคุณวันนี้</p>
                                        <Link
                                            to="/courses"
                                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                                        >
                                            🚀 สำรวจคอร์ส
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Weekly Progress Chart */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">ความคืบหน้าสัปดาห์นี้</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.weeklyProgress}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(label) => `วัน${label}`}
                                            formatter={(value) => [`${value} ชั่วโมง`, 'เวลาเรียน']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="hours"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Course Status Pie Chart */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">สถานะคอร์ส</h3>
                            <div className="h-48">
                                {stats.totalCourses > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={courseStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={70}
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
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">ยังไม่มีข้อมูลคอร์ส</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 ความสำเร็จล่าสุด</h3>
                            <div className="space-y-3">
                                {mockAchievements.slice(0, 3).map((achievement) => (
                                    <div key={achievement.id} className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                        <div className="text-2xl mr-3">{achievement.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 text-sm">{achievement.title}</h4>
                                            <p className="text-xs text-gray-600">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">⚡ เมนูด่วน</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/courses"
                                    className="flex items-center p-4 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors group border border-gray-100 hover:border-blue-200"
                                >
                                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg group-hover:shadow-lg transition-all">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold">เรียนคอร์ส</p>
                                        <p className="text-sm text-gray-500">ดูคอร์สทั้งหมด</p>
                                    </div>
                                </Link>

                                <button className="flex items-center p-4 text-gray-700 rounded-xl hover:bg-green-50 transition-colors group w-full border border-gray-100 hover:border-green-200">
                                    <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg group-hover:shadow-lg transition-all">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4 text-left">
                                        <p className="font-semibold">ทำแบบทดสอบ</p>
                                        <p className="text-sm text-gray-500">ทดสอบความรู้</p>
                                    </div>
                                </button>

                                <button className="flex items-center p-4 text-gray-700 rounded-xl hover:bg-purple-50 transition-colors group w-full border border-gray-100 hover:border-purple-200">
                                    <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg group-hover:shadow-lg transition-all">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4 text-left">
                                        <p className="font-semibold">ดูผลการเรียน</p>
                                        <p className="text-sm text-gray-500">รายงานคะแนน</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-4">📊 สรุปความคืบหน้า</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-100">เปอร์เซ็นต์ที่เรียนแล้ว</span>
                                    <span className="font-bold text-2xl">
                                        {stats.totalHours > 0 ? Math.round((stats.completedHours / stats.totalHours) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-white to-blue-200 h-3 rounded-full transition-all shadow-sm"
                                        style={{
                                            width: `${stats.totalHours > 0 ? (stats.completedHours / stats.totalHours) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm text-blue-100">
                                    <span>{stats.completedHours} ชั่วโมง</span>
                                    <span>{stats.totalHours} ชั่วโมง</span>
                                </div>
                                <div className="pt-2 border-t border-white/20">
                                    <p className="text-sm text-blue-100">
                                        🎯 เป้าหมายสัปดาห์นี้: เรียน 15 ชั่วโมง
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeHomepage;