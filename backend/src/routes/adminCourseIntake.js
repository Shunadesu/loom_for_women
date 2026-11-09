import { Router } from 'express';
import { uploadLessonMedia } from '../middleware/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  createCourseWithLesson,
  updateLessonWithContent,
  getLessonContent,
  getCourseContent,
  clearLessonContent,
} from '../controllers/adminCourseIntakeController.js';

const router = Router();

// Toàn bộ endpoint nhập bài học 4 phần yêu cầu JWT + role=admin
router.use(requireAuth, requireAdmin);

const mediaFields = uploadLessonMedia.fields([
  { name: 'slidePdf', maxCount: 1 },
  { name: 'summaryImage', maxCount: 1 },
  { name: 'summaryPdf', maxCount: 1 },
]);

// Tạo khóa học + bài học đầu tiên đủ 4 phần trong 1 request
router.post('/', mediaFields, createCourseWithLesson);

// Nội dung 4 phần của 1 khóa học
router.get('/courses/:courseId/content', getCourseContent);

// Nội dung 4 phần của 1 bài học
router.get('/lessons/:id/content', getLessonContent);

// Cập nhật bài học + 4 phần
router.put('/lessons/:id/intake', mediaFields, updateLessonWithContent);

// Xoá sạch nội dung 4 phần (giữ lesson)
router.delete('/lessons/:id/content', clearLessonContent);

export default router;