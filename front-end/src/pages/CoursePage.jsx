import { useState, useEffect } from 'react';
import { courseService } from '../services/course.service';
import { Link } from 'react-router-dom';

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    { id: 'management', label: 'การจัดการ' },
    { id: 'customer-service', label: 'การบริการลูกค้า' },
    { id: 'technical', label: 'เทคนิค' },
    { id: 'soft-skills', label: 'ทักษะส่วนบุคคล' },
    { id: 'compliance', label: 'การปฏิบัติตามกฎระเบียบ' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await courseService.getAllCourses();
      const coursesData = response.courses || response || [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updatedCategories);
  };

  const filteredCourses = selectedCategories.length === 0
    ? courses
    : courses.filter(course => selectedCategories.includes(course.category));

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'management': 'การจัดการ',
      'customer-service': 'การบริการลูกค้า',
      'technical': 'เทคนิค',
      'soft-skills': 'ทักษะส่วนบุคคล',
      'compliance': 'การปฏิบัติตามกฎระเบียบ'
    };
    return categoryMap[category] || category;
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 หลักสูตรการอบรม</h1>
          <p className="text-gray-600">เลือกคอร์สที่คุณต้องการเรียนรู้</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🏷️ หมวดหมู่</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{category.label}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="mt-4 w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบคอร์สที่ตรงกับเงื่อนไข</h3>
                <p className="text-gray-600">ลองเปลี่ยนตัวกรองหรือรอการเพิ่มคอร์สใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <div className="text-4xl text-white">📚</div>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {getCategoryLabel(course.category)}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {course.description || 'ไม่มีคำอธิบาย'}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          ผู้สร้าง: {course.creator_name || 'ไม่ระบุ'}
                        </div>

                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ระยะเวลา: {course.duration ? `${Math.floor(course.duration / 60)} ชั่วโมง ${course.duration % 60} นาที` : 'ไม่ระบุ'}
                        </div>
                      </div>

                      <Link
                        to={`/courses/${course.id}`}
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
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
      </div>
    </div>
  );
}

export default CoursePage;