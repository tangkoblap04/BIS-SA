import { useState } from 'react';

function WrittenExam({ role, onComplete }) {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 'question1',
      question: 'จงอธิบายขั้นตอนการให้บริการลูกค้าตั้งแต่ลูกค้าเข้าร้านจนกระทั่งชำระเงิน'
    },
    {
      id: 'question2',
      question: 'หากเกิดสถานการณ์ที่ลูกค้าไม่พอใจการบริการ คุณจะมีวิธีการจัดการอย่างไร'
    }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ตรวจสอบว่าตอบครบทุกข้อ
    const isValid = Object.values(answers).every(answer => answer.trim().length > 0);

    if (!isValid) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    setSubmitted(true);

    const examResult = {
      userId: localStorage.getItem('userId'),
      courseRole: role,
      answers: answers,
      completedAt: new Date().toISOString()
    };

    if (onComplete) {
      onComplete(examResult);
    }
  };

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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ข้อสอบข้อเขียน</h2>
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