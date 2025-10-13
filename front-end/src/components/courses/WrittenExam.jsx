import { useState, useEffect } from 'react';
import { examService } from '../../services/exam.service';
import { authService } from '../../services/auth.service';

function WrittenExam({ courseId, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const exams = await examService.getExamsByCourseId(courseId);

      // หา written exam
      const writtenExam = exams.find(exam => exam.type === 'written');
      if (writtenExam) {
        setExam(writtenExam);
        const examQuestions = writtenExam.questions || [];
        setQuestions(examQuestions);

        // สร้าง initial answers object
        const initialAnswers = {};
        examQuestions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Error fetching written exams:', err);
      setError('ไม่สามารถโหลดแบบทดสอบเขียนได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าตอบครบทุกข้อ
    const isValid = Object.values(answers).every(answer => answer.trim().length > 0);

    if (!isValid) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    setSubmitted(true);

    try {
      // ดึงข้อมูล user ที่ login อยู่
      const currentUser = authService.getCurrentUser();

      if (!currentUser || !currentUser.id) {
        alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      // ส่งผลสอบไป backend
      const examResult = {
        user_id: currentUser.id, // ใช้ user id จาก user object
        course_id: parseInt(courseId),
        exam_id: exam.id,
        answers: answers
      };

      console.log('Submitting exam result:', examResult); // สำหรับ debug

      await examService.submitExamResult(examResult);

      const result = {
        userId: currentUser.id,
        courseId: courseId,
        examId: exam.id,
        answers: answers,
        completedAt: new Date().toISOString()
      };

      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error submitting written exam result:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำตอบ: ' + error.message);
      setSubmitted(false); // ให้ส่งใหม่ได้
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">กำลังโหลดแบบทดสอบเขียน...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p>ไม่พบแบบทดสอบเขียนสำหรับหลักสูตรนี้</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ส่งข้อสอบเรียบร้อย</h2>
        <p className="text-gray-600 mb-6">
          ขอบคุณสำหรับการทำข้อสอบ ระบบได้บันทึกคำตอบของคุณแล้ว
        </p>
        <button
          onClick={() => window.location.href = '/courses'}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          กลับไปยังหน้าคอร์ส
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{exam.title}</h2>
      <p className="text-gray-600 mb-6">
        กรุณาตอบคำถามให้ครบทุกข้อ
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <div className="flex items-start">
              <span className="flex-shrink-0 bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full mr-2">
                ข้อ {index + 1}
              </span>
              <p className="text-lg text-gray-800">{question.question}</p>
            </div>

            <div>
              <textarea
                value={answers[question.id]}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="พิมพ์คำตอบของคุณที่นี่..."
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ส่งคำตอบ
        </button>
      </form>
    </div>
  );
}

export default WrittenExam;