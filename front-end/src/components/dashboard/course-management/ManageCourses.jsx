import React, { useState, useEffect } from 'react';
import { ClockIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';
import { courseService } from '../../../services/course.service';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('ไม่สามารถโหลดข้อมูลคอร์สได้');
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

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">ไม่มีรูป</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center text-green-600">
                        <EyeIcon className="w-5 h-5 mr-1" />
                        เผยแพร่แล้ว
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {course.creator_name || 'ไม่ระบุ'}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {course.duration} นาที
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {course.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex flex-col space-y-2">
              <button
                onClick={() => handleEdit(course)}
                className="text-blue-600 hover:text-blue-800"
              >
                แก้ไข
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="text-red-600 hover:text-red-800"
              >
                ลบคอร์ส
              </button>
            </div>
          </div>
        </div>
      ))}

      {isEditModalOpen && <EditModal />}
    </div>
  );
}

export default ManageCourses;