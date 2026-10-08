import api from './api.js';

/**
 * Fetch all approved consignment products (public)
 */
export async function fetchConsignmentProducts(params = {}) {
  const { data } = await api.get('/consignment-products', { params });
  return data;
}

/**
 * Fetch my consignment products (auth required)
 */
export async function fetchMyConsignmentProducts() {
  const { data } = await api.get('/consignment-products/my/list');
  return data;
}

/**
 * Create new consignment product (auth required)
 */
export async function createConsignmentProduct(productData) {
  const { data } = await api.post('/consignment-products', productData);
  return data;
}

/**
 * Get consignment product detail by ID
 */
export async function fetchConsignmentProductById(id) {
  const { data } = await api.get(`/consignment-products/${id}`);
  return data;
}
