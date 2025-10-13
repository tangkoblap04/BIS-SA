import React, { useState, useEffect } from 'react';
import { courseService } from '../../../services/course.service';
import { userService } from '../../../services/user.service';
import { COURSE_CATEGORIES } from '../../../constants/categories';

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewCourse, setPreviewCourse] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            const userList = data.users || data || [];
            // Filter out HR users, only show employees
            setUsers(userList.filter(u => u.role === 'employee'));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await courseService.getAllCourses();
            setCourses(response.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message || 'ไม่สามารถดึงข้อมูลคอร์สได้');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'ไม่ระบุ';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours} ชั่วโมง ${mins} นาที`;
        } else if (hours > 0) {
            return `${hours} ชั่วโมง`;
        } else {
            return `${mins} นาที`;
        }
    };

    const handleEdit = async (course) => {
        // Fetch course access if visibility is 'specific'
        let selectedUsers = [];
        if (course.visibility === 'specific') {
            try {
                const accessData = await courseService.getCourseAccess(course.id);
                selectedUsers = accessData.users || [];
            } catch (error) {
                console.error('Error fetching course access:', error);
            }
        }

        setSelectedCourse({
            ...course,
            selectedUsers: selectedUsers
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const updateData = {
                title: selectedCourse.title,
                description: selectedCourse.description,
                category: selectedCourse.category,
                duration: parseInt(selectedCourse.duration) || 0,
                video_url: selectedCourse.video_url,
                visibility: selectedCourse.visibility || 'all',
                selectedUsers: selectedCourse.visibility === 'specific' ? (selectedCourse.selectedUsers || []) : []
            };

            await courseService.updateCourse(selectedCourse.id, updateData);
            alert('อัปเดตคอร์สสำเร็จ');
            fetchCourses(); // Refresh the list
            setIsEditModalOpen(false);
            setSelectedCourse(null);
        } catch (error) {
            console.error('Error updating course:', error);
            alert('ไม่สามารถอัปเดตคอร์สได้: ' + error.message);
        }
    };

    const handleDelete = async (courseId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้? การลบจะไม่สามารถกู้คืนได้')) {
            try {
                await courseService.deleteCourse(courseId);
                alert('ลบคอร์สสำเร็จ');
                fetchCourses(); // Refresh the list
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('ไม่สามารถลบคอร์สได้: ' + error.message);
            }
        }
    };

    const handlePreview = (course) => {
        setPreviewCourse(course);
        setIsPreviewModalOpen(true);
    };

    const getCategoryLabel = (category) => {
        const categories = {
            'management': 'การจัดการ',
            'customer-service': 'การบริการลูกค้า',
            'technical': 'เทคนิค',
            'soft-skills': 'ทักษะส่วนบุคคล',
            'compliance': 'การปฏิบัติตามกฎระเบียบ'
        };
        return categories[category] || category;
    };

    const EditModal = () => {
        if (!selectedCourse) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                    <h3 className="text-lg font-medium mb-4">แก้ไขคอร์ส</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ชื่อคอร์ส
                            </label>
                            <input
                                type="text"
                                value={selectedCourse.title || ''}
                                onChange={(e) => setSelectedCourse({
                                    ...selectedCourse,
                                    title: e.target.value
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                คำอธิบาย
                            </label>
                            <textarea
                                value={selectedCourse.description || ''}
                                onChange={(e) => setSelectedCourse({
                                    ...selectedCourse,
                                    description: e.target.value
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    หมวดหมู่
                                </label>
                                <select
                                    value={selectedCourse.category || ''}
                                    onChange={(e) => setSelectedCourse({
                                        ...selectedCourse,
                                        category: e.target.value
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {COURSE_CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ระยะเวลา (นาที)
                                </label>
                                <input
                                    type="number"
                                    value={selectedCourse.duration || ''}
                                    onChange={(e) => setSelectedCourse({
                                        ...selectedCourse,
                                        duration: e.target.value
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL วิดีโอ
                            </label>
                            <input
                                type="url"
                                value={selectedCourse.video_url || ''}
                                onChange={(e) => setSelectedCourse({
                                    ...selectedCourse,
                                    video_url: e.target.value
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                        </div>

                        {/* Visibility Settings */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                การมองเห็น
                            </label>
                            <select
                                value={selectedCourse.visibility || 'all'}
                                onChange={(e) => {
                                    setSelectedCourse({
                                        ...selectedCourse,
                                        visibility: e.target.value,
                                        selectedUsers: [] // Reset selected users when changing visibility
                                    });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                                required
                            >
                                <option value="all">เปิดให้ทุกคนเห็น</option>
                                <option value="specific">เลือกผู้ใช้เฉพาะ</option>
                                <option value="hidden">ซ่อนจากทุกคน</option>
                            </select>

                            {selectedCourse.visibility === 'specific' && (
                                <div className="mt-4 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        เลือกผู้ใช้ที่สามารถเห็นคอร์สนี้
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50">
                                        {users.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-2">ไม่พบผู้ใช้ในระบบ</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(selectedCourse.selectedUsers || []).length === users.length}
                                                        onChange={(e) => {
                                                            const allUserIds = users.map(u => u.id);
                                                            setSelectedCourse({
                                                                ...selectedCourse,
                                                                selectedUsers: e.target.checked ? allUserIds : []
                                                            });
                                                        }}
                                                        className="h-4 w-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">เลือกทั้งหมด</span>
                                                </label>
                                                <div className="border-t border-gray-200 my-2"></div>
                                                {users.map((user) => (
                                                    <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={(selectedCourse.selectedUsers || []).includes(user.id)}
                                                            onChange={(e) => {
                                                                const currentUsers = selectedCourse.selectedUsers || [];
                                                                const updatedUsers = e.target.checked
                                                                    ? [...currentUsers, user.id]
                                                                    : currentUsers.filter(id => id !== user.id);
                                                                setSelectedCourse({ ...selectedCourse, selectedUsers: updatedUsers });
                                                            }}
                                                            className="h-4 w-4 text-blue-600 rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({user.email})</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {(selectedCourse.selectedUsers || []).length > 0 && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            เลือกแล้ว: {(selectedCourse.selectedUsers || []).length} คน
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setSelectedCourse(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PreviewModal = () => {
        if (!previewCourse) return null;

        const categoryInfo = COURSE_CATEGORIES.find(cat => cat.value === previewCourse.category) || {};

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                            👁️ ตัวอย่างที่พนักงานจะเห็น
                        </h3>
                        <button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Employee View Preview - Card Style */}
                    <div className="p-6">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-blue-200">
                            {/* Course Header Image */}
                            <div className="relative">
                                <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-6xl mb-2">
                                            {categoryInfo.icon || '📚'}
                                        </div>
                                        <p className="text-sm opacity-90">Course Image</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm">
                                    {categoryInfo.label || getCategoryLabel(previewCourse.category)}
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                    {previewCourse.title}
                                </h3>

                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {previewCourse.description || 'ไม่มีคำอธิบาย'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm">
                                            <span className="font-medium">ผู้สร้าง:</span> {previewCourse.creator_name || 'ไม่ระบุ'}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">
                                            <span className="font-medium">ระยะเวลา:</span> {formatDuration(previewCourse.duration)}
                                        </span>
                                    </div>

                                    {previewCourse.video_url && (
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-green-600">มีวิดีโอประกอบ</span>
                                        </div>
                                    )}
                                </div>

                                {/* Call to Action Button */}
                                <button
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                                             hover:bg-blue-700 transition-colors duration-300 
                                             font-medium focus:outline-none focus:ring-2 
                                             focus:ring-blue-500 focus:ring-offset-2"
                                    disabled
                                >
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-800 font-medium mb-1">
                                        นี่คือตัวอย่างการแสดงผล
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        พนักงานจะเห็นคอร์สนี้แบบนี้ในหน้ารายการคอร์สของพวกเขา
                                        {previewCourse.visibility === 'hidden' && (
                                            <span className="block mt-1 text-red-600 font-medium">
                                                ⚠️ คอร์สนี้ถูกซ่อนอยู่ - พนักงานจะไม่เห็นคอร์สนี้
                                            </span>
                                        )}
                                        {previewCourse.visibility === 'specific' && (
                                            <span className="block mt-1 text-orange-600 font-medium">
                                                🔒 คอร์สนี้จำกัดเฉพาะพนักงานที่เลือกไว้เท่านั้น
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
                        <button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">กำลังโหลดข้อมูลคอร์ส...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">รายการคอร์สทั้งหมด</h2>
                <button
                    onClick={fetchCourses}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    รีเฟรช
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            {courses.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-4">ยังไม่มีคอร์สในระบบ</div>
                    <p className="text-gray-400">เริ่มสร้างคอร์สแรกของคุณได้เลย</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        {course.description || 'ไม่มีคำอธิบาย'}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium ml-4">
                                    ID: {course.id}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm">หมวดหมู่:</span>
                                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        {getCategoryLabel(course.category)}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm">ระยะเวลา:</span>
                                    <span className="ml-2 text-gray-800 font-medium">
                                        {formatDuration(course.duration)}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm">ผู้สร้าง:</span>
                                    <span className="ml-2 text-gray-800">
                                        {course.creator_name || 'ไม่ระบุ'}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm">วันที่สร้าง:</span>
                                    <span className="ml-2 text-gray-800 text-sm">
                                        {formatDate(course.created_at)}
                                    </span>
                                </div>
                            </div>

                            {course.video_url && (
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm">Video URL:</span>
                                    <a
                                        href={course.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                    >
                                        {course.video_url}
                                    </a>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleEdit(course)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm"
                                >
                                    แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                                >
                                    ลบ
                                </button>
                                <button
                                    onClick={() => handlePreview(course)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
                                >
                                    👁️ ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 text-center text-gray-500 text-sm">
                พบทั้งหมด {courses.length} คอร์ส
            </div>

            {isEditModalOpen && <EditModal />}
            {isPreviewModalOpen && <PreviewModal />}
        </div>
    );
}

export default CourseList;