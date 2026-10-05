import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import { extractYoutubeId } from '../utils/youtube.js';

const recomputeCourseMeta = async (courseId) => {
  const count = await Lesson.countDocuments({ courseId });
  const lessons = await Lesson.find({ courseId }).lean();
  const totalSeconds = lessons.reduce(
    (acc, l) => acc + (Number(l.durationSeconds) || 0),
    0
  );
  await Course.findByIdAndUpdate(courseId, {
    lessonsCount: count,
    durationMinutes: Math.round(totalSeconds / 60),
  });
};

export const listLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const items = await Lesson.find({ courseId })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, youtubeUrl, youtubeId, order = 0, durationSeconds = 0 } = req.body;
    if (!title) return res.status(400).json({ error: 'Thiếu tiêu đề.' });
    const ytId = extractYoutubeId(youtubeUrl || youtubeId);
    if (!ytId) {
      return res.status(400).json({ error: 'YouTube URL/ID không hợp lệ.' });
    }
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại.' });
    const count = await Lesson.countDocuments({ courseId });
    const lesson = await Lesson.create({
      courseId,
      title: String(title).slice(0, 200),
      youtubeId: ytId,
      order: Number.isFinite(+order) ? +order : count,
      durationSeconds: Math.max(0, Number(durationSeconds) || 0),
    });
    await recomputeCourseMeta(courseId);
    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ error: 'Tạo bài học thất bại.' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy.' });
    const { title, youtubeUrl, youtubeId, order, durationSeconds } = req.body;
    if (typeof title === 'string' && title.trim()) lesson.title = title.slice(0, 200);
    if (youtubeUrl !== undefined || youtubeId !== undefined) {
      const ytId = extractYoutubeId(youtubeUrl || youtubeId);
      if (!ytId) return res.status(400).json({ error: 'YouTube URL/ID không hợp lệ.' });
      lesson.youtubeId = ytId;
    }
    if (order !== undefined && Number.isFinite(+order)) lesson.order = +order;
    if (durationSeconds !== undefined && durationSeconds !== '') {
      lesson.durationSeconds = Math.max(0, Number(durationSeconds) || 0);
    }
    await lesson.save();
    await recomputeCourseMeta(lesson.courseId);
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy.' });
    const courseId = lesson.courseId;
    await lesson.deleteOne();
    await recomputeCourseMeta(courseId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Lesson.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};