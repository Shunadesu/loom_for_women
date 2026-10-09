import User from '../models/User.js';
import PopupEvent from '../models/PopupEvent.js';
import Config, { CONFIG_ID } from '../models/Config.js';
import UserProgress from '../models/UserProgress.js';
import Certificate from '../models/Certificate.js';
import Favorite from '../models/Favorite.js';
import Order from '../models/Order.js';
import CourseComment from '../models/CourseComment.js';
import PointTransaction from '../models/PointTransaction.js';
import { getUserPoints, computeTierFromPoints } from '../utils/points.js';
import mongoose from 'mongoose';

const toOid = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

export const listUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ phone: re }, { name: re }];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      items: items.map((u) => u.toSafeJSON()),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lấy danh sách users thất bại.' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user.' });

    const oid = toOid(req.params.id);

    // Chạy song song các aggregate để lấy tổng quan hoạt động.
    const [
      pointsTotal,
      progressRaw,
      certificatesCount,
      favoritesCount,
      ordersCount,
      commentsCount,
      recentTransactions,
    ] = await Promise.all([
      getUserPoints(oid),
      UserProgress.find({ userId: oid })
        .sort({ lastWatchedAt: -1, updatedAt: -1 })
        .limit(50)
        .populate({ path: 'courseId', select: 'title thumbnail slug' })
        .lean(),
      Certificate.countDocuments({ userId: oid }),
      Favorite.countDocuments({ userId: oid }),
      Order.countDocuments({ sellerUserId: oid }),
      CourseComment.countDocuments({ userId: oid }),
      PointTransaction.find({ userId: oid })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const coursesInProgress = progressRaw.filter(
      (p) => p.progressPct > 0 && p.progressPct < 100
    ).length;
    const coursesCompleted = progressRaw.filter((p) => p.progressPct >= 100).length;

    const summary = {
      points: pointsTotal,
      tier: computeTierFromPoints(pointsTotal),
      coursesInProgress,
      coursesCompleted,
      certificatesCount,
      favoritesCount,
      ordersCount,
      commentsCount,
      progress: progressRaw.map((p) => ({
        courseId: p.courseId?._id || null,
        course: p.courseId
          ? {
              title: p.courseId.title || '',
              thumbnail: p.courseId.thumbnail || '',
              slug: p.courseId.slug || '',
            }
          : null,
        progressPct: p.progressPct || 0,
        lastWatchedAt: p.lastWatchedAt || null,
        completedLessons: Array.isArray(p.completedLessons)
          ? p.completedLessons.length
          : 0,
        updatedAt: p.updatedAt || null,
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        _id: tx._id,
        delta: tx.delta,
        type: tx.type,
        description: tx.description || '',
        createdAt: tx.createdAt,
      })),
    };

    res.json({ user: user.toSafeJSON(), summary });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'ID không hợp lệ.' });
    res.status(500).json({ error: 'Lấy user thất bại.' });
  }
};

/**
 * Danh sách users kèm tóm tắt hoạt động (điểm, tier, số khóa đang học/hoàn thành, chứng chỉ).
 * Dùng cho bảng UserManager — gom aggregate vào 1 round-trip để tránh N+1.
 */
export const listUsersSummary = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const isActiveParam = req.query.isActive;

    const filter = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ phone: re }, { name: re }];
    }
    if (role && ['user', 'admin'].includes(role)) filter.role = role;
    if (isActiveParam === 'true') filter.isActive = true;
    if (isActiveParam === 'false') filter.isActive = false;

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = items.map((u) => u._id);

    // Aggregate song song cho cả page.
    const [pointsAgg, progressAgg, certAgg] = await Promise.all([
      ids.length
        ? PointTransaction.aggregate([
            { $match: { userId: { $in: ids } } },
            {
              $group: {
                _id: '$userId',
                totalPoints: { $sum: '$delta' },
              },
            },
          ])
        : Promise.resolve([]),
      ids.length
        ? UserProgress.aggregate([
            { $match: { userId: { $in: ids } } },
            {
              $group: {
                _id: '$userId',
                coursesInProgress: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gt: ['$progressPct', 0] },
                          { $lt: ['$progressPct', 100] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                coursesCompleted: {
                  $sum: { $cond: [{ $gte: ['$progressPct', 100] }, 1, 0] },
                },
              },
            },
          ])
        : Promise.resolve([]),
      ids.length
        ? Certificate.aggregate([
            { $match: { userId: { $in: ids } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
    ]);

    const pointsMap = new Map(pointsAgg.map((r) => [String(r._id), r.totalPoints]));
    const progressMap = new Map(
      progressAgg.map((r) => [
        String(r._id),
        {
          coursesInProgress: r.coursesInProgress || 0,
          coursesCompleted: r.coursesCompleted || 0,
        },
      ])
    );
    const certMap = new Map(certAgg.map((r) => [String(r._id), r.count]));

    const enriched = items.map((u) => {
      const points = pointsMap.get(String(u._id)) || 0;
      const prog = progressMap.get(String(u._id)) || {
        coursesInProgress: 0,
        coursesCompleted: 0,
      };
      const certs = certMap.get(String(u._id)) || 0;
      return {
        ...u,
        summary: {
          points,
          tier: computeTierFromPoints(points),
          ...prog,
          certificatesCount: certs,
        },
      };
    });

    res.json({
      items: enriched,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lấy danh sách users (summary) thất bại.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Không thể xoá chính mình.' });
    }
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ error: 'Không tìm thấy user.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá user thất bại.' });
  }
};

export const getStats = async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersLast7d = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const eventsByType = await PopupEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const eventsLast7d = await PopupEvent.aggregate([
      { $match: { occurredAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const funnelAgg = await PopupEvent.aggregate([
      {
        $group: {
          _id: '$eventType',
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          eventType: '$_id',
          uniqueCount: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast7d: newUsersLast7d,
      },
      events: {
        totalByType: eventsByType,
        last7d: eventsLast7d,
        funnelBySessions: funnelAgg,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Lấy thống kê thất bại.' });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const updates = req.body || {};
    const allowed = [
      'welcomeTitle',
      'welcomeDesc',
      'welcomeBtn',
      'registerTitle',
      'registerSubtitle',
      'registerBtn',
      'loginBtn',
      'laterBtn',
      'themeColor',
      'primaryShade',
    ];
    const patch = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) patch[key] = updates[key];
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Không có field hợp lệ để cập nhật.' });
    }
    const config = await Config.findByIdAndUpdate(
      CONFIG_ID,
      { $set: patch },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật config thất bại.' });
  }
};