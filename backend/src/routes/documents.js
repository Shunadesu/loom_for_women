import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  listDocuments,
  listCoursesWithDocuments,
  listDocumentsByLesson,
  getDocumentDetail,
  recordDownload,
} from '../controllers/documentController.js';

const router = Router();

router.get('/', optionalAuth, listDocuments);
router.get('/courses', listCoursesWithDocuments);
router.get('/lesson/:lessonId', optionalAuth, listDocumentsByLesson);
router.get('/:id', optionalAuth, getDocumentDetail);
router.post('/:id/download', recordDownload);

export default router;