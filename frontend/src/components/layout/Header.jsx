import { useAuthStore } from '../../store/authStore.js';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 border-b border-primary-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Loom for Women"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-200"
          />
          <div className="leading-tight">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Hồ Chiêu An Toàn
            </p>
            <h1 className="text-lg font-extrabold text-primary-600">Loom for Women</h1>
          </div>
        </div>

        <nav className="hidden gap-8 md:flex">
          {['Trang chủ', 'Giới thiệu', 'Sứ mệnh', 'Liên hệ'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Chào, <span className="font-semibold text-primary-600">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-primary-300 px-4 py-1.5 text-sm font-medium text-primary-600 transition hover:bg-primary-50"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
              Khách
            </span>
          )}
        </div>
      </div>
    </header>
  );
}