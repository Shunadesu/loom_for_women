import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard.jsx';

// Stagger cho các card khi danh sách thay đổi (đổi filter, sort, v.v.)
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    // Cap delay ở 8 item đầu — nếu có nhiều sản phẩm thì không bị chờ lâu
    transition: {
      delay: Math.min(i, 8) * 0.035,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export default function ProductGrid({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"
      >
        <p className="text-2xl">🔍</p>
        <p className="mt-2 text-sm font-bold text-slate-700">
          Không tìm thấy sản phẩm phù hợp
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Hãy thử chọn danh mục khác hoặc xoá bộ lọc tìm kiếm nhé.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.div
            key={p._id || p.slug}
            layout
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            <ProductCard product={p} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
