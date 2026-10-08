import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getAllForumPosts,
  approveForumPost,
  rejectForumPost,
  markQualityPost,
  deleteForumPost,
} from '../controllers/adminForumPostController.js';

const router = express.Router();

// All routes require admin
router.use(requireAuth, requireAdmin);

router.get('/', getAllForumPosts);
router.patch('/:id/approve', approveForumPost);
router.patch('/:id/reject', rejectForumPost);
router.patch('/:id/quality', markQualityPost);
router.delete('/:id', deleteForumPost);

export default router;
