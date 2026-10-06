import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

/**
 * Guard route admin — yêu cầu token + role='admin'.
 * - Chưa đăng nhập → /login (kèm returnTo để redirect sau khi login).
 * - Không phải admin → /login.
 */
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}