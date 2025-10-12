import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import WrittenExam from './components/courses/WrittenExam';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import HRDashboard from './components/dashboard/HRDashboard';
import Navbar from './components/common/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { authService } from './services/auth.service';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* หน้า Login - เป็น default route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Default route - redirect ตาม role */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'HR' ? (
                <Navigate to="/hr-dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected routes - ต้องมี user */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Navbar />
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <Navbar />
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/written-exam"
          element={
            <ProtectedRoute>
              <Navbar />
              <WrittenExam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
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



        {/* Catch all other routes - redirect ไป login ถ้าไม่มี user */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}



export default App;