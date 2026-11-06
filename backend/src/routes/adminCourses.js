import { Router } from 'express';
import { uploadCourse } from '../middleware/upload.js';
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

router.get('/', listAllCourses);

// Lesson routes (nested under course) — đặt trước route /:id để tránh xung đột
router.get('/:courseId/lessons', listLessonsByCourse);
router.post('/:courseId/lessons', createLesson);
router.post('/:courseId/lessons/reorder', reorderLessons);

// Chi tiết 1 khóa học (dùng cho trang Sửa khóa học)
router.get('/:id', getCourseById);

router.post('/', uploadCourse.single('thumbnail'), createCourse);
router.put('/:id', uploadCourse.single('thumbnail'), updateCourse);
router.delete('/:id', deleteCourse);
router.post('/reorder', reorderCourses);
router.post('/:id/thumbnail', uploadCourse.single('thumbnail'), uploadCourseThumbnail);

export default router;
