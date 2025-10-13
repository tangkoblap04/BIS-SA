import React, { useState, useEffect } from 'react';
import { courseService } from '../../../services/course.service';
import { userService } from '../../../services/user.service';
import { COURSE_CATEGORIES } from '../../../constants/categories';

function AddCourse() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: 0, // Changed to number for backend
    category: '', // Changed from role to category
    video_url: '', // Changed from videoUrl to video_url to match backend
    instructor: '',
    image: '',
    visibility: 'all', // 'all' = everyone can see, 'specific' = selected users only
    selectedUsers: [], // Array of user IDs who can access this course
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      const userList = data.users || data || [];
      // Filter out HR users, only show employees
      setUsers(userList.filter(u => u.role === 'employee'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
        visibility: newCourse.visibility,
        selectedUsers: newCourse.visibility === 'specific' ? newCourse.selectedUsers : [],
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
        visibility: 'all',
        selectedUsers: [],
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
                  {COURSE_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
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
                onChange={(e) => {
                  setNewCourse({
                    ...newCourse,
                    visibility: e.target.value,
                    selectedUsers: [] // Reset selected users when changing visibility
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                required
              >
                <option value="all">เปิดให้ทุกคนเห็น</option>
                <option value="specific">เลือกผู้ใช้เฉพาะ</option>
                <option value="hidden">ซ่อนจากทุกคน</option>
              </select>

              {newCourse.visibility === 'specific' && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    เลือกผู้ใช้ที่สามารถเห็นคอร์สนี้
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">ไม่พบผู้ใช้ในระบบ</p>
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newCourse.selectedUsers.length === users.length}
                            onChange={(e) => {
                              const allUserIds = users.map(u => u.id);
                              setNewCourse({
                                ...newCourse,
                                selectedUsers: e.target.checked ? allUserIds : []
                              });
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">เลือกทั้งหมด</span>
                        </label>
                        <div className="border-t border-gray-200 my-2"></div>
                        {users.map((user) => (
                          <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newCourse.selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                const updatedUsers = e.target.checked
                                  ? [...newCourse.selectedUsers, user.id]
                                  : newCourse.selectedUsers.filter(id => id !== user.id);
                                setNewCourse({ ...newCourse, selectedUsers: updatedUsers });
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({user.email})</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {newCourse.selectedUsers.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      เลือกแล้ว: {newCourse.selectedUsers.length} คน
                    </p>
                  )}
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