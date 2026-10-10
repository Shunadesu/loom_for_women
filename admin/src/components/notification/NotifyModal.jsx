import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon } from './icons.jsx';
import { useNotificationStore } from '../store/notificationStore.js';

const ICON_MAP = {
  success: { ring: 'bg-emerald-100', color: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { ring: 'bg-red-100', color: 'text-red-600', bar: 'bg-red-500' },
  warning: { ring: 'bg-amber-100', color: 'text-amber-600', bar: 'bg-amber-500' },
  info: { ring: 'bg-sky-100', color: 'text-sky-600', bar: 'bg-sky-500' },
};

const TITLE_MAP = {
  success: 'Thành công',
  error: 'Đã xảy ra lỗi',
  warning: 'Cảnh báo',
  info: 'Thông báo',
};

function TypeIcon({ type }) {
  // Dùng ký tự đơn giản vì admin icons tối giản
  const symbol = {
    success: '✓',
    error: '!',
    warning: '!',
    info: 'i',
  }[type] || 'i';
  return (
    <span className="text-base font-extrabold leading-none">{symbol}</span>
  );
}

export default function NotifyModal() {
  const modal = useNotificationStore((s) => s.modal);
  const closeModal = useNotificationStore((s) => s.closeModal);

  useEffect(() => {
    if (!modal) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [modal, closeModal]);

  return (
    <AnimatePresence>
      {modal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-100"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3 p-5">
              {(() => {
                const cfg = ICON_MAP[modal.type] || ICON_MAP.info;
                return (
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cfg.ring} ${cfg.color}`}
                  >
                    <TypeIcon type={modal.type} />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {modal.title || TITLE_MAP[modal.type] || TITLE_MAP.info}
                </h3>
                {modal.message && (
                  <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                    {modal.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:from-pink-600 hover:to-rose-700"
              >
                Đồng ý
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
