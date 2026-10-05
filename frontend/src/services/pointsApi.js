import api from './api.js';

export const fetchMyPoints = () =>
  api.get('/points/me').then((r) => r.data);

export const fetchMyTransactions = () =>
  api.get('/points/me/transactions').then((r) => r.data.items || []);