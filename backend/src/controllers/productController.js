import path from 'path';
import Product from '../models/Product.js';
import { safeUnlink, UPLOAD_PRODUCT_DIR } from '../middleware/upload.js';

const publicUrlFor = (filename) => {
  const base =
    process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3010}`;
  return `${base.replace(/\/$/, '')}/uploads/products/${filename}`;
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
  filename ? path.join(UPLOAD_PRODUCT_DIR, filename) : null;

/**
 * GET /api/products (public)
 * Query: status, category, q, sort, limit, skip
 * - status: 'all' | 'featured'
 */
export const listProducts = async (req, res) => {
  try {
    const {
      status = 'all',
      category,
      q,
      sort = 'newest',
      limit = 50,
      skip = 0,
      promo,
    } = req.query;

    const filter = { isActive: true, isPublished: true };

    if (category) filter.category = category;
    if (q) {
      const safe = String(q)
        .slice(0, 80)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }
    if (status === 'featured') filter.isFeatured = true;

    // Filter promo: chỉ lấy sản phẩm có giảm giá
    if (promo === 'true') {
      filter.originalPrice = { $gt: 0 };
      filter.$expr = { $gt: ['$originalPrice', '$price'] };
    }

    // sort
    let sortObj = { order: 1, createdAt: -1 };
    if (sort === 'priceAsc') sortObj = { price: 1 };
    else if (sort === 'priceDesc') sortObj = { price: -1 };
    else if (sort === 'popular') sortObj = { salesCount: -1, createdAt: -1 };
    else if (sort === 'discount') {
      // Sort theo discount % cao nhất (computed field)
      sortObj = { createdAt: -1 }; // Fallback, sẽ sort client-side sau
    }

    const items = await Product.find(filter)
      .populate('category', 'name slug icon color')
      .sort(sortObj)
      .skip(Number(skip) || 0)
      .limit(Math.min(Number(limit) || 50, 100))
      .lean({ virtuals: true });

    // Nếu sort by discount, tính toán và sort client-side
    if (sort === 'discount' && promo === 'true') {
      items.sort((a, b) => {
        const discA = a.discountPct || 0;
        const discB = b.discountPct || 0;
        return discB - discA;
      });
    }

    res.json({ items });
  } catch (err) {
    console.error('listProducts error', err);
    res.status(500).json({ error: 'Không lấy được danh sách sản phẩm.' });
  }
};

/**
 * GET /api/products/:slug (public)
 */
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
      isPublished: true,
    })
      .populate('category', 'name slug icon color')
      .lean({ virtuals: true });

    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    res.json({ product });
  } catch (err) {
    console.error('getProductBySlug error', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ─── Internal helpers dùng cho admin ──────────────────────
export { publicUrlFor, filenameFromUrl, absFromFilename };
void safeUnlink;