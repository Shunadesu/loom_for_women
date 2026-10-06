import ProductCategory from '../models/ProductCategory.js';
import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base || `product-category-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (
    await ProductCategory.findOne({ slug, _id: { $ne: excludeId } })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

export const listAllProductCategories = async (_req, res) => {
  try {
    const items = await ProductCategory.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được danh mục sản phẩm.' });
  }
};

export const createProductCategory = async (req, res) => {
  try {
    const { name, icon = '🛍️', color = '#E60067', order = 0, isActive = true } =
      req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Thiếu tên danh mục.' });
    }
    const slug = await ensureUniqueSlug(slugify(name));
    const cat = await ProductCategory.create({
      name: String(name).trim().slice(0, 80),
      slug,
      icon: String(icon).slice(0, 8),
      color,
      order: Number.isFinite(+order) ? +order : 0,
      isActive:
        isActive === 'false' || isActive === false ? false : Boolean(isActive),
    });
    res.status(201).json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: 'Tạo danh mục sản phẩm thất bại.' });
  }
};

export const updateProductCategory = async (req, res) => {
  try {
    const cat = await ProductCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy.' });

    const { name, icon, color, order, isActive } = req.body;
    if (typeof name === 'string' && name.trim()) {
      const newName = name.trim().slice(0, 80);
      cat.name = newName;
      const newSlug = slugify(newName);
      if (newSlug && newSlug !== cat.slug) {
        cat.slug = await ensureUniqueSlug(newSlug, cat._id);
      }
    }
    if (typeof icon === 'string' && icon) cat.icon = icon.slice(0, 8);
    if (typeof color === 'string' && color) cat.color = color;
    if (order !== undefined && Number.isFinite(+order)) cat.order = +order;
    if (isActive !== undefined) {
      cat.isActive =
        isActive === 'false' || isActive === false ? false : Boolean(isActive);
    }
    await cat.save();
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteProductCategory = async (req, res) => {
  try {
    const cat = await ProductCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy.' });
    const productCount = await Product.countDocuments({ category: cat._id });
    if (productCount > 0) {
      return res.status(409).json({
        error: `Có ${productCount} sản phẩm đang dùng danh mục này. Vui lòng chuyển sang danh mục khác trước.`,
      });
    }
    await cat.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderProductCategories = async (_req, res) => {
  try {
    const items = Array.isArray(_req.body?.items) ? _req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        ProductCategory.findByIdAndUpdate(id, { order: +order || 0 }).catch(
          () => null
        )
      )
    );
    const list = await ProductCategory.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};