import { Router } from 'express';
import {
  listAllComments,
  hideComment,
} from '../controllers/adminCommentController.js';

const router = Router();

router.get('/', listAllComments);
router.put('/:id/hide', hideComment);

export default router;