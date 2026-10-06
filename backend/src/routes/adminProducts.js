import { Router } from 'express';
import { uploadProduct } from '../middleware/upload.js';
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  uploadProductThumbnail,
} from '../controllers/adminProductController.js';

const router = Router();

router.get('/', listAllProducts);
router.post('/', uploadProduct.single('thumbnail'), createProduct);
router.put('/:id', uploadProduct.single('thumbnail'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/reorder', reorderProducts);
router.post('/:id/thumbnail', uploadProduct.single('thumbnail'), uploadProductThumbnail);

export default router;