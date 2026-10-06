import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getPassport,
  getMyProducts,
  getMyOrders,
  getMyMessages,
} from '../controllers/passportController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get passport data
router.get('/passport', getPassport);

// Get my posted products
router.get('/products/me', getMyProducts);

// Get my orders (from customers)
router.get('/orders', getMyOrders);

// Get my messages (from customers)
router.get('/messages', getMyMessages);

export default router;
