import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/courses/VideoPlayer';
import CourseQuiz from '../components/courses/CourseQuiz';
import WrittenExam from '../components/courses/WrittenExam';
import { courseService } from '../services/course.service';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategoryNameThai = (category) => {
    const categoryNames = {
      'management': 'การบริหารจัดการ',
      'customer-service': 'การบริการลูกค้า',
      'technical': 'เทคนิค',
      'soft-skills': 'ทักษะความสามารถ',
      'compliance': 'การปฏิบัติตามกฎระเบียบ'
    };
    return categoryNames[category] || category;
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleQuizComplete = (quizResult) => {
    // TODO: ส่งผลสอบไป API
    console.log('Quiz completed:', quizResult);

    // บันทึกผลสอบลง localStorage (ชั่วคราว)
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    results.push({
      ...quizResult,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem('quizResults', JSON.stringify(results));

    // เมื่อทำ Quiz เสร็จแล้วให้ไปต่อที่ Written Exam
    setIsQuizCompleted(true);
  };

  const handleWrittenExamComplete = (examResult) => {
    // TODO: ส่งผลสอบเขียนไป API
    console.log('Written Exam completed:', examResult);

    // บันทึกผลสอบเขียนลง localStorage (ชั่วคราว)
    const results = JSON.parse(localStorage.getItem('writtenExamResults') || '[]');
    results.push({
      ...examResult,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem('writtenExamResults', JSON.stringify(results));

    alert('ยินดีด้วย! คุณได้ทำการเรียนครบหลักสูตรแล้ว');
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const handleVideoComplete = () => {
    setIsVideoCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button
                onClick={() => navigate('/courses')}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                กลับไปหน้าคอร์ส
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-gray-600">ไม่พบคอร์สที่ต้องการ</p>
              <button
                onClick={() => navigate('/courses')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                กลับไปหน้าคอร์ส
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToCourses}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้าคอร์ส
          </button>

          {/* Course Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">
                {course.title}
              </h1>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {getCategoryNameThai(course.category)}
              </span>
            </div>
            <p className="text-gray-600">{course.description}</p>
            <div className="flex items-center mt-4 text-sm text-gray-500 space-x-4">
              <span>ระยะเวลา: {course.duration} นาที</span>
              <span>ผู้สร้าง: {course.creator_name}</span>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <VideoPlayer
              videoUrl={course.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
              onComplete={handleVideoComplete}
            />
          </div>

          {/* Quiz Section */}
          {isVideoCompleted && !isQuizCompleted && (
            <div className="mt-8 transition-all duration-500 ease-in-out">
              <CourseQuiz
                courseId={courseId}
                onComplete={handleQuizComplete}
              />
            </div>
          )}

          {/* Written Exam Section */}
          {isQuizCompleted && (
            <div className="mt-8 transition-all duration-500 ease-in-out">
              <WrittenExam
                courseId={courseId}
                onComplete={handleWrittenExamComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;