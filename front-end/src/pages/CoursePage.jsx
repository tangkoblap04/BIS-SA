import { useState } from 'react';
import CourseList from '../components/courses/CourseList';
import FilterSidebar from '../components/courses/FilterSidebar';

function CoursePage() {
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleFilterChange = (roles) => {
    setSelectedRoles(roles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">หลักสูตรการอบรม</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <CourseList selectedRoles={selectedRoles} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;