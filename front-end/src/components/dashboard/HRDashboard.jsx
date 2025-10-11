import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import WriteExamAnswers from './WriteExamAnswers';
import CourseManagement from './CourseManagement';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function HRDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0
  });
  const [examScores, setExamScores] = useState({
    scores: [],
    maxScore: 0,
    minScore: 0,
    avgScore: 0
  });
  const [courseProgress, setCourseProgress] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Fetch employee statistics
    const fetchEmployeeStats = async () => {
      // Mock data - replace with actual API call
      setEmployeeStats({
        total: 100,
        assigned: 75,
        unassigned: 25
      });
    };

    // Fetch exam scores
    const fetchExamScores = async () => {
      // Mock data - replace with actual API call
      const mockScores = {
        scores: [
          { name: 'Employee 1', score: 85 },
          { name: 'Employee 2', score: 92 },
          { name: 'Employee 3', score: 78 },
          { name: 'Employee 4', score: 95 },
          { name: 'Employee 5', score: 88 }
        ]
      };
      const scores = mockScores.scores.map(s => s.score);
      setExamScores({
        scores: mockScores.scores,
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      });
    };

    // Fetch course progress
    const fetchCourseProgress = async () => {
      // Mock data - replace with actual API call
      setCourseProgress([
        { name: 'Course 1', total: 50, completed: 30 },
        { name: 'Course 2', total: 45, completed: 40 },
        { name: 'Course 3', total: 35, completed: 20 }
      ]);
    };

    fetchEmployeeStats();
    fetchExamScores();
    fetchCourseProgress();
  }, []);

  const pieChartData = {
    labels: ['Assigned to Training', 'Not Assigned'],
    datasets: [
      {
        data: [employeeStats.assigned, employeeStats.unassigned],
        backgroundColor: ['#4F46E5', '#E5E7EB'],
        borderColor: ['#4338CA', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  const courseProgressData = {
    labels: courseProgress.map(course => course.name),
    datasets: [
      {
        label: 'Total Employees',
        data: courseProgress.map(course => course.total),
        backgroundColor: '#4F46E5',
      },
      {
        label: 'Completed',
        data: courseProgress.map(course => course.completed),
        backgroundColor: '#34D399',
      },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'written-answers':
        return <WriteExamAnswers />;
      case 'course-management':
        return <CourseManagement activeSection="list" />;
      case 'create-course':
        return <CourseManagement activeSection="add" />;
      default:
        return (
          <div>
            {/* Employee Assignment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Employee Training Assignment</h2>
                <div className="h-64">
                  <Pie data={pieChartData} />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Total Employees: {employeeStats.total}</p>
                </div>
              </div>

              {/* Employee Scores */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Training Scores Overview</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Highest Score</p>
                      <p className="text-2xl font-bold text-green-700">{examScores.maxScore}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Average Score</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {examScores.avgScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600">Lowest Score</p>
                      <p className="text-2xl font-bold text-red-700">{examScores.minScore}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Individual Scores</h3>
                    <div className="space-y-2">
                      {examScores.scores.map((score, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{score.name}</span>
                          <span className="font-medium">{score.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Progress Overview</h2>
              <div className="h-80">
                <Bar
                  data={courseProgressData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Employees'
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6 space-y-4">
                {courseProgress.map((course, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{course.name}</span>
                    <div className="text-right">
                      <span className="font-medium text-green-600">
                        {course.completed} completed
                      </span>
                      <span className="text-gray-400 mx-2">/</span>
                      <span className="text-gray-600">
                        {course.total} total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">HR Dashboard</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('written-answers')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'written-answers'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Written Exam Answers
            </button>
            <button
              onClick={() => setActiveTab('course-management')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'course-management'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Course Management
            </button>
            <button
              onClick={() => setActiveTab('create-course')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'create-course'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Create Course
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">{renderContent()}</div>
      </div>
    </div>
  );
        
}

export default HRDashboard;