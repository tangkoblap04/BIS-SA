import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, checkRole }) {
  const { user, loading } = useAuth();

  // แสดง loading state ขณะกำลังตรวจสอบ auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (checkRole && !checkRole()) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'HR') {
      return <Navigate to="/hr-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;