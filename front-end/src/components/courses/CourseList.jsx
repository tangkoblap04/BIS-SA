import { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { courseService } from '../../services/course.service';

function CourseList({ selectedRoles }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await courseService.getAllCourses();

      // Transform backend data to match frontend structure
      const transformedCourses = (response.courses || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || 'ไม่มีคำอธิบาย',
        instructor: course.creator_name || 'ไม่ระบุผู้สอน',
        duration: formatDuration(course.duration),
        role: course.category, // Use category as role for filtering
        category: course.category,
        image: getDefaultImage(course.category),
        video_url: course.video_url,
        created_at: course.created_at,
        creator_name: course.creator_name
      }));

      setCourses(transformedCourses);
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

  const getDefaultImage = (category) => {
    const images = {
      'management': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
      'customer-service': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
      'technical': 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400',
      'soft-skills': 'https://images.unsplash.com/photo-1562887245-138c2f45013e?w=400',
      'compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400'
    };
    return images[category] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
  };

  const filteredCourses = selectedRoles.length === 0
    ? courses
    : courses.filter(course => selectedRoles.includes(course.role));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">กำลังโหลดคอร์ส...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchCourses}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-4"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">ยังไม่มีคอร์สในระบบ</div>
        <p className="text-gray-400">กรุณารอการเพิ่มคอร์สจาก HR</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export default CourseList;