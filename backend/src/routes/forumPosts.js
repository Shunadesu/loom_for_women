import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getForumPosts,
  getForumPostById,
  createForumPost,
  toggleLikeForumPost,
} from '../controllers/forumPostController.js';

const router = express.Router();

// Public routes
router.get('/', getForumPosts);
router.get('/:id', getForumPostById);

// Protected routes
router.post('/', requireAuth, createForumPost);
router.post('/:id/like', requireAuth, toggleLikeForumPost);

export default router;
