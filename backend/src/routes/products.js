import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  listProducts,
  getProductBySlug,
} from '../controllers/productController.js';

const router = Router();

router.use(optionalAuth);

router.get('/', listProducts);
router.get('/:slug', getProductBySlug);

export default router;