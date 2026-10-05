import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  myCertificates,
  verifyCertificate,
} from '../controllers/certificateController.js';

const router = Router();

// Public verify — không cần auth
router.get('/verify/:serialNumber', verifyCertificate);

router.use(requireAuth);
router.get('/me', myCertificates);

export default router;