import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

/**
 * Guard route admin — yêu cầu đã đăng nhập và có role='admin'.
 * - Chưa đăng nhập → /admin/login
 * - Đã đăng nhập nhưng không phải admin → /
 */
export default function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore((s) => ({ user: s.user, token: s.token }));
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}