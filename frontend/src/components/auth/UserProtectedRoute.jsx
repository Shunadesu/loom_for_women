import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

/**
 * Guard route người dùng — yêu cầu đã đăng nhập.
 * - Chưa đăng nhập → mở LoginDrawer với redirectPath
 */
export default function UserProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  useEffect(() => {
    if (!token) {
      openLoginDrawer(location.pathname);
    }
  }, [token, location.pathname, openLoginDrawer]);

  if (!token) {
    return null; // Không render gì, chờ user login trong drawer
  }

  return children;
}
