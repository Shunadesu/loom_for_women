import { Router } from 'express';
import {
  listAllProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  reorderProductCategories,
} from '../controllers/adminProductCategoryController.js';

const router = Router();

router.get('/', listAllProductCategories);
router.post('/', createProductCategory);
router.put('/:id', updateProductCategory);
router.delete('/:id', deleteProductCategory);
router.post('/reorder', reorderProductCategories);

export default router;