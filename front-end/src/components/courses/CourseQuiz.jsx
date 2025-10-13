import { useState, useEffect } from 'react';
import { examService } from '../../services/exam.service';
import { authService } from '../../services/auth.service';

function CourseQuiz({ courseId, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
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

      // หา multiple choice exam
      const mcExam = exams.find(exam => exam.type === 'multiple_choice');
      if (mcExam) {
        setExam(mcExam);
        setQuestions(mcExam.questions || []);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('ไม่สามารถโหลดแบบทดสอบได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const correctAnswer = question.correctAnswer || question.correct_answer;
      if (answers[question.id] === parseInt(correctAnswer)) {
        correctAnswers++;
      }
    });
    return (correctAnswers / questions.length) * 100;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResult(true);

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

      console.log('Submitting quiz result:', examResult); // สำหรับ debug

      await examService.submitExamResult(examResult);

      const quizResult = {
        userId: currentUser.id,
        courseId: courseId,
        examId: exam.id,
        score: finalScore,
        answers: answers,
        completedAt: new Date().toISOString()
      };

      if (onComplete) {
        onComplete(quizResult);
      }
    } catch (error) {
      console.error('Error submitting exam result:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำตอบ: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">กำลังโหลดแบบทดสอบ...</span>
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
          <p>ไม่พบแบบทดสอบสำหรับหลักสูตรนี้</p>
        </div>
      </div>
    );
  }

  // ส่วนแสดงผลแบบทดสอบ (เมื่อยังทำไม่เสร็จ)
  if (!showResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{exam.title}</h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              กรุณาตอบคำถามทั้งหมด {questions.length} ข้อ
            </p>
            <span className="text-sm text-gray-500">
              ตอบแล้ว {Object.keys(answers).length} จาก {questions.length} ข้อ
            </span>
          </div>
        </div>

        <div className="space-y-8 mb-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start mb-4">
                <span className="flex-shrink-0 bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full mr-2">
                  ข้อ {index + 1}
                </span>
                <p className="text-lg text-gray-800">
                  {question.question || question.question_text}
                </p>
              </div>

              <div className="space-y-3 ml-8">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer
                      ${answers[question.id] === optIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optIndex}
                      onChange={() => handleAnswer(question.id, optIndex)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.keys(answers).length < questions.length
              ? `ตอบคำถามอีก ${questions.length - Object.keys(answers).length} ข้อ`
              : 'ส่งคำตอบ'
            }
          </button>
        </div>
      </div>
    );
  }

  // แก้ไขส่วนแสดงผลการทดสอบ
  if (showResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">สรุปผลการทดสอบ</h2>
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-sm text-gray-600">หลักสูตร</span>
            <h3 className="text-xl font-semibold text-gray-800">
              {exam.title}
            </h3>
          </div>

          <div className="relative inline-block w-48 h-48 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl font-bold text-blue-600">
                {Math.round(score)}%
              </div>
            </div>
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="96"
                cy="96"
              />
              <circle
                className="text-blue-600"
                strokeWidth="8"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * score) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="96"
                cy="96"
              />
            </svg>
          </div>

          <p className="text-gray-600 mb-2">
            คุณตอบถูก {Math.round((score / 100) * questions.length)} ข้อ
            จากทั้งหมด {questions.length} ข้อ
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">การประเมินผล</h4>
            <p className="text-gray-600">
              {score >= 80 ? '🌟 ยอดเยี่ยม! คุณพร้อมสำหรับการทำงานในตำแหน่งนี้' :
                score >= 60 ? '👍 ดี! แต่ยังมีโอกาสพัฒนาได้อีก' :
                  'ควรทบทวนเนื้อหาและลองทำแบบทดสอบอีกครั้ง'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                if (onComplete) {
                  // ส่งสัญญาณให้ CourseDetailPage เปลี่ยนไปแสดง WrittenExam
                  onComplete({
                    userId: localStorage.getItem('userId'),
                    courseId: courseId,
                    examId: exam.id,
                    score: score,
                    answers: answers,
                    completedAt: new Date().toISOString(),
                    goToWrittenExam: true // เพิ่ม flag นี้
                  });
                }
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ไปทำข้อสอบเขียน
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">แบบทดสอบ</h2>
        <p className="text-gray-600">
          กรุณาตอบคำถามทั้งหมด {questions.length} ข้อ
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start mb-4">
              <span className="flex-shrink-0 bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full mr-2">
                ข้อ {questionIndex + 1}
              </span>
              <p className="text-lg text-gray-800">
                {question.question}
              </p>
            </div>

            <div className="space-y-3 ml-8">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer
                    ${answers[question.id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswer(question.id, index)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {Object.keys(answers).length < questions.length
            ? `ตอบคำถามอีก ${questions.length - Object.keys(answers).length} ข้อ`
            : 'ส่งคำตอบ'
          }
        </button>
      </div>
    </div>
  );
}

export default CourseQuiz;