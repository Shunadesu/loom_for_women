import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  listConsignmentProducts,
  createConsignmentProduct,
  getMyConsignmentProducts,
  getConsignmentProductById,
} from '../controllers/consignmentProductController.js';

const router = Router();

// Public - list approved consignment products
router.get('/', optionalAuth, listConsignmentProducts);

// Public - get detail
router.get('/:id', optionalAuth, getConsignmentProductById);

// Auth required - create new consignment product
router.post('/', requireAuth, createConsignmentProduct);

// Auth required - get my consignment products
router.get('/my/list', requireAuth, getMyConsignmentProducts);

export default router;
