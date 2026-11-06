import { Router } from 'express';
import {
  listUsers,
  listUsersSummary,
  getUser,
  deleteUser,
  getStats,
  updateConfig,
} from '../controllers/adminController.js';
import { uploadHero, uploadLogo } from '../middleware/upload.js';
import {
  uploadLogo as uploadLogoHandler,
  deleteLogo as deleteLogoHandler,
} from '../controllers/brandController.js';
import {
  listAllHeroes,
  createHero,
  updateHero,
  deleteHero,
  reorderHeroes,
} from '../controllers/heroController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', listUsers);
router.get('/users/summary', listUsersSummary);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getStats);

router.put('/config', updateConfig);

// Logo thương hiệu — upload / xoá
router.put('/config/logo', uploadLogo.single('logo'), uploadLogoHandler);
router.delete('/config/logo', deleteLogoHandler);

// Hero banners — CRUD
router.get('/heroes', listAllHeroes);
router.post('/heroes', uploadHero.single('image'), createHero);
router.put('/heroes/:id', uploadHero.single('image'), updateHero);
router.delete('/heroes/:id', deleteHero);
router.post('/heroes/reorder', reorderHeroes);

export default router;