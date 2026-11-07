import { Router } from 'express';
import { uploadCourse, uploadLessonPdf } from '../middleware/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  listAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
  uploadCourseThumbnail,
} from '../controllers/adminCourseController.js';
import {
  listLessonsByCourse,
  createLesson,
  reorderLessons,
} from '../controllers/adminLessonController.js';

const router = Router();

// Toàn bộ endpoint quản trị khóa học yêu cầu JWT + role=admin
router.use(requireAuth, requireAdmin);

router.get('/', listAllCourses);

// Lesson routes (nested under course) — đặt trước route /:id để tránh xung đột
router.get('/:courseId/lessons', listLessonsByCourse);
router.post('/:courseId/lessons', uploadLessonPdf.single('pdf'), createLesson);
router.post('/:courseId/lessons/reorder', reorderLessons);

// Chi tiết 1 khóa học (dùng cho trang Sửa khóa học)
router.get('/:id', getCourseById);

router.post('/', uploadCourse.single('thumbnail'), createCourse);
router.put('/:id', uploadCourse.single('thumbnail'), updateCourse);
router.delete('/:id', deleteCourse);
router.post('/reorder', reorderCourses);
router.post('/:id/thumbnail', uploadCourse.single('thumbnail'), uploadCourseThumbnail);

export default router;
