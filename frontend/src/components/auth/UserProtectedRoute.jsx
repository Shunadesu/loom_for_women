import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

/**
 * Guard route người dùng — yêu cầu đã đăng nhập.
 * - Chưa đăng nhập → mở LoginDrawer với redirectPath = đường dẫn hiện tại
 *   (sau khi đăng nhập sẽ quay lại đúng trang đó).
 * - Thay vì render `null` (trang trắng), hiển thị một thông báo nhẹ kèm nút
 *   đăng nhập để người dùng không bị "mất" trang trắng khi đóng drawer.
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
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary-100">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
            🔒
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Vui lòng đăng nhập để tiếp tục
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500">
            Trang này chỉ dành cho hội viên đã đăng nhập. Đăng nhập xong bạn sẽ
            được chuyển thẳng về trang đang xem.
          </p>
          <button
            type="button"
            onClick={() => openLoginDrawer(location.pathname)}
            className="mt-5 cursor-pointer rounded-full bg-[#E60067] px-5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#c90059]"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return children;
}
