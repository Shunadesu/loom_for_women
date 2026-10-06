import { Router } from 'express';
import { listActiveProductCategories } from '../controllers/productCategoryController.js';

const router = Router();

router.get('/', listActiveProductCategories);

export default router;