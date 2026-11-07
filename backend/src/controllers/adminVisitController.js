import Visit from '../models/Visit.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

/**
 * Thống kê lượt truy cập cho admin.
 * Một lần gọi trả về toàn bộ dữ liệu cho các biểu đồ.
 */

const GRANULARITIES = {
  day: { format: '%Y-%m-%d', days: 30 },
  month: { format: '%Y-%m', months: 12 },
  year: { format: '%Y', years: 3 },
};

const pad = (n) => String(n).padStart(2, '0');

/** Chuẩn hoá ngày về 00:00:00 UTC của ngày đó. */
const startOfUtcDay = (d) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Cuối ngày (23:59:59.999 UTC). */
const endOfUtcDay = (d) =>
  new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999)
  );

/** Sinh danh sách kỳ liên tục từ `from` đến `to` (theo granularity). */
const buildPeriods = (from, to, granularity) => {
  const periods = [];
  const cursor = new Date(from.getTime());

  if (granularity === 'day') {
    while (cursor <= to) {
      periods.push(
        `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`
      );
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return periods;
  }

  if (granularity === 'month') {
    cursor.setUTCDate(1);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor <= to) {
      periods.push(`${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}`);
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return periods;
  }

  cursor.setUTCMonth(0, 1);
  cursor.setUTCHours(0, 0, 0, 0);
  while (cursor <= to) {
    periods.push(String(cursor.getUTCFullYear()));
    cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
  }
  return periods;
};

/** Điền các kỳ bị thiếu bằng 0 để biểu đồ liền mạch. */
const fillPeriods = (periods, rows, valueKeys = ['count']) => {
  const map = new Map(rows.map((r) => [r.period, r]));
  return periods.map((p) => {
    const row = map.get(p);
    const out = { period: p };
    valueKeys.forEach((vk) => {
      out[vk] = row ? Number(row[vk]) || 0 : 0;
    });
    return out;
  });
};

const parseDateInput = (value, fallback) => {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

/**
 * Tính khoảng thời gian mặc định theo granularity.
 * Trả về { from, to, periods } — to là CUỐI ngày để không mất dữ liệu hôm nay.
 */
const resolveRange = (granularity, fromInput, toInput) => {
  const conf = GRANULARITIES[granularity];
  const now = new Date();

  const defaultTo = endOfUtcDay(now);
  const defaultFrom = startOfUtcDay(now);
  if (conf.days > 0) {
    // Lùi về (days - 1) ngày trước để tổng số kỳ = days
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - (conf.days - 1));
  }
  if (conf.months > 0) {
    // Set ngày về 1 TRƯỚC khi lùi tháng để tránh tràn ngày (vd 31/07 → tháng không có 31 ngày)
    defaultFrom.setUTCDate(1);
    defaultFrom.setUTCMonth(defaultFrom.getUTCMonth() - (conf.months - 1));
  }
  if (conf.years > 0) {
    defaultFrom.setUTCDate(1);
    defaultFrom.setUTCMonth(0, 1);
    defaultFrom.setUTCFullYear(defaultFrom.getUTCFullYear() - (conf.years - 1));
  }

  const from = startOfUtcDay(parseDateInput(fromInput, defaultFrom));
  const to = endOfUtcDay(parseDateInput(toInput, defaultTo));

  return { from, to, periods: buildPeriods(from, to, granularity) };
};

export const getVisitStats = async (req, res) => {
  try {
    const granularity = GRANULARITIES[req.query.granularity]
      ? req.query.granularity
      : 'day';
    const conf = GRANULARITIES[granularity];

    const { from, to, periods } = resolveRange(
      granularity,
      req.query.from,
      req.query.to
    );
    const range = { $gte: from, $lte: to };

    // ─── Lượt truy cập theo kỳ (tổng lượt xem) ───
    const viewsByPeriodRaw = await Visit.aggregate([
      { $match: { visitedAt: range } },
      {
        $group: {
          _id: { $dateToString: { format: conf.format, date: '$visitedAt' } },
          views: { $sum: 1 },
        },
      },
      { $project: { _id: 0, period: '$_id', views: 1 } },
    ]);

    // ─── Người dùng duy nhất theo kỳ (bỏ qua sessionId rỗng) ───
    const uniqueByPeriodRaw = await Visit.aggregate([
      { $match: { visitedAt: range, sessionId: { $nin: ['', null] } } },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: conf.format, date: '$visitedAt' } },
            sid: '$sessionId',
          },
        },
      },
      {
        $group: {
          _id: '$_id.period',
          uniqueVisitors: { $sum: 1 },
        },
      },
      { $project: { _id: 0, period: '$_id', uniqueVisitors: 1 } },
    ]);

    const visitsByPeriod = fillPeriods(periods, viewsByPeriodRaw, ['views']).map(
      (row) => {
        const u = uniqueByPeriodRaw.find((r) => r.period === row.period);
        return { ...row, uniqueVisitors: u ? Number(u.uniqueVisitors) || 0 : 0 };
      }
    );

    // ─── Người đăng ký mới theo kỳ ───
    const usersByPeriodRaw = await User.aggregate([
      { $match: { createdAt: range } },
      {
        $group: {
          _id: { $dateToString: { format: conf.format, date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, period: '$_id', count: 1 } },
    ]);
    const usersByPeriod = fillPeriods(periods, usersByPeriodRaw, ['count']);

    // ─── Lượt xem khóa học theo kỳ ───
    const courseViewsByPeriodRaw = await Visit.aggregate([
      { $match: { visitedAt: range, pageType: 'course_detail' } },
      {
        $group: {
          _id: { $dateToString: { format: conf.format, date: '$visitedAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, period: '$_id', count: 1 } },
    ]);
    const courseViewsByPeriod = fillPeriods(
      periods,
      courseViewsByPeriodRaw,
      ['count']
    );

    // ─── Tổng quan ───
    const [totalsAgg, uniqueAgg] = await Promise.all([
      Visit.aggregate([
        { $match: { visitedAt: range } },
        {
          $group: {
            _id: null,
            views: { $sum: 1 },
            courseViews: {
              $sum: { $cond: [{ $eq: ['$pageType', 'course_detail'] }, 1, 0] },
            },
          },
        },
      ]),
      Visit.aggregate([
        { $match: { visitedAt: range, sessionId: { $nin: ['', null] } } },
        { $group: { _id: '$sessionId' } },
        { $count: 'total' },
      ]),
    ]);

    const totalsRow = totalsAgg[0] || {};
    const newUsers = usersByPeriodRaw.reduce(
      (acc, r) => acc + (Number(r.count) || 0),
      0
    );

    // ─── Top khóa học được xem nhiều nhất ───
    const topCoursesRaw = await Visit.aggregate([
      {
        $match: {
          visitedAt: range,
          pageType: 'course_detail',
          courseId: { $ne: null },
        },
      },
      { $group: { _id: '$courseId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    const courseIds = topCoursesRaw.map((r) => r._id);
    const courses = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } })
          .select('title slug thumbnail')
          .lean()
      : [];
    const courseMap = new Map(courses.map((c) => [String(c._id), c]));

    const topCourses = topCoursesRaw.map((r) => ({
      courseId: String(r._id),
      title: courseMap.get(String(r._id))?.title || '(Khóa học đã xoá)',
      slug: courseMap.get(String(r._id))?.slug || '',
      views: r.views,
    }));

    // ─── Top trang được xem nhiều nhất ───
    const byPathRaw = await Visit.aggregate([
      { $match: { visitedAt: range } },
      {
        $group: {
          _id: { path: '$path', pageType: '$pageType' },
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, path: '$_id.path', pageType: '$_id.pageType', views: 1 } },
    ]);

    // ─── Phân bổ theo loại trang ───
    const byPageTypeRaw = await Visit.aggregate([
      { $match: { visitedAt: range } },
      { $group: { _id: '$pageType', views: { $sum: 1 } } },
      { $project: { _id: 0, pageType: '$_id', views: 1 } },
    ]);

    res.json({
      granularity,
      range: { from: from.toISOString(), to: to.toISOString() },
      totals: {
        views: totalsRow.views || 0,
        uniqueVisitors: uniqueAgg[0]?.total || 0,
        newUsers,
        courseViews: totalsRow.courseViews || 0,
        topPage: byPathRaw[0]
          ? { path: byPathRaw[0].path, pageType: byPathRaw[0].pageType }
          : null,
      },
      visitsByPeriod,
      usersByPeriod,
      courseViewsByPeriod,
      topCourses,
      byPath: byPathRaw,
      byPageType: byPageTypeRaw,
    });
  } catch (err) {
    console.error('getVisitStats error', err);
    res.status(500).json({ error: 'Lấy thống kê truy cập thất bại.' });
  }
};

/**
 * Danh sách bản ghi truy cập gần đây (dùng cho bảng chi tiết).
 */
export const listRecentVisits = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const items = await Visit.find()
      .sort({ visitedAt: -1 })
      .limit(limit)
      .populate({ path: 'courseId', select: 'title slug' })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lấy danh sách truy cập thất bại.' });
  }
};
