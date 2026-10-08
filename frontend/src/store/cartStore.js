import { create } from 'zustand';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from '../services/cartApi.js';

/**
 * Cart store
 * Phase 1: chỉ in-memory (items: [{ productId, quantity, product }]).
 *   - Khi API lỗi → giữ items trong RAM.
 *   - Reload trang sẽ mất cart (chưa persist).
 * Phase 2: sẽ thay bằng fetchCart() + addItem() qua API thật, persist DB.
 */
export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  count: 0,
  loading: false,
  error: null,
  initialized: false,
  isOpen: false,

  /** Tải cart từ server — gọi 1 lần khi app boot (nếu đã login). */
  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    try {
      const data = await fetchCart();
      const items = data?.items || [];
      set({
        items,
        total: data?.total ?? items.reduce((s, it) => s + it.quantity * (it.product?.price || 0), 0),
        count: items.reduce((s, it) => s + it.quantity, 0),
      });
    } catch {
      // Phase 1 fallback — giữ items = []
    }
  },

  addItem: async (product, quantity = 1) => {
    const productId = product._id || product.id;
    // Optimistic update in-memory
    set((state) => {
      const existing = state.items.find((it) => (it.productId || it.product?._id) === productId);
      let nextItems;
      if (existing) {
        nextItems = state.items.map((it) =>
          (it.productId || it.product?._id) === productId
            ? { ...it, quantity: it.quantity + quantity }
            : it
        );
      } else {
        nextItems = [
          ...state.items,
          { productId, quantity, product },
        ];
      }
      const total = nextItems.reduce(
        (s, it) => s + it.quantity * (it.product?.price || 0),
        0
      );
      const count = nextItems.reduce((s, it) => s + it.quantity, 0);
      return { items: nextItems, total, count };
    });

    // Phase 2: sync lên DB
    try {
      await apiAddToCart(productId, quantity);
    } catch {
      // Phase 1: bỏ qua — giữ in-memory
    }
  },

  updateQty: async (productId, quantity) => {
    set((state) => {
      let nextItems;
      if (quantity <= 0) {
        nextItems = state.items.filter(
          (it) => (it.productId || it.product?._id) !== productId
        );
      } else {
        nextItems = state.items.map((it) =>
          (it.productId || it.product?._id) === productId
            ? { ...it, quantity }
            : it
        );
      }
      const total = nextItems.reduce(
        (s, it) => s + it.quantity * (it.product?.price || 0),
        0
      );
      const count = nextItems.reduce((s, it) => s + it.quantity, 0);
      return { items: nextItems, total, count };
    });

    // Phase 2: sync lên DB
    try {
      const item = get().items.find(
        (it) => (it.productId || it.product?._id) === productId
      );
      if (item?._id) await apiUpdateCartItem(item._id, quantity);
    } catch {
      /* ignore */
    }
  },

  removeItem: async (productId) => {
    set((state) => {
      const nextItems = state.items.filter(
        (it) => (it.productId || it.product?._id) !== productId
      );
      const total = nextItems.reduce(
        (s, it) => s + it.quantity * (it.product?.price || 0),
        0
      );
      const count = nextItems.reduce((s, it) => s + it.quantity, 0);
      return { items: nextItems, total, count };
    });

    try {
      const item = get().items.find(
        (it) => (it.productId || it.product?._id) === productId
      );
      if (item?._id) await apiRemoveCartItem(item._id);
    } catch {
      /* ignore */
    }
  },

  clear: () => set({ items: [], total: 0, count: 0 }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));