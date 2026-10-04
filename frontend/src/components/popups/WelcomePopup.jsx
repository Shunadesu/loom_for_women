import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePopupStore } from '../../store/popupStore.js';
import { useConfigStore } from '../../store/configStore.js';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.85, y: 16, transition: { duration: 0.2 } },
};

export default function WelcomePopup() {
  const next = usePopupStore((s) => s.next);
  const config = useConfigStore((s) => s.config);
  const fetchConfig = useConfigStore((s) => s.fetchConfig);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <motion.div
      key="welcome-backdrop"
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
        className="w-full max-w-md overflow-hidden rounded-3xl bg-primary-500 shadow-2xl ring-1 ring-primary-100 flex flex-col items-center justify-center gap-2"
      >
        <div className="text-xl font-bold text-white p-4">HỘ CHIẾU AN TOÀN</div>

        {/* Logo header */}
        <div className="relative flex items-center justify-center">
          <motion.img
            src="/logo.png"
            alt="Loom for Women"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
            className="h-40 w-40 object-contain"
          />
        </div>

        {/* Body */}
        <div className="p-8 text-center bg-white rounded-t-3xl">
          <h3 className="text-xl font-bold text-primary-600">
            {config.welcomeTitle}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-600 text-center">
            {config.welcomeDesc}
          </p>

          <div className="mt-8">
            <button
              onClick={next}
              className="btn-primary w-full transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              
              {config.welcomeBtn}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}