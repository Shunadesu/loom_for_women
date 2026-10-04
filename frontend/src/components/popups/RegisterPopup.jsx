import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePopupStore } from '../../store/popupStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useConfigStore } from '../../store/configStore.js';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.2 } },
};

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// Inline icons (stroke-based, dùng chung)
const BackIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);

const CloseIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const UserIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
  </svg>
);

const LoginIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H4.5M11 8l-4 4 4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 4h5a1 1 0 011 1v14a1 1 0 01-1 1h-5" />
  </svg>
);

const PhoneIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const CheckIcon = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function RegisterPopup() {
  const close = usePopupStore((s) => s.close);
  const reset = usePopupStore((s) => s.reset);
  const setAuth = useAuthStore((s) => s.setAuth);
  const config = useConfigStore((s) => s.config);

  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!PHONE_REGEX.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng SĐT Việt Nam.');
      return false;
    }
    if (tab === 'register' && name && name.trim().length > 50) {
      setError('Họ và tên tối đa 50 ký tự.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Mock logic — sẽ thay bằng API call khi backend ready
    try {
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        _id: 'mock-id-' + Date.now(),
        phone: phone.trim(),
        name: name.trim() || 'Bạn mới',
      };
      const mockToken = 'mock-jwt-' + Date.now();
      setAuth(mockUser, mockToken);
      close();
    } catch (err) {
      setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    reset();
  };

  return (
    <motion.div
      key="register-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-50/80 backdrop-blur-sm p-4"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-primary-100"
      >
        {/* Pink header with logo + title + back/close */}
        <div className="relative bg-primary px-5 pt-5 pb-6">
          <button
            onClick={handleBackToWelcome}
            className="absolute left-3 top-3 rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
            aria-label="Quay lại"
          >
            <BackIcon />
          </button>
          <button
            onClick={close}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
            aria-label="Đóng"
          >
            <CloseIcon />
          </button>

          <div className="flex items-center gap-3 pl-1">
            <img
              src="/logo.png"
              alt="Loom for Women"
              className="h-14 w-14 flex-shrink-0 rounded-2xl bg-white p-1.5 object-contain shadow-md"
            />
            <div className="min-w-0 pr-6">
              <h2 className="text-xl font-extrabold leading-tight text-white">
                {config.registerTitle}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/85">
                {config.registerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-5">
          {/* Tab switcher (pill style) */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            {[
              { key: 'register', label: 'Đăng Ký', icon: <UserIcon className="h-4 w-4" /> },
              { key: 'login', label: 'Đăng Nhập', icon: <LoginIcon className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                  tab === t.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'register' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {tab === 'register' && (
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <UserIcon className="h-4 w-4" />
                      Họ và tên{' '}
                      <span className="text-xs font-normal text-gray-400">
                        (Không bắt buộc)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Nguyễn Thị Mai Hương"
                      maxLength={50}
                      className="input-field"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <PhoneIcon className="h-4 w-4" />
                    Số điện thoại <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại..."
                    className="input-field"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Vui lòng nhập đúng số điện thoại Việt Nam
                  </p>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Info banner (only on register tab) */}
            {tab === 'register' && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-primary-50 p-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <CheckIcon />
                </div>
                <p className="text-xs leading-relaxed text-primary-700">
                  Đăng ký tài khoản bằng SĐT giúp bạn lưu giữ các chứng chỉ khoa học
                  &amp; quà tặng an toàn.
                </p>
              </div>
            )}

            {/* Two buttons in one row */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Để sau
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="4"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    {tab === 'register'
                      ? config.registerBtn || 'Đăng Ký Ngay'
                      : config.loginBtn || 'Đăng Nhập'}
                  </>
                )}
              </button>
            </div>

            {tab === 'register' && (
              <p className="mt-4 text-center text-xs text-gray-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); }}
                  className="font-semibold text-primary hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}