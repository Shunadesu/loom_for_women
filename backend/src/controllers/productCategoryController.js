import ProductCategory from '../models/ProductCategory.js';

export const listActiveProductCategories = async (_req, res) => {
  try {
    const items = await ProductCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh mục sản phẩm.' });
  }
};