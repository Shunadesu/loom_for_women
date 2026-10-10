import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ShieldAlertIcon,
  InfoIcon,
  TriangleAlertIcon,
  XMarkIcon,
} from '../icons/index.jsx';
import { useNotificationStore } from '../../store/notificationStore.js';

const STYLE_MAP = {
  success: {
    Icon: CheckCircleIcon,
    bar: 'bg-emerald-500',
    iconWrap: 'bg-emerald-100 text-emerald-600',
  },
  error: {
    Icon: ShieldAlertIcon,
    bar: 'bg-red-500',
    iconWrap: 'bg-red-100 text-red-600',
  },
  warning: {
    Icon: TriangleAlertIcon,
    bar: 'bg-amber-500',
    iconWrap: 'bg-amber-100 text-amber-600',
  },
  info: {
    Icon: InfoIcon,
    bar: 'bg-sky-500',
    iconWrap: 'bg-sky-100 text-sky-600',
  },
};

export default function ToastStack() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[80] flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 sm:right-4 sm:top-4 sm:w-96">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const cfg = STYLE_MAP[t.type] || STYLE_MAP.info;
          const { Icon } = cfg;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${cfg.bar}`} />
              <div className="flex items-start gap-3 p-3.5 pl-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.iconWrap}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  {t.title && (
                    <p className="text-[13px] font-extrabold text-slate-900">
                      {t.title}
                    </p>
                  )}
                  {t.message && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {t.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Đóng"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
