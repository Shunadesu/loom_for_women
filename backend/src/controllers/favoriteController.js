import Favorite from '../models/Favorite.js';
import UserProgress from '../models/UserProgress.js';

export const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const fav = await Favorite.findOneAndUpdate(
      { userId: req.user._id, courseId: id },
      { userId: req.user._id, courseId: id },
      { upsert: true, new: true }
    );
    res.json({ ok: true, favorite: fav });
  } catch (err) {
    if (err?.code === 11000) return res.json({ ok: true });
    res.status(500).json({ error: 'Không thêm được yêu thích.' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await Favorite.deleteOne({ userId: req.user._id, courseId: id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Không xoá được yêu thích.' });
  }
};

export const myFavorites = async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'courseId',
        select:
          'title slug thumbnail coverUrl category durationMinutes rating lessonsCount isFeatured isActive',
      })
      .sort({ createdAt: -1 })
      .lean();

    const activeCourses = favs
      .filter((f) => f.courseId && f.courseId.isActive)
      .map((f) => f.courseId);

    // Gắn tiến trình học để CourseLearnedBadge / CourseProgressButton
    // hiển thị đúng trên trang yêu thích (giống GET /api/courses).
    const progresses = await UserProgress.find({
      userId: req.user._id,
      courseId: { $in: activeCourses.map((c) => c._id) },
    }).lean();
    const progressMap = {};
    for (const p of progresses) {
      progressMap[String(p.courseId)] = p;
    }

    res.json({
      items: activeCourses.map((c) => {
        const p = progressMap[String(c._id)];
        return {
          ...c,
          progressPct: p?.progressPct ?? 0,
          lastLessonId: p?.lastLessonId ? String(p.lastLessonId) : null,
          isFavorite: true,
        };
      }),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};