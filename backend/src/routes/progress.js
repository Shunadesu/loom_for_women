import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import {
  markLessonComplete,
  myProgress,
  myStats,
  getContinueLearning,
} from '../controllers/progressController.js';

const router = Router();

router.post('/lessons/:lessonId/complete', requireAuth, markLessonComplete);
router.get('/me', requireAuth, myProgress);
router.get('/me/stats', requireAuth, myStats);
router.get('/me/continue', requireAuth, getContinueLearning);

export default router;