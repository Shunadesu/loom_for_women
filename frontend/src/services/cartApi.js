import api from './api.js';

// ─── Cart (yêu cầu đăng nhập) ───────────────────────────────
// Phase 1: throw để store dùng fallback mock in-memory.
// Phase 2: trỏ /api/cart — sẽ trả data thật từ DB.

export const fetchCart = () =>
  api.get('/cart').then((r) => r.data);

export const addToCart = (productId, quantity = 1) =>
  api.post('/cart', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId) =>
  api.delete(`/cart/${itemId}`).then((r) => r.data);