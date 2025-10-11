import React, { useState, useEffect } from 'react';
import { ClockIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const roles = [
    { value: 'manager', label: 'ผู้จัดการ' },
    { value: 'waiter', label: 'พนักงานเสิร์ฟ' },
    { value: 'cashier', label: 'แคชเชียร์' },
    { value: 'service', label: 'พนักงานบริการทั่วไป' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    // TODO: Replace with actual API call
    // Mock data
    setCourses([
      {
        id: 1,
        title: 'การจัดการร้านอาหาร',
        description: 'เรียนรู้การจัดการร้านอาหารอย่างมีประสิทธิภาพ',
        instructor: 'อาจารย์ใหญ่',
        duration: '4 ชั่วโมง',
        role: 'manager',
        image: 'https://example.com/image1.jpg',
        visibility: 'public',
        allowedRoles: []
      },
      {
        id: 2,
        title: 'การบริการลูกค้า',
        description: 'พื้นฐานการบริการลูกค้าสำหรับพนักงานเสิร์ฟ',
        instructor: 'อาจารย์รอง',
        duration: '2 ชั่วโมง',
        role: 'waiter',
        image: 'https://example.com/image2.jpg',
        visibility: 'role-specific',
        allowedRoles: ['waiter', 'manager']
      }
    ]);
  };

  const handleDelete = async (courseId) => {
    // TODO: Replace with actual API call
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?')) {
      console.log('Deleting course:', courseId);
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const handleVisibilityChange = async (course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleVisibilityUpdate = async () => {
    // TODO: Replace with actual API call
    const updatedCourses = courses.map(course => 
      course.id === selectedCourse.id ? selectedCourse : course
    );
    setCourses(updatedCourses);
    setIsEditModalOpen(false);
    setSelectedCourse(null);
  };

  const VisibilityModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">แก้ไขการมองเห็นคอร์ส</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                การมองเห็น
              </label>
              <select
                value={selectedCourse.visibility}
                onChange={(e) => setSelectedCourse({
                  ...selectedCourse,
                  visibility: e.target.value,
                  allowedRoles: e.target.value === 'role-specific' ? selectedCourse.allowedRoles : []
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="public">เปิดให้ทุกคนเห็น</option>
                <option value="hidden">ซ่อนทั้งหมด</option>
                <option value="role-specific">จำกัดตามตำแหน่ง</option>
              </select>
            </div>

            {selectedCourse.visibility === 'role-specific' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  เลือกตำแหน่งที่สามารถมองเห็นได้
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label key={role.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCourse.allowedRoles.includes(role.value)}
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...selectedCourse.allowedRoles, role.value]
                            : selectedCourse.allowedRoles.filter(r => r !== role.value);
                          setSelectedCourse({...selectedCourse, allowedRoles: updatedRoles});
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleVisibilityUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              บันทึก
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
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <div className="flex items-center space-x-2">
                      {course.visibility === 'hidden' ? (
                        <span className="inline-flex items-center text-red-600">
                          <EyeSlashIcon className="w-5 h-5 mr-1" />
                          ซ่อนอยู่
                        </span>
                      ) : course.visibility === 'role-specific' ? (
                        <span className="inline-flex items-center text-yellow-600">
                          <EyeIcon className="w-5 h-5 mr-1" />
                          จำกัดการมองเห็น
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-green-600">
                          <EyeIcon className="w-5 h-5 mr-1" />
                          มองเห็นทั้งหมด
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {course.instructor}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  {course.visibility === 'role-specific' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        มองเห็นได้เฉพาะ: {course.allowedRoles.map(role => 
                          roles.find(r => r.value === role)?.label
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="ml-4 flex flex-col space-y-2">
              <button
                onClick={() => handleVisibilityChange(course)}
                className="text-blue-600 hover:text-blue-800"
              >
                แก้ไขการมองเห็น
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

      {isEditModalOpen && <VisibilityModal />}
    </div>
  );
}

export default ManageCourses;