import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { listCourses, getCourseBySlug } from '../controllers/courseController.js';
import { listComments } from '../controllers/commentController.js';

const router = Router();

// Comments cho 1 course — public list
router.get('/:id/comments', listComments);

router.use(optionalAuth);

router.get('/', listCourses);
router.get('/:slug', getCourseBySlug);

export default router;