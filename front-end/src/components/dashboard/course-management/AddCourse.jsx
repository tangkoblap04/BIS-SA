import React, { useState } from 'react';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { courseService } from '../../../services/course.service';

function AddCourse() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: 0, // Changed to number for backend
    category: '', // Changed from role to category
    video_url: '', // Changed from videoUrl to video_url to match backend
    instructor: '',
    image: '',
    visibility: 'public', // public, hidden, role-specific
    allowedRoles: [], // สำหรับ role-specific visibility
    quiz: {
      questions: [
        {
          id: 1,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    },
    writtenExam: {
      questions: [
        {
          id: 'question1',
          question: ''
        },
        {
          id: 'question2',
          question: ''
        }
      ]
    }
  });

  const categories = [
    { value: 'management', label: 'การจัดการ' },
    { value: 'customer-service', label: 'การบริการลูกค้า' },
    { value: 'technical', label: 'เทคนิค' },
    { value: 'soft-skills', label: 'ทักษะส่วนบุคคล' },
    { value: 'compliance', label: 'การปฏิบัติตามกฎระเบียบ' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Prepare course data for backend
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        duration: parseInt(newCourse.duration) || 0,
        video_url: newCourse.video_url,
        quiz: newCourse.quiz,
        writtenExam: newCourse.writtenExam
      };

      console.log('Creating course:', courseData);

      const response = await courseService.createCourse(courseData);
      console.log('Course created successfully:', response);

      setSuccess(true);

      // Reset form
      setNewCourse({
        title: '',
        description: '',
        duration: 0,
        category: '',
        video_url: '',
        instructor: '',
        image: '',
        visibility: 'public',
        allowedRoles: [],
        quiz: {
          questions: [
            {
              id: 1,
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0
            }
          ]
        },
        writtenExam: {
          questions: [
            {
              id: 'question1',
              question: ''
            },
            {
              id: 'question2',
              question: ''
            }
          ]
        }
      });
      setCurrentStep(1);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Error creating course:', error);
      setError(error.message || 'ไม่สามารถสร้างคอร์สได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newCourse.quiz.questions];
    if (field === 'options') {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else {
      updatedQuestions[index][field] = value;
    }
    setNewCourse({
      ...newCourse,
      quiz: {
        ...newCourse.quiz,
        questions: updatedQuestions
      }
    });
  };

  const handleAddQuizQuestion = () => {
    setNewCourse({
      ...newCourse,
      quiz: {
        ...newCourse.quiz,
        questions: [
          ...newCourse.quiz.questions,
          {
            id: newCourse.quiz.questions.length + 1,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
          }
        ]
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อคอร์ส
              </label>
              <input
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย
              </label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระยะเวลา (นาที)
                </label>
                <input
                  type="number"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="120"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL (ไม่บังคับ)
              </label>
              <input
                type="url"
                value={newCourse.video_url}
                onChange={(e) => setNewCourse({ ...newCourse, video_url: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                การมองเห็น
              </label>
              <select
                value={newCourse.visibility}
                onChange={(e) => setNewCourse({ ...newCourse, visibility: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                required
              >
                <option value="public">เปิดให้ทุกคนเห็น</option>
                <option value="hidden">ซ่อนทั้งหมด</option>
                <option value="role-specific">จำกัดตามตำแหน่ง</option>
              </select>

              {newCourse.visibility === 'role-specific' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    เลือกตำแหน่งที่สามารถมองเห็นได้
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newCourse.allowedRoles.includes(category.value)}
                          onChange={(e) => {
                            const updatedRoles = e.target.checked
                              ? [...newCourse.allowedRoles, category.value]
                              : newCourse.allowedRoles.filter(r => r !== category.value);
                            setNewCourse({ ...newCourse, allowedRoles: updatedRoles });
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพปก
              </label>
              <input
                type="url"
                value={newCourse.image}
                onChange={(e) => setNewCourse({ ...newCourse, image: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="ใส่ URL ของรูปภาพ"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL วิดีโอ
              </label>
              <input
                type="url"
                value={newCourse.videoUrl}
                onChange={(e) => setNewCourse({ ...newCourse, videoUrl: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="ใส่ URL ของวิดีโอ"
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-600">
                หมายเหตุ: กรุณาอัพโหลดวิดีโอไปยังแพลตฟอร์มวิดีโอของคุณก่อน แล้วนำ URL มาใส่ที่นี่
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">คำถามแบบปรนัย</h4>
              <button
                type="button"
                onClick={handleAddQuizQuestion}
                className="text-blue-600 hover:text-blue-700"
              >
                + เพิ่มคำถาม
              </button>
            </div>
            {newCourse.quiz.questions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 p-4 rounded-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำถามข้อที่ {index + 1}
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuizQuestionChange(index, 'question', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => handleQuizQuestionChange(index, 'correctAnswer', optionIndex)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleQuizQuestionChange(index, 'options', [optionIndex, e.target.value])}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder={`ตัวเลือกที่ ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-blue-700 mr-2">เฉลย:</div>
                    <div className="text-sm text-blue-600">
                      ข้อ {question.correctAnswer + 1}. {question.options[question.correctAnswer]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium">คำถามแบบอัตนัย</h4>
            {newCourse.writtenExam.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  คำถามข้อที่ {index + 1}
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => {
                    const updatedQuestions = [...newCourse.writtenExam.questions];
                    updatedQuestions[index].question = e.target.value;
                    setNewCourse({
                      ...newCourse,
                      writtenExam: {
                        ...newCourse.writtenExam,
                        questions: updatedQuestions
                      }
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="border-b border-gray-200 mb-6">
        <div className="flex mb-4">
          {[
            'ข้อมูลคอร์ส',
            'วิดีโอ',
            'แบบทดสอบปรนัย',
            'แบบทดสอบอัตนัย'
          ].map((step, index) => (
            <div
              key={step}
              className={`flex-1 text-center ${currentStep === index + 1
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
                } pb-4 cursor-pointer`}
              onClick={() => setCurrentStep(index + 1)}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStep()}

        {/* Error และ Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            สร้างคอร์สสำเร็จ!
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              ย้อนกลับ
            </button>
          )}
          <button
            type="submit"
            className={`py-2 px-4 rounded-md ml-auto ${loading
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : (currentStep === 4 ? 'บันทึกคอร์ส' : 'ถัดไป')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCourse;