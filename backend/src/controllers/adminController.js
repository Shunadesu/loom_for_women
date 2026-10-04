import User from '../models/User.js';
import PopupEvent from '../models/PopupEvent.js';
import Config, { CONFIG_ID } from '../models/Config.js';

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
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'ID không hợp lệ.' });
    res.status(500).json({ error: 'Lấy user thất bại.' });
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