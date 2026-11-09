import { Router } from 'express';
import { uploadLessonMedia } from '../middleware/upload.js';
import {
  updateLesson,
  deleteLesson,
} from '../controllers/adminLessonController.js';

const router = Router();

/**
 * Multer nhận đồng thời:
 *   - pdf          : file PDF đính kèm kiểu cũ (media bổ sung)
 *   - slidePdf     : file PDF slide bài giảng (phần 1)
 *   - summaryImage : ảnh infographic tóm tắt (phần 3)
 *   - summaryPdf   : file PDF tóm tắt (phần 3)
 */
const lessonMediaFields = uploadLessonMedia.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'slidePdf', maxCount: 1 },
  { name: 'summaryImage', maxCount: 1 },
  { name: 'summaryPdf', maxCount: 1 },
]);

router.put('/:id', lessonMediaFields, updateLesson);
router.delete('/:id', deleteLesson);

export default router;
