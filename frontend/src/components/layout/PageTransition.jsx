import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * PageTransition — bọc nội dung route với AnimatePresence để có hiệu ứng
 * chuyển trang mượt mà (trang cũ exit xong, trang mới mới enter).
 * Kết hợp với ScrollToTop (đã chạy useLayoutEffect) để vừa trượt mượt,
 * vừa reset scroll về 0, vừa không bị "nháy".
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
