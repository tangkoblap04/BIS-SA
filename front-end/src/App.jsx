import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import WrittenExam from './components/courses/WrittenExam';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import HRDashboard from './components/dashboard/HRDashboard';
import Navbar from './components/common/Navbar';
import { authService } from './services/auth.service';

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
                <Route 
                  path="/written-exam" 
                  element={
                    <ProtectedRoute>
                      <WrittenExam />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/hr-dashboard" 
                  element={
                    <ProtectedRoute checkRole={() => authService.isHR()}>
                      <HRDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;