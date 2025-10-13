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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import WriteExamAnswers from './WriteExamAnswers';
import CourseManagement from './CourseManagement';
import AddUser from '../AddUser';
import ManageUsers from '../ManageUsers';
import EditUser from '../EditUser';
import HRNavbar from '../common/HRNavbar';
import { dashboardService } from '../../services/dashboard.service';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0
  });
  const [examScores, setExamScores] = useState({
    scores: [],
    maxScore: 0,
    minScore: 0,
    avgScore: 0,
    scoreCount: 0
  });
  const [courseProgress, setCourseProgress] = useState([]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await dashboardService.getHRDashboardStats();

      console.log('Dashboard data received:', data); // Debug log

      setEmployeeStats(data.employee_stats || {
        total: 0,
        assigned: 0,
        unassigned: 0
      });

      // Map API response (snake_case) to state (camelCase)
      const examScoresData = data.exam_scores || {};
      setExamScores({
        scores: examScoresData.scores || [],
        maxScore: examScoresData.max_score || 0,
        minScore: examScoresData.min_score || 0,
        avgScore: examScoresData.avg_score || 0,
        scoreCount: examScoresData.score_count || 0
      });

      setCourseProgress(data.course_progress || []);

      console.log('Exam scores set:', {
        scoreCount: examScoresData.score_count,
        scoresLength: (examScoresData.scores || []).length
      }); // Debug log

    } catch (error) {
      console.error('Error fetching HR dashboard data:', error);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Title
    doc.setFontSize(18);
    doc.text('HR Dashboard Report', 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${currentDate}`, 14, 28);
    doc.text('BIS-SA Training Management System', 14, 34);

    let yPosition = 45;

    // 1. Employee Training Assignment Statistics
    doc.setFontSize(14);
    doc.text('1. Employee Training Assignment', 14, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Count', 'Percentage']],
      body: [
        ['Total Employees', employeeStats.total.toString(), '100%'],
        ['Assigned to Training', employeeStats.assigned.toString(),
          `${((employeeStats.assigned / employeeStats.total) * 100).toFixed(1)}%`],
        ['Not Assigned', employeeStats.unassigned.toString(),
          `${((employeeStats.unassigned / employeeStats.total) * 100).toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // 2. Training Scores Overview
    doc.setFontSize(14);
    doc.text('2. Training Scores Overview', 14, yPosition);
    yPosition += 10;

    if (examScores.scoreCount > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: [
          ['Total Exams', examScores.scoreCount.toString()],
          ['Highest Score', `${examScores.maxScore.toFixed(1)}%`],
          ['Average Score', `${examScores.avgScore.toFixed(1)}%`],
          ['Lowest Score', `${examScores.minScore.toFixed(1)}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Recent Scores Table
      doc.setFontSize(12);
      doc.text('Recent Exam Scores:', 14, yPosition);
      yPosition += 5;

      const scoresData = examScores.scores.slice(0, 10).map(score => [
        score.name,
        score.course_title,
        score.exam_title,
        `${score.score.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Student Name', 'Course', 'Exam', 'Score']],
        body: scoresData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text('No exam scores available yet.', 14, yPosition);
      yPosition += 15;
    }

    // 3. Course Progress Overview
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('3. Course Progress Overview', 14, yPosition);
    yPosition += 10;

    if (courseProgress.length > 0) {
      const progressData = courseProgress.map(course => [
        course.name,
        course.total.toString(),
        course.completed.toString(),
        `${((course.completed / course.total) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Course Name', 'Total Enrolled', 'Completed', 'Completion Rate']],
        body: progressData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });
    } else {
      doc.setFontSize(10);
      doc.text('No course progress data available yet.', 14, yPosition);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`HR-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
        label: 'Total Enrolled',
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
      case 'add-user':
        return <AddUser />;
      case 'manage-users':
        return <ManageUsers />;
      case 'edit-user':
        return <EditUser />;
      default:
        return (
          <div>
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="mt-4 block text-gray-600">กำลังโหลดข้อมูล...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                <p className="font-medium">เกิดข้อผิดพลาด</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && (
              <>
                {/* Employee Assignment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Employee Training Assignment</h2>
                    <div className="h-64">
                      <Pie data={pieChartData} />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-3">Total Employees: {employeeStats.total}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-indigo-50 p-2 rounded">
                          <span className="text-indigo-700 font-medium">{employeeStats.assigned}</span>
                          <span className="text-gray-600 ml-1">Assigned</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <span className="text-gray-700 font-medium">{employeeStats.unassigned}</span>
                          <span className="text-gray-600 ml-1">Not Assigned</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employee Scores */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Training Scores Overview</h2>
                    {examScores.scoreCount > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">Highest</p>
                            <p className="text-2xl font-bold text-green-700">{examScores.maxScore.toFixed(1)}%</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600">Average</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {examScores.avgScore.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-600">Lowest</p>
                            <p className="text-2xl font-bold text-red-700">{examScores.minScore.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-2">Recent Scores</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {examScores.scores.map((score, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-800 font-medium">{score.name}</span>
                                  <p className="text-xs text-gray-500 truncate">{score.course_title} • {score.exam_title}</p>
                                </div>
                                <span className={`font-bold px-3 py-1 rounded ml-2 ${score.score >= 80 ? 'bg-green-100 text-green-700' :
                                  score.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {score.score.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 font-medium">ยังไม่มีข้อมูลคะแนนสอบ</p>
                        <p className="text-sm mt-1">เมื่อมีพนักงานทำข้อสอบจะแสดงข้อมูลที่นี่</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Progress */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Course Progress Overview</h2>
                  {courseProgress.length > 0 ? (
                    <>
                      <div className="h-80 mb-6">
                        <Bar
                          data={courseProgressData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1
                                },
                                title: {
                                  display: true,
                                  text: 'Number of Employees'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="mt-6 space-y-3">
                        {courseProgress.map((course, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <span className="text-gray-700 font-medium">{course.name}</span>
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
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="mt-2 font-medium">ยังไม่มีข้อมูลความก้าวหน้าคอร์ส</p>
                      <p className="text-sm mt-1">เมื่อมีพนักงานเรียนคอร์สจะแสดงข้อมูลที่นี่</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HR Navbar */}
      <HRNavbar onExportPDF={activeTab === 'dashboard' ? exportToPDF : null} />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">HR Dashboard</h1>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('written-answers')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'written-answers'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                📝 Written Exam Answers
              </button>
              <button
                onClick={() => setActiveTab('course-management')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'course-management'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                📚 Course Management
              </button>
              <button
                onClick={() => setActiveTab('add-user')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'add-user'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                👤 Add User
              </button>
              <button
                onClick={() => setActiveTab('manage-users')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'manage-users'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                👥 จัดการผู้ใช้
              </button>
              <button
                onClick={() => setActiveTab('edit-user')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeTab === 'edit-user'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                ✏️ แก้ไขผู้ใช้
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );

}

export default HRDashboard;