import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import WrittenExam from './components/courses/WrittenExam';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      {/* แสดง Navbar ในทุกหน้ายกเว้นหน้า Login */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route 
                  path="/courses" 
                  element={
                    <ProtectedRoute>
                      <CoursesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/courses/:courseId" 
                  element={
                    <ProtectedRoute>
                      <CourseDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/written-exam" element={<WrittenExam />} />
                <Route path="/dashboard" element={<EmployeeDashboard />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;