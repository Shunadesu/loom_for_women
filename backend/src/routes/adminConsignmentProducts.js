import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  listAllConsignmentProducts,
  approveConsignmentProduct,
  rejectConsignmentProduct,
  deleteConsignmentProduct,
  getConsignmentStats,
} from '../controllers/adminConsignmentProductController.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// List all consignment products (with filter)
router.get('/', listAllConsignmentProducts);

// Stats
router.get('/stats', getConsignmentStats);

// Approve
router.put('/:id/approve', approveConsignmentProduct);

// Reject
router.put('/:id/reject', rejectConsignmentProduct);

// Delete
router.delete('/:id', deleteConsignmentProduct);

export default router;
