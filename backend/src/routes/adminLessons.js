import { Router } from 'express';
import {
  updateLesson,
  deleteLesson,
} from '../controllers/adminLessonController.js';

const router = Router();

router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;