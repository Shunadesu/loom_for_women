import Favorite from '../models/Favorite.js';

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
        select: 'title slug thumbnail category durationMinutes rating lessonsCount isActive',
        populate: { path: 'category', select: 'name slug color' },
      })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      items: favs
        .filter((f) => f.courseId && f.courseId.isActive)
        .map((f) => f.courseId),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};