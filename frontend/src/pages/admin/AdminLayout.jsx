import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import Sidebar from '../../components/admin/Sidebar.jsx';

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E60067] text-sm font-black text-white">
              L
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Loom Admin</p>
              <p className="text-[10px] text-slate-400">Quản trị hệ thống</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:inline-block"
          >
            ← Về trang chủ
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E60067] text-[10px] font-black text-white">
              {(user?.name || user?.phone || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-700">
              {user?.name || user?.phone || 'Admin'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}