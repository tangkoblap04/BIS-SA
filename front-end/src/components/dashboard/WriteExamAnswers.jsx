import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/course.service';
import { examService } from '../../services/exam.service';

function WriteExamAnswers() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('ไม่สามารถดึงข้อมูลคอร์สได้');
    }
  };

  const fetchAnswers = async (courseId) => {
    setLoading(true);
    setError('');
    try {
      const data = await examService.getAllExamAnswers(courseId);
      setAnswers(data);
    } catch (error) {
      console.error('Error fetching answers:', error);
      setError('ไม่สามารถดึงข้อมูลคำตอบได้');
      setAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">� คำตอบข้อสอบทั้งหมด</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เลือกคอร์ส
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => {
            const courseId = e.target.value;
            setSelectedCourse(courseId);
            if (courseId) {
              fetchAnswers(courseId);
            } else {
              setAnswers([]);
            }
          }}
          value={selectedCourse || ''}
        >
          <option value="">-- เลือกคอร์ส --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* Answers List */}
      {!loading && selectedCourse && answers.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-lg mb-2">📭 ยังไม่มีคำตอบข้อสอบ</div>
          <p className="text-gray-400 text-sm">ยังไม่มีพนักงานส่งคำตอบข้อสอบสำหรับคอร์สนี้</p>
        </div>
      )}

      {!loading && selectedCourse && answers.length > 0 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-800 font-medium">
                พบคำตอบทั้งหมด {answers.length} คน
              </span>
            </div>
          </div>

          {answers.map((answer) => (
            <div key={answer.user_id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              {/* User Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-200">
                <div>
                  <h3 className="font-semibold text-xl text-gray-800 mb-1">
                    👤 {answer.user_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ส่งเมื่อ: {formatDate(answer.submitted_at)}
                  </p>
                </div>
              </div>

              {/* Multiple Choice Section */}
              {answer.multiple_choice && (
                <div className="mb-6">
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1 flex items-center">
                          ✓ {answer.multiple_choice.exam_title}
                        </h4>
                        <p className="text-sm text-purple-700">
                          ส่งเมื่อ: {formatDate(answer.multiple_choice.submitted_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${answer.multiple_choice.score >= 80 ? 'text-green-600' :
                            answer.multiple_choice.score >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                          }`}>
                          {answer.multiple_choice.score.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {answer.multiple_choice.correct_answers}/{answer.multiple_choice.total_questions} ข้อ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Written Exam Section */}
              {answer.written && (
                <div>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-900 mb-1 flex items-center">
                      ✍️ {answer.written.exam_title}
                    </h4>
                    <p className="text-sm text-green-700">
                      ส่งเมื่อ: {formatDate(answer.written.submitted_at)}
                    </p>
                  </div>

                  {/* Written Questions and Answers */}
                  <div className="space-y-4">
                    {answer.written.question_answers && answer.written.question_answers.length > 0 ? (
                      answer.written.question_answers.map((qa, index) => (
                        <div key={qa.question_id} className="bg-gray-50 p-4 rounded-md border-l-4 border-blue-400">
                          <div className="mb-3 flex justify-between items-start">
                            <div>
                              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium mr-2">
                                คำถามที่ {index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({qa.points} คะแนน)
                              </span>
                            </div>
                            <div className="bg-white px-3 py-1 rounded border border-blue-200 shadow-sm">
                              <span className="text-xs text-gray-500">ตอบโดย: </span>
                              <span className="text-sm font-semibold text-blue-700">
                                👤 {answer.user_name}
                              </span>
                            </div>
                          </div>
                          <p className="font-medium text-gray-800 mb-3 bg-white p-3 rounded border border-gray-300">
                            ❓ {qa.question_text}
                          </p>
                          <div className="bg-white p-4 rounded border-2 border-green-200">
                            <div className="flex items-start mb-2">
                              <span className="text-green-600 font-medium text-sm mr-2">✍️ คำตอบ:</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {qa.answer ? (
                                <span className="block pl-4 border-l-2 border-green-300 py-1">
                                  {qa.answer}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">ไม่มีคำตอบ</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        ไม่มีคำถามในข้อสอบนี้
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Exams Taken */}
              {!answer.multiple_choice && !answer.written && (
                <div className="text-center text-gray-500 py-4">
                  <p>ไม่มีข้อมูลข้อสอบ</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} export default WriteExamAnswers;