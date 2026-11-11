import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon } from '../icons/index.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function LoginDrawer() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const { isOpen, redirectPath, closeLoginDrawer } = useLoginDrawerStore();
  const syncCartWithServer = useCartStore((s) => s.syncWithServer);
  const openCart = useCartStore((s) => s.openCart);

  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form đăng ký
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regOccupation, setRegOccupation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeLoginDrawer();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeLoginDrawer]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setPhone('');
      setPassword('');
      setError('');
      setRegName('');
      setRegPhone('');
      setRegAge('');
      setRegOccupation('');
      setRegPassword('');
      setRegError('');
    }
  }, [isOpen]);

  /**
   * Xử lý chung sau khi xác thực thành công (đăng nhập hoặc đăng ký).
   * Sync giỏ cục bộ lên server → đóng drawer → điều hướng nếu có.
   */
  async function finishAuthSuccess() {
    // Sau khi xác thực thành công: nếu có sản phẩm trong giỏ cục bộ
    // (thêm khi chưa login) → sync lên server.
    try {
      await syncCartWithServer();
    } catch {
      /* không chặn flow nếu sync lỗi */
    }
    closeLoginDrawer();

    // Nếu redirectPath là '/gio-hang' (hoặc '/cua-hang'), mở cart drawer
    if (redirectPath === '/gio-hang' || redirectPath === '/cua-hang') {
      openCart();
    } else if (redirectPath && redirectPath !== '/') {
      // Nếu có redirectPath hợp lệ, chuyển trang
      navigate(redirectPath, { replace: true });
    }
    // Nếu redirectPath là '/' hoặc không có, không làm gì (ở lại trang hiện tại)
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    setRegError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone.trim(), password);
      await finishAuthSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      await register({
        name: regName,
        phone: regPhone,
        age: regAge,
        occupation: regOccupation,
        password: regPassword,
      });
      await finishAuthSuccess();
    } catch (err) {
      setRegError(
        err?.response?.data?.error || err.message || 'Đăng ký thất bại, vui lòng thử lại.'
      );
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeLoginDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E60067] to-rose-600 shadow-sm">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {mode === 'login'
                      ? 'Truy cập tài khoản của bạn'
                      : 'Tạo tài khoản mới để bắt đầu'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={closeLoginDrawer}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white hover:text-[#E60067]"
                aria-label="Đóng"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="mb-6 text-center">
                <p className="text-sm text-slate-600">
                  {mode === 'login' ? (
                    <>
                      Chào mừng bạn quay lại với<br />
                      <span className="font-bold text-[#E60067]">Loom for Women</span>
                    </>
                  ) : (
                    <>
                      Tạo tài khoản mới tại<br />
                      <span className="font-bold text-[#E60067]">Loom for Women</span>
                    </>
                  )}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-pink-50 p-1">
                {[
                  { key: 'login', label: 'Đăng nhập' },
                  { key: 'register', label: 'Đăng ký' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchMode(tab.key)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                      mode === tab.key
                        ? 'bg-gradient-to-r from-[#E60067] to-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-[#E60067]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoComplete="username"
                      placeholder="0901234567"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Nhập số điện thoại đã đăng ký
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Nếu tài khoản chưa có mật khẩu, hãy để trống
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Đang đăng nhập...
                      </span>
                    ) : (
                      'Đăng nhập'
                    )}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      maxLength={50}
                      autoComplete="name"
                      placeholder="Nguyễn Thị Lan"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                      autoComplete="tel"
                      placeholder="0901234567"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Tuổi
                    </label>
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      required
                      min={13}
                      max={100}
                      placeholder="VD: 28"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Nghề nghiệp
                    </label>
                    <input
                      type="text"
                      value={regOccupation}
                      onChange={(e) => setRegOccupation(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="VD: Công nhân may, Bán hàng online…"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#E60067] focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Mật khẩu tối thiểu 6 ký tự
                    </p>
                  </div>

                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {regError}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={regLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {regLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Đang đăng ký...
                      </span>
                    ) : (
                      'Đăng ký'
                    )}
                  </motion.button>
                </form>
              )}

              {/* Switch mode */}
              <p className="mt-6 text-center text-xs text-slate-500">
                {mode === 'login' ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-[#E60067] hover:underline"
                    >
                      Đăng ký tài khoản mới
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#E60067] hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
