import Category from '../models/Category.js';

export const listActiveCategories = async (_req, res) => {
  try {
    const items = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh mục.' });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const cat = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};