import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/courses/VideoPlayer';
import CourseQuiz from '../components/courses/CourseQuiz';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  
  // ข้อมูลคอร์สแยกตามตำแหน่ง
  const coursesData = {
    manager: {
      id: 'manager-1',
      title: "การบริหารจัดการร้านอาหาร",
      description: "หลักสูตรสำหรับผู้จัดการร้านอาหาร เรียนรู้การบริหารจัดการทีม การควบคุมต้นทุน และการพัฒนาธุรกิจ",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "16 ชั่วโมง",
      role: "manager"
    },
    waiter: {
      id: 'waiter-1',
      title: "การบริการลูกค้าสำหรับพนักงานเสิร์ฟ",
      description: "เรียนรู้เทคนิคการบริการลูกค้า การจดจำเมนู และการจัดการคำสั่งอาหาร",
      videoUrl: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "8 ชั่วโมง",
      role: "waiter"
    },
    cashier: {
      id: 'cashier-1',
      title: "การจัดการการเงินและการคิดเงิน",
      description: "เรียนรู้ระบบ POS การรับชำระเงิน และการจัดการบัญชี",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "10 ชั่วโมง",
      role: "cashier"
    },
    service: {
      id: 'service-1',
      title: "การบริการทั่วไปในร้านอาหาร",
      description: "เรียนรู้งานบริการทั่วไป การทำความสะอาด และการจัดการพื้นที่",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "6 ชั่วโมง",
      role: "service"
    }
  };

  const getRoleNameThai = (role) => {
    const roleNames = {
      manager: 'ผู้จัดการ',
      waiter: 'พนักงานเสิร์ฟ',
      cashier: 'แคชเชียร์',
      service: 'พนักงานทั่วไป'
    };
    return roleNames[role] || role;
  };

  // ดึงข้อมูลคอร์สตาม role
  const getCourseData = () => {
    const role = courseId.split('-')[0];
    return coursesData[role] || coursesData.manager;
  };

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
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const courseData = getCourseData();

  const handleVideoComplete = () => {
    setIsVideoCompleted(true);
  };

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
                {courseData.title}
              </h1>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {getRoleNameThai(courseData.role)}
              </span>
            </div>
            <p className="text-gray-600">{courseData.description}</p>
            <p className="text-sm text-gray-500 mt-2">ระยะเวลา: {courseData.duration}</p>
          </div>

          {/* Video Player */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <VideoPlayer 
              videoUrl={courseData.videoUrl}
              onComplete={handleVideoComplete}
            />
          </div>

          {/* Quiz Section */}
          {isVideoCompleted && (
            <div className="mt-8 transition-all duration-500 ease-in-out">
              <CourseQuiz 
                role={courseData.role}
                onComplete={handleQuizComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;