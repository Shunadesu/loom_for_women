import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { trackVisit } from '../controllers/visitController.js';

const router = Router();

router.post('/', optionalAuth, trackVisit);

export default router;
