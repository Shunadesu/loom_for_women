import api from './api.js';

/**
 * Get user's safety passport data
 */
export async function fetchPassport() {
  const response = await api.get('/me/passport');
  return response.data;
}

/**
 * Get user's posted products
 */
export async function fetchMyProducts() {
  const response = await api.get('/me/products/me');
  return response.data;
}

/**
 * Get orders from customers
 */
export async function fetchMyOrders() {
  const response = await api.get('/me/orders');
  return response.data;
}

/**
 * Get messages from customers
 */
export async function fetchMyMessages() {
  const response = await api.get('/me/messages');
  return response.data;
}
