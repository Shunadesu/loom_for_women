import path from 'path';
import fs from 'fs';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import CourseComment from '../models/CourseComment.js';
import Favorite from '../models/Favorite.js';
import { safeUnlink, UPLOAD_COURSE_DIR } from '../middleware/upload.js';
import { slugify } from '../utils/slugify.js';
import { extractYoutubeId } from '../utils/youtube.js';

const publicUrlFor = (filename) => {
  const base =
    process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3010}`;
  return `${base.replace(/\/$/, '')}/uploads/courses/${filename}`;
};

const filenameFromUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop();
    return last || null;
  } catch {
    return null;
  }
};

const absFromFilename = (filename) =>
  filename ? path.join(UPLOAD_COURSE_DIR, filename) : null;

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base || `course-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Course.findOne({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

export const listAllCourses = async (_req, res) => {
  try {
    const items = await Course.find()
      .populate('category', 'name slug color')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description = '',
      thumbnail: thumbnailInput = '',
      category = null,
      rating = 0,
      durationMinutes = 0,
      isPublished = true,
      isFeatured = false,
      order = 0,
      isActive = true,
      lessons: lessonsJson = null,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Thiếu tiêu đề.' });

    let thumbnail = thumbnailInput;
    if (req.file) {
      thumbnail = publicUrlFor(req.file.filename);
    }
    if (!thumbnail) {
      return res.status(400).json({ error: 'Thiếu ảnh thumbnail (upload hoặc URL).' });
    }

    const slug = await ensureUniqueSlug(slugify(title));
    const course = await Course.create({
      title: String(title).slice(0, 200),
      slug,
      description: String(description).slice(0, 2000),
      thumbnail: String(thumbnail).slice(0, 1000),
      category: category || null,
      rating: Math.max(0, Math.min(5, Number(rating) || 0)),
      durationMinutes: Math.max(0, Number(durationMinutes) || 0),
      isPublished: isPublished === 'false' || isPublished === false ? false : Boolean(isPublished),
      isFeatured: isFeatured === 'true' || isFeatured === true ? true : Boolean(isFeatured),
      order: Number.isFinite(+order) ? +order : 0,
      isActive: isActive === 'false' || isActive === false ? false : Boolean(isActive),
    });

    // Tạo lessons nếu có
    if (lessonsJson) {
      let lessons = [];
      try {
        lessons = typeof lessonsJson === 'string' ? JSON.parse(lessonsJson) : lessonsJson;
      } catch {
        return res.status(400).json({ error: 'Lessons không đúng định dạng JSON.' });
      }
      if (Array.isArray(lessons) && lessons.length > 0) {
        const docs = lessons
          .map((l, i) => {
            const ytId = extractYoutubeId(l.youtubeUrl || l.youtubeId);
            if (!ytId) return null;
            return {
              courseId: course._id,
              title: String(l.title || `Bài ${i + 1}`).slice(0, 200),
              youtubeId: ytId,
              order: Number.isFinite(+l.order) ? +l.order : i,
              durationSeconds: Math.max(0, Number(l.durationSeconds) || 0),
            };
          })
          .filter(Boolean);
        if (docs.length > 0) {
          await Lesson.insertMany(docs);
          await Course.findByIdAndUpdate(course._id, { lessonsCount: docs.length });
        }
      }
    }

    const populated = await Course.findById(course._id)
      .populate('category', 'name slug color')
      .lean();
    res.status(201).json({ course: populated });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    console.error('createCourse error', err);
    res.status(500).json({ error: 'Tạo khóa học thất bại.' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy.' });

    const {
      title,
      description,
      thumbnail: thumbnailInput,
      category,
      rating,
      durationMinutes,
      isPublished,
      isFeatured,
      order,
      isActive,
    } = req.body;

    if (typeof title === 'string' && title.trim()) {
      course.title = title.trim().slice(0, 200);
      const newSlug = slugify(title);
      if (newSlug && newSlug !== course.slug) {
        course.slug = await ensureUniqueSlug(newSlug, course._id);
      }
    }
    if (typeof description === 'string') course.description = description.slice(0, 2000);
    if (category !== undefined) course.category = category || null;
    if (rating !== undefined && rating !== '') {
      course.rating = Math.max(0, Math.min(5, Number(rating) || 0));
    }
    if (durationMinutes !== undefined && durationMinutes !== '') {
      course.durationMinutes = Math.max(0, Number(durationMinutes) || 0);
    }
    if (isPublished !== undefined) {
      course.isPublished = isPublished === 'false' || isPublished === false ? false : Boolean(isPublished);
    }
    if (isFeatured !== undefined) {
      course.isFeatured = isFeatured === 'true' || isFeatured === true ? true : Boolean(isFeatured);
    }
    if (order !== undefined && Number.isFinite(+order)) course.order = +order;
    if (isActive !== undefined) {
      course.isActive = isActive === 'false' || isActive === false ? false : Boolean(isActive);
    }

    if (req.file) {
      const oldName = filenameFromUrl(course.thumbnail);
      if (oldName) safeUnlink(absFromFilename(oldName));
      course.thumbnail = publicUrlFor(req.file.filename);
    } else if (typeof thumbnailInput === 'string' && thumbnailInput) {
      course.thumbnail = thumbnailInput.slice(0, 1000);
    }

    await course.save();
    const populated = await Course.findById(course._id)
      .populate('category', 'name slug color')
      .lean();
    res.json({ course: populated });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy.' });

    const progressCount = await UserProgress.countDocuments({ courseId: course._id });
    if (progressCount > 0) {
      return res.status(409).json({
        error: `Có ${progressCount} user đang học khóa học này. Vui lòng ẩn (isActive=false) thay vì xoá để giữ lịch sử.`,
        blockedBy: 'progress',
        count: progressCount,
      });
    }

    const oldName = filenameFromUrl(course.thumbnail);
    if (oldName) safeUnlink(absFromFilename(oldName));
    await Lesson.deleteMany({ courseId: course._id });
    await CourseComment.deleteMany({ courseId: course._id });
    await Favorite.deleteMany({ courseId: course._id });
    await course.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderCourses = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Course.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    const list = await Course.find()
      .populate('category', 'name slug color')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};

export const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file.' });
    const course = await Course.findById(req.params.id);
    if (!course) {
      safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Không tìm thấy.' });
    }
    const oldName = filenameFromUrl(course.thumbnail);
    if (oldName) safeUnlink(absFromFilename(oldName));
    course.thumbnail = publicUrlFor(req.file.filename);
    await course.save();
    res.json({ course });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Upload thất bại.' });
  }
};

void fs;