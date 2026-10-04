import { Router } from 'express';
import {
  listUsers,
  getUser,
  deleteUser,
  getStats,
  updateConfig,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getStats);

router.put('/config', updateConfig);

export default router;