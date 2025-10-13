import React, { useState, useEffect } from 'react';
import AddCourse from './course-management/AddCourse';
import CourseList from './course-management/CourseList';

function CourseManagement({ activeSection: initialSection }) {
  const [activeSection, setActiveSection] = useState(initialSection || 'list');

  useEffect(() => {
    setActiveSection(initialSection || 'list');
  }, [initialSection]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">จัดการคอร์ส</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveSection('list')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeSection === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            📋 รายการคอร์สทั้งหมด
          </button>
          <button
            onClick={() => setActiveSection('add')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeSection === 'add'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            ➕ สร้างคอร์สใหม่
          </button>
        </div>
      </div>

      {activeSection === 'add' ? (
        <AddCourse />
      ) : (
        <CourseList />
      )}
    </div>
  );
}

export default CourseManagement;