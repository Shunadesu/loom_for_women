import path from 'path';
import HeroBanner from '../models/HeroBanner.js';
import { safeUnlink, UPLOAD_HERO_DIR } from '../middleware/upload.js';

/** Trả về relative path thay vì full URL để tránh CORS */
const publicUrlFor = (filename) => {
  return `/uploads/heroes/${filename}`;
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
  filename ? path.join(UPLOAD_HERO_DIR, filename) : null;

// ───────────────────────────────────────────────────────────────
// Public
// ───────────────────────────────────────────────────────────────
export const listActiveHeroes = async (_req, res) => {
  try {
    const items = await HeroBanner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh sách hero.' });
  }
};

// ───────────────────────────────────────────────────────────────
// Admin
// ───────────────────────────────────────────────────────────────
export const listAllHeroes = async (_req, res) => {
  try {
    const items = await HeroBanner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh sách hero.' });
  }
};

export const createHero = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Thiếu file ảnh (field "image").' });
    }
    const { alt = '', link = '', order = 0, isActive = true } = req.body;
    const hero = await HeroBanner.create({
      imageUrl: publicUrlFor(req.file.filename),
      alt: String(alt).slice(0, 200),
      link: String(link).slice(0, 500),
      order: Number.isFinite(+order) ? +order : 0,
      isActive: isActive === 'false' ? false : Boolean(isActive),
    });
    res.status(201).json({ hero });
  } catch (err) {
    // Nếu lỗi validate → xoá luôn file vừa upload
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Tạo hero thất bại.' });
  }
};

export const updateHero = async (req, res) => {
  try {
    const hero = await HeroBanner.findById(req.params.id);
    if (!hero) return res.status(404).json({ error: 'Không tìm thấy hero.' });

    const { alt, link, order, isActive } = req.body;
    if (typeof alt === 'string') hero.alt = alt.slice(0, 200);
    if (typeof link === 'string') hero.link = link.slice(0, 500);
    if (order !== undefined && Number.isFinite(+order)) hero.order = +order;
    if (isActive !== undefined) {
      hero.isActive = isActive === 'false' || isActive === false ? false : Boolean(isActive);
    }

    // Nếu upload ảnh mới → xoá ảnh cũ (nếu local) rồi thay
    if (req.file) {
      const oldName = filenameFromUrl(hero.imageUrl);
      if (oldName) safeUnlink(absFromFilename(oldName));
      hero.imageUrl = publicUrlFor(req.file.filename);
    }

    await hero.save();
    res.json({ hero });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    if (err.name === 'CastError') return res.status(400).json({ error: 'ID không hợp lệ.' });
    res.status(500).json({ error: 'Cập nhật hero thất bại.' });
  }
};

export const deleteHero = async (req, res) => {
  try {
    const hero = await HeroBanner.findById(req.params.id);
    if (!hero) return res.status(404).json({ error: 'Không tìm thấy hero.' });
    const oldName = filenameFromUrl(hero.imageUrl);
    if (oldName) safeUnlink(absFromFilename(oldName));
    await hero.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'ID không hợp lệ.' });
    res.status(500).json({ error: 'Xoá hero thất bại.' });
  }
};

/**
 * Reorder: body = [{ id, order }, ...]
 */
export const reorderHeroes = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        HeroBanner.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    const list = await HeroBanner.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};