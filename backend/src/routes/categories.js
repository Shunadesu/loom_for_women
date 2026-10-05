import { Router } from 'express';
import {
  listActiveCategories,
  getCategoryBySlug,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', listActiveCategories);
router.get('/:slug', getCategoryBySlug);

export default router;