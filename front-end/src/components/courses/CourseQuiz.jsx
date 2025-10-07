import { useState } from 'react';
import { quizData } from '../../data/QuizData';
const getRoleNameThai = (role) => {
    const roleNames = {
      manager: 'ผู้จัดการ',
      waiter: 'พนักงานเสิร์ฟ',
      cashier: 'แคชเชียร์',
      service: 'พนักงานบริการทั่วไป'
    };
    return roleNames[role] || role;
  };
function CourseQuiz({ role, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // ลบ currentQuestion state เพราะจะแสดงทุกข้อพร้อมกัน
  const questions = quizData[role]?.questions || [];

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return (correctAnswers / questions.length) * 100;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }
    
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResult(true);
    

    const quizResult = {
      userId: localStorage.getItem('userId'),
      courseRole: role,
      score: finalScore,
      answers: answers,
      completedAt: new Date().toISOString()
    };

    if (onComplete) {
      onComplete(quizResult);
    }
  };

  // ส่วนแสดงผลแบบทดสอบ (เมื่อยังทำไม่เสร็จ)
  if (!showResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">แบบทดสอบ</h2>
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
                  {question.question}
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
            <span className="text-sm text-gray-600">ตำแหน่ง</span>
            <h3 className="text-xl font-semibold text-gray-800">
                {getRoleNameThai(role)}
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
                setShowResult(false);
                setAnswers({});

                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                ทำแบบทดสอบอีกครั้ง
            </button>
            <button
                onClick={() => window.location.href = '/courses'}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
                กลับไปยังหน้าคอร์ส
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