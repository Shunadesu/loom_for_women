import { Router } from 'express';
import {
  listAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/adminCategoryController.js';

const router = Router();

router.get('/', listAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.post('/reorder', reorderCategories);

export default router;