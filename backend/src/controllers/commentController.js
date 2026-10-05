import mongoose from 'mongoose';
import CourseComment from '../models/CourseComment.js';
import Course from '../models/Course.js';
import { awardPoints, POINT_RULES } from '../utils/points.js';

const recomputeRating = async (courseId) => {
  const stats = await CourseComment.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId), rating: { $ne: null }, isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const rating = stats[0]?.avg ?? 0;
  const ratingCount = stats[0]?.count ?? 0;
  await Course.findByIdAndUpdate(courseId, {
    rating: Math.round(rating * 10) / 10,
    ratingCount,
  });
};

export const listComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Course ID không hợp lệ.' });
    }
    const comments = await CourseComment.find({ courseId: id, isHidden: false })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: comments });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { courseId, content, rating, parentId = null } = req.body;
    if (!courseId || !content) {
      return res.status(400).json({ error: 'Thiếu nội dung hoặc courseId.' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Course ID không hợp lệ.' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course || !course.isActive) {
      return res.status(404).json({ error: 'Khóa học không tồn tại.' });
    }

    const trimmed = String(content).trim().slice(0, 1000);
    if (!trimmed) return res.status(400).json({ error: 'Nội dung rỗng.' });

    // Rating chỉ áp dụng cho comment cấp 1
    let ratingValue = null;
    if (!parentId && rating !== undefined && rating !== null && rating !== '') {
      const n = Number(rating);
      if (Number.isFinite(n) && n >= 1 && n <= 5) {
        ratingValue = Math.round(n);
      }
    }

    const comment = await CourseComment.create({
      userId: req.user._id,
      courseId,
      content: trimmed,
      rating: ratingValue,
      parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
    });

    // Cộng điểm (chỉ 1 lần cho comment gốc)
    if (!comment.parentId) {
      await awardPoints({
        userId: req.user._id,
        delta: POINT_RULES.COMMENT,
        type: 'comment',
        refId: String(comment._id),
        description: `Bình luận khóa học: ${course.title}`,
      });
    }

    // Recompute rating trung bình
    await recomputeRating(courseId);

    const populated = await CourseComment.findById(comment._id)
      .populate('userId', 'name phone')
      .lean();
    res.status(201).json({ comment: populated });
  } catch (err) {
    console.error('createComment error', err);
    res.status(500).json({ error: 'Không gửi được bình luận.' });
  }
};

export const hideComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await CourseComment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Không tìm thấy.' });
    comment.isHidden = !comment.isHidden;
    await comment.save();
    await recomputeRating(comment.courseId);
    res.json({ ok: true, isHidden: comment.isHidden });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};