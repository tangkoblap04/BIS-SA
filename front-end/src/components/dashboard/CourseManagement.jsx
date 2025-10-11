import React, { useState, useEffect } from 'react';
import AddCourse from './course-management/AddCourse';
import ManageCourses from './course-management/ManageCourses';

function CourseManagement({ activeSection: initialSection }) {
  const [activeSection, setActiveSection] = useState(initialSection || 'list');

  useEffect(() => {
    setActiveSection(initialSection || 'list');
  }, [initialSection]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">จัดการคอร์ส</h2>
        <div className="relative">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="list">รายการคอร์สทั้งหมด</option>
            <option value="add">เพิ่มคอร์สใหม่</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {activeSection === 'add' ? (
        <AddCourse />
      ) : (
        <ManageCourses />
      )}
    </div>
  );
}

export default CourseManagement;