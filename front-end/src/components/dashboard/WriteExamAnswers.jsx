import React, { useState, useEffect } from 'react';

function WriteExamAnswers() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchCourses = async () => {
      // Mock data
      setCourses([
        { id: 1, name: 'Course 1' },
        { id: 2, name: 'Course 2' },
        { id: 3, name: 'Course 3' },
      ]);
    };
    fetchCourses();
  }, []);

  const fetchAnswers = async (courseId) => {
    // TODO: Replace with actual API call
    // Mock data
    setAnswers([
      {
        id: 1,
        employeeName: 'John Doe',
        question: 'Describe the main principles of project management',
        answer: 'Project management principles include planning, execution, monitoring...',
        score: 85
      },
      {
        id: 2,
        employeeName: 'Jane Smith',
        question: 'What are the key aspects of team leadership?',
        answer: 'Effective team leadership involves clear communication...',
        score: 92
      }
    ]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Written Exam Answers</h2>
      
      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            fetchAnswers(e.target.value);
          }}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Answers List */}
      {selectedCourse && (
        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{answer.employeeName}</h3>
                  <p className="text-sm text-gray-500">Score: {answer.score}%</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="font-medium text-gray-700">Question:</p>
                <p className="mt-1 text-gray-600">{answer.question}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Answer:</p>
                <p className="mt-1 text-gray-600 whitespace-pre-line">{answer.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WriteExamAnswers;