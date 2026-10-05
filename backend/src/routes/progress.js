import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { markLessonComplete, myProgress } from '../controllers/progressController.js';

const router = Router();

router.post('/lessons/:lessonId/complete', requireAuth, markLessonComplete);
router.get('/me', requireAuth, myProgress);

export default router;