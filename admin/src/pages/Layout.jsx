import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';

const SIDEBAR_KEY = 'loom-sidebar-collapsed';

function readSidebarPref() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(readSidebarPref);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore quota / private mode */
    }
  }, [collapsed]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E60067] text-xs font-black text-white">
            L
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">Loom Admin</p>
            <p className="text-[9px] text-slate-400">Quản trị hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E60067] text-[9px] font-black text-white">
              {(user?.name || user?.phone || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-medium text-slate-700">
              {user?.name || user?.phone || 'Admin'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
