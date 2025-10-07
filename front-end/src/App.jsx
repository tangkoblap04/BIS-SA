import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;