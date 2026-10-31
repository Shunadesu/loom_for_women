import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from '../services/cartApi.js';
import { useAuthStore } from './authStore.js';

/**
 * Cart store — Phase 1.5
 * - Lưu items vào localStorage (persist) để KHÔNG mất khi refresh.
 * - Khi đã đăng nhập: sync với server (DB).
 *   - Mỗi lần add/update/remove đều gọi API.
 *   - Nếu API lỗi, trả về { ok: false, error } để caller hiển thị thông báo
 *     thay vì nuốt lỗi im lặng.
 * - Khi CHƯA đăng nhập:
 *   - Vẫn lưu cục bộ để user không mất giỏ sau refresh.
 *   - KHÔNG gọi API (vì sẽ 401).
 *   - Trả về { ok: false, reason: 'auth' } để caller mở LoginDrawer.
 *
 * Khi login thành công → LoginDrawer sẽ gọi syncWithServer() để merge
 * local items lên server.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      count: 0,
      loading: false,
      error: null,
      initialized: false, // đã gọi fetchCart từ server 1 lần chưa
      isOpen: false,

      /**
       * Tải cart từ server — gọi 1 lần khi user vừa login (token xuất hiện).
       * Nếu server trả về items → thay thế local items.
       */
      init: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        if (get().initialized) return;
        set({ initialized: true });
        try {
          const data = await fetchCart();
          const serverItems = (data?.items || []).map((it) => {
            const product = it.productId
              ? {
                  _id: it.productId._id || it.productId,
                  title: it.productId.title,
                  thumbnail: it.productId.thumbnail,
                  price: it.productId.price,
                  originalPrice: it.productId.originalPrice,
                }
              : null;
            return {
              _id: it._id,
              productId: it.productId?._id || it.productId,
              quantity: it.quantity,
              product,
            };
          });
          set({
            items: serverItems,
            total:
              data?.total ??
              serverItems.reduce(
                (s, it) => s + it.quantity * (it.product?.price || 0),
                0
              ),
            count: serverItems.reduce((s, it) => s + it.quantity, 0),
            error: null,
          });
        } catch (err) {
          // Giữ items local nếu có
          set({ error: null });
        }
      },

      /**
       * Sync giỏ local lên server. Dùng sau khi login thành công.
       * Lấy tất cả items hiện tại (kể cả từ trước khi login) → POST lên server.
       * Sau khi sync xong → reload lại từ server để có _id chính xác.
       */
      syncWithServer: async () => {
        if (!useAuthStore.getState().isAuthenticated) {
          return { ok: false, reason: 'auth' };
        }
        const localItems = get().items.filter((it) => !it._id); // chỉ item chưa có _id
        if (localItems.length === 0) {
          // Không có gì để sync, fetch lại cho chắc
          set({ initialized: false });
          await get().init();
          return { ok: true };
        }
        set({ loading: true });
        try {
          for (const it of localItems) {
            await apiAddToCart(it.productId || it.product?._id, it.quantity);
          }
          set({ initialized: false, loading: false });
          await get().init();
          return { ok: true };
        } catch (err) {
          set({ loading: false, error: err?.response?.data?.error || 'Đồng bộ giỏ thất bại.' });
          return { ok: false, error: err?.response?.data?.error || 'Đồng bộ giỏ thất bại.' };
        }
      },

      /**
       * Thêm sản phẩm vào giỏ.
       * @returns { ok: true, item } | { ok: false, reason: 'auth' } | { ok: false, error }
       */
      addItem: async (product, quantity = 1) => {
        const productId = product._id || product.id;
        const isAuthed = useAuthStore.getState().isAuthenticated;

        // Optimistic update trước
        set((state) => {
          const existing = state.items.find(
            (it) => (it.productId || it.product?._id) === productId
          );
          let nextItems;
          if (existing) {
            nextItems = state.items.map((it) =>
              (it.productId || it.product?._id) === productId
                ? { ...it, quantity: it.quantity + quantity }
                : it
            );
          } else {
            nextItems = [...state.items, { productId, quantity, product }];
          }
          const total = nextItems.reduce(
            (s, it) => s + it.quantity * (it.product?.price || 0),
            0
          );
          const count = nextItems.reduce((s, it) => s + it.quantity, 0);
          return { items: nextItems, total, count };
        });

        if (!isAuthed) {
          // Lưu local, không gọi API
          return { ok: false, reason: 'auth' };
        }

        // Sync lên DB
        try {
          const data = await apiAddToCart(productId, quantity);
          // Cập nhật _id từ server nếu có
          if (data?.item?._id) {
            set((state) => ({
              items: state.items.map((it) =>
                (it.productId || it.product?._id) === productId
                  ? { ...it, _id: data.item._id }
                  : it
              ),
            }));
          }
          return { ok: true };
        } catch (err) {
          const msg = err?.response?.data?.error || 'Thêm vào giỏ thất bại.';
          return { ok: false, error: msg };
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

        if (!useAuthStore.getState().isAuthenticated) return { ok: false, reason: 'auth' };

        try {
          const item = get().items.find(
            (it) => (it.productId || it.product?._id) === productId
          );
          if (item?._id) await apiUpdateCartItem(item._id, quantity);
          return { ok: true };
        } catch (err) {
          const msg = err?.response?.data?.error || 'Cập nhật thất bại.';
          return { ok: false, error: msg };
        }
      },

      removeItem: async (productId) => {
        let removedItem = null;
        set((state) => {
          removedItem = state.items.find(
            (it) => (it.productId || it.product?._id) === productId
          );
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

        if (!useAuthStore.getState().isAuthenticated) return { ok: false, reason: 'auth' };
        if (!removedItem?._id) return { ok: true }; // local item, không cần gọi API

        try {
          await apiRemoveCartItem(removedItem._id);
          return { ok: true };
        } catch (err) {
          const msg = err?.response?.data?.error || 'Xoá thất bại.';
          return { ok: false, error: msg };
        }
      },

      clear: () => set({ items: [], total: 0, count: 0, initialized: false }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'loom-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        count: state.count,
      }),
    }
  )
);
