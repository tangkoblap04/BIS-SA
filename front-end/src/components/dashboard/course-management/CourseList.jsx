import React, { useState, useEffect } from 'react';
import { courseService } from '../../../services/course.service';

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

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
        setSelectedCourse({ ...course });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const updateData = {
                title: selectedCourse.title,
                description: selectedCourse.description,
                category: selectedCourse.category,
                duration: parseInt(selectedCourse.duration) || 0,
                video_url: selectedCourse.video_url
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

        const categories = [
            { value: 'management', label: 'การจัดการ' },
            { value: 'customer-service', label: 'การบริการลูกค้า' },
            { value: 'technical', label: 'เทคนิค' },
            { value: 'soft-skills', label: 'ทักษะส่วนบุคคล' },
            { value: 'compliance', label: 'การปฏิบัติตามกฎระเบียบ' }
        ];

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
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
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
                                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm">
                                    ดูรายละเอียด
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
        </div>
    );
}

export default CourseList;