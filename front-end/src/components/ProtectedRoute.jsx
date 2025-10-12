import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

function ProtectedRoute({ children, checkRole }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (checkRole && !checkRole()) {
    // Redirect to appropriate dashboard based on role
    if (authService.isHR()) {
      return <Navigate to="/hr-dashboard" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;