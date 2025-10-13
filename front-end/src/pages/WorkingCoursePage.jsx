import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COURSE_CATEGORIES } from '../constants/categories';
import { authService } from '../services/auth.service';
import { courseService } from '../services/course.service';

function WorkingCoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');

            // Get current user
            const user = authService.getCurrentUser();

            // Fetch courses with user_id for access filtering
            const response = await courseService.getAllCourses(user?.id);

            // Ensure coursesData is always an array
            let coursesData = [];
            if (Array.isArray(response)) {
                coursesData = response;
            } else if (response && Array.isArray(response.courses)) {
                coursesData = response.courses;
            } else if (response && response.courses) {
                coursesData = [];
            }

            setCourses(coursesData);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('ไม่สามารถโหลดคอร์สได้');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryValue) => {
        const updatedCategories = selectedCategories.includes(categoryValue)
            ? selectedCategories.filter(id => id !== categoryValue)
            : [...selectedCategories, categoryValue];
        setSelectedCategories(updatedCategories);
    };

    const filteredCourses = selectedCategories.length === 0
        ? courses
        : courses.filter(course => selectedCategories.includes(course.category));

    const getCategoryLabel = (category) => {
        const categoryMap = {
            'management': '💼 การจัดการ',
            'customer-service': '🤝 การบริการลูกค้า',
            'technical': '⚙️ เทคนิค',
            'soft-skills': '🌟 ทักษะส่วนบุคคล',
            'compliance': '📋 การปฏิบัติตามกฎระเบียบ'
        };
        return categoryMap[category] || `📚 ${category}`;
    };

    const getCategoryColor = (category) => {
        const colorMap = {
            'management': 'bg-blue-100 text-blue-800',
            'customer-service': 'bg-green-100 text-green-800',
            'technical': 'bg-purple-100 text-purple-800',
            'soft-skills': 'bg-pink-100 text-pink-800',
            'compliance': 'bg-orange-100 text-orange-800'
        };
        return colorMap[category] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดคอร์ส...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">❌ {error}</div>
                    <button
                        onClick={fetchCourses}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 หลักสูตรการอบรม</h1>
                    <p className="text-gray-600">เลือกคอร์สที่คุณสนใจเพื่อเริ่มการเรียนรู้</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">คอร์สทั้งหมด</p>
                                <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <span className="text-2xl">📚</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">หมวดหมู่</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {new Set(courses.map(c => c.category)).size}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <span className="text-2xl">🏷️</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ชั่วโมงรวม</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {Math.round(courses.reduce((sum, c) => sum + (c.duration || 0), 0) / 60)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <span className="text-2xl">⏰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content with Sidebar */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">🏷️</span>
                                กรองตามหมวดหมู่
                            </h3>
                            <div className="space-y-3">
                                {COURSE_CATEGORIES.map(category => (
                                    <label
                                        key={category.value}
                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.value)}
                                            onChange={() => handleCategoryChange(category.value)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-xl">{category.icon}</span>
                                        <span className="text-sm text-gray-700">{category.label}</span>
                                    </label>
                                ))}
                            </div>
                            {selectedCategories.length > 0 && (
                                <button
                                    onClick={() => setSelectedCategories([])}
                                    className="mt-4 w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="flex-1">
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <div className="text-6xl mb-4">📖</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {selectedCategories.length > 0 ? 'ไม่พบคอร์สที่ตรงกับเงื่อนไข' : 'ยังไม่มีคอร์สในระบบ'}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedCategories.length > 0 ? 'ลองเปลี่ยนตัวกรองหรือล้างตัวกรอง' : 'กรุณารอการเพิ่มคอร์สจาก HR'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                                    >
                                        {/* Course Header */}
                                        <div className="relative">
                                            <div className="w-full h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <div className="text-4xl mb-2">
                                                        {course.category === 'management' ? '💼' :
                                                            course.category === 'customer-service' ? '🤝' :
                                                                course.category === 'technical' ? '⚙️' :
                                                                    course.category === 'soft-skills' ? '🌟' : '📚'}
                                                    </div>
                                                    <div className="text-sm font-medium opacity-90">
                                                        {getCategoryLabel(course.category).replace(/^\S+\s/, '')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                                                {getCategoryLabel(course.category)}
                                            </div>
                                        </div>

                                        {/* Course Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                                                {course.title}
                                            </h3>

                                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                                                {course.description || 'ไม่มีคำอธิบาย'}
                                            </p>

                                            {/* Course Info */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <span className="w-4 h-4 mr-2">👨‍🏫</span>
                                                    ผู้สร้าง: {course.creator_name || 'ไม่ระบุ'}
                                                </div>

                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <span className="w-4 h-4 mr-2">⏱️</span>
                                                    ระยะเวลา: {course.duration ?
                                                        `${Math.floor(course.duration / 60)} ชั่วโมง ${course.duration % 60} นาที` :
                                                        'ไม่ระบุ'
                                                    }
                                                </div>

                                                {course.created_at && (
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <span className="w-4 h-4 mr-2">📅</span>
                                                        สร้างเมื่อ: {new Date(course.created_at).toLocaleDateString('th-TH')}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                to={`/courses/${course.id}`}
                                                className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                                            >
                                                🚀 เริ่มเรียนเลย
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-12 text-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        ← กลับไปหน้าหลัก
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default WorkingCoursePage;