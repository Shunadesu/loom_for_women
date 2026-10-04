import { Router } from 'express';
import { trackEvent } from '../controllers/eventController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, trackEvent);

export default router;