import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '../icons/index.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { formatPrice } from '../../utils/format.js';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, total, count, updateQty, removeItem } = useCartStore();

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
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
            onClick={onClose}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E60067] shadow-sm">
              <ShoppingBagIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Giỏ hàng</h2>
              <p className="text-xs text-slate-600">{count} sản phẩm</p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white hover:text-[#E60067]"
            aria-label="Đóng giỏ hàng"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBagIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Giỏ hàng trống</h3>
              <p className="text-sm text-slate-600">
                Thêm sản phẩm thủ công vào giỏ hàng để tiếp tục mua sắm
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                const productId = item.productId || product?._id;
                
                return (
                  <motion.div
                    key={productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    layout
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Product Image */}
                    <img
                      src={product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'}
                      alt={product?.name || 'Sản phẩm'}
                      className="h-20 w-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';
                      }}
                    />

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="line-clamp-2 text-sm font-bold text-slate-900">
                          {product?.name || 'Sản phẩm không xác định'}
                        </h4>
                        <p className="mt-1 text-sm font-bold text-[#E60067]">
                          {formatPrice(product?.price || 0)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => updateQty(productId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:border-[#E60067] hover:bg-pink-50 hover:text-[#E60067]"
                            aria-label="Giảm số lượng"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.span 
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="w-8 text-center text-sm font-bold text-slate-900"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            onClick={() => updateQty(productId, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:border-[#E60067] hover:bg-pink-50 hover:text-[#E60067]"
                            aria-label="Tăng số lượng"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          onClick={() => removeItem(productId)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Xóa sản phẩm"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {/* Total */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Tổng cộng:</span>
              <span className="text-xl font-black text-[#E60067]">
                {formatPrice(total)}
              </span>
            </div>

            {/* Checkout Button */}
            <motion.button
              className="w-full rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-xl"
              onClick={() => {
                // TODO: Navigate to checkout page
                alert('Chức năng thanh toán đang được phát triển');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Tiến hành thanh toán
            </motion.button>

            <motion.button
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Tiếp tục mua sắm
            </motion.button>
          </div>
        )}
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
