import Category from '../models/Category.js';
import Course from '../models/Course.js';
import { slugify } from '../utils/slugify.js';

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base || `category-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Category.findOne({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

export const listAllCategories = async (_req, res) => {
  try {
    const items = await Category.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh mục.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, color = '#E60067', order = 0, isActive = true } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Thiếu tên danh mục.' });
    }
    const slug = await ensureUniqueSlug(slugify(name));
    const cat = await Category.create({
      name: String(name).trim().slice(0, 80),
      slug,
      color,
      order: Number.isFinite(+order) ? +order : 0,
      isActive: isActive === 'false' || isActive === false ? false : Boolean(isActive),
    });
    res.status(201).json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: 'Tạo danh mục thất bại.' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy.' });

    const { name, color, order, isActive } = req.body;
    if (typeof name === 'string' && name.trim()) {
      cat.name = name.trim().slice(0, 80);
      if (name.trim() !== cat.name) {
        cat.slug = await ensureUniqueSlug(slugify(name), cat._id);
      }
    }
    if (typeof color === 'string' && color) cat.color = color;
    if (order !== undefined && Number.isFinite(+order)) cat.order = +order;
    if (isActive !== undefined) {
      cat.isActive = isActive === 'false' || isActive === false ? false : Boolean(isActive);
    }
    await cat.save();
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy.' });
    const courseCount = await Course.countDocuments({ category: cat._id });
    if (courseCount > 0) {
      return res.status(409).json({
        error: `Có ${courseCount} khóa học đang dùng danh mục này. Vui lòng chuyển sang danh mục khác trước.`,
      });
    }
    await cat.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderCategories = async (_req, res) => {
  try {
    const items = Array.isArray(_req.body?.items) ? _req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Category.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    const list = await Category.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};