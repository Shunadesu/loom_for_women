import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

/**
 * ProtectedLink — Link tới route yêu cầu đăng nhập.
 *
 * - Đã đăng nhập  : điều hướng bình thường.
 * - Chưa đăng nhập: chặn điều hướng (không chuyển trang), mở LoginDrawer ngay
 *   tại chỗ. Sau khi đăng nhập thành công, LoginDrawer sẽ tự chuyển tới `to`.
 *
 * Mục đích: tránh trải nghiệm "chuyển trang trắng rồi mới hiện form đăng nhập".
 *
 * Props: giống `Link` của react-router-dom, cộng thêm:
 *  - `requireAuth` (bool, mặc định true) — có cần đăng nhập hay không.
 */
export default function ProtectedLink({
  to,
  requireAuth = true,
  children,
  onClick,
  ...rest
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  function handleClick(event) {
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (!requireAuth || isAuthenticated) return;

    // Chặn điều hướng → mở drawer đăng nhập ngay tại trang hiện tại.
    event.preventDefault();
    openLoginDrawer(to);
  }

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
