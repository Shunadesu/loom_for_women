import mongoose from 'mongoose';
import Visit, { VISIT_PAGE_TYPES } from '../models/Visit.js';

/** Suy ra loại thiết bị từ User-Agent. */
const detectDevice = (ua = '') => {
  const s = String(ua).toLowerCase();
  if (!s) return '';
  if (/ipad|tablet|playbook|silk|kindle/.test(s)) return 'tablet';
  if (/mobi|iphone|android|windows phone|blackberry|opera mini/.test(s)) {
    return 'mobile';
  }
  return 'desktop';
};

const toOid = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

/**
 * POST /api/visits — ghi nhận 1 lượt xem trang.
 * Fire-and-forget: lỗi không được làm sập luồng frontend.
 */
export const trackVisit = async (req, res) => {
  try {
    const {
      path: rawPath,
      pageType: rawPageType,
      courseId: rawCourseId,
      sessionId: rawSessionId,
      referrer: rawReferrer,
    } = req.body || {};

    const path = String(rawPath || '').trim();
    if (!path) {
      return res.status(400).json({ error: 'Thiếu đường dẫn trang.' });
    }
    if (path.length > 300) {
      return res.status(400).json({ error: 'Đường dẫn quá dài.' });
    }

    const pageType = VISIT_PAGE_TYPES.includes(rawPageType)
      ? rawPageType
      : 'other';

    // Chỉ nhận courseId khi xem trang chi tiết khóa học
    let courseId = null;
    if (pageType === 'course_detail' && rawCourseId) {
      courseId = toOid(rawCourseId);
    }

    await Visit.create({
      path,
      pageType,
      courseId,
      userId: req.user?._id || null,
      sessionId: String(rawSessionId || '').trim().slice(0, 100),
      referrer: String(rawReferrer || '').trim().slice(0, 500),
      device: detectDevice(req.headers['user-agent']),
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    // Tracking là fire-and-forget — nuốt lỗi, log nhẹ
    console.error('trackVisit error', err.message);
    res.status(201).json({ ok: true });
  }
};
