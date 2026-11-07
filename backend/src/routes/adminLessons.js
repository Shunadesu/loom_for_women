import { Router } from 'express';
import { uploadLessonPdf } from '../middleware/upload.js';
import {
  updateLesson,
  deleteLesson,
} from '../controllers/adminLessonController.js';

const router = Router();

router.put('/:id', uploadLessonPdf.single('pdf'), updateLesson);
router.delete('/:id', deleteLesson);

export default router;