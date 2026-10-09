import path from 'path';
import Product from '../models/Product.js';
import CartItem from '../models/CartItem.js';
import { safeUnlink, UPLOAD_PRODUCT_DIR } from '../middleware/upload.js';
import { slugify } from '../utils/slugify.js';

const publicUrlFor = (filename) => {
  const base = process.env.PUBLIC_BASE_URL || 'https://sunnydemo.site';
  return `${base}/uploads/products/${filename}`;
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

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base || `product-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.findOne({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

// ─── Admin ───────────────────────────────────────────────────
export const listAllProducts = async (_req, res) => {
  try {
    const items = await Product.find()
      .populate('category', 'name slug icon color')
      .sort({ order: 1, createdAt: -1 })
      .lean({ virtuals: true });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description = '',
      thumbnail: thumbnailInput = '',
      images = '',
      category = null,
      price,
      originalPrice,
      stock = 0,
      sellerName = '',
      sellerZaloUrl = '',
      rating = 0,
      isPublished = true,
      isFeatured = false,
      order = 0,
      isActive = true,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Thiếu tiêu đề.' });
    if (price === undefined || price === '' || Number(price) < 0) {
      return res.status(400).json({ error: 'Thiếu giá bán hợp lệ.' });
    }

    let thumbnail = thumbnailInput;
    if (req.file) {
      thumbnail = publicUrlFor(req.file.filename);
    }
    if (!thumbnail) {
      return res.status(400).json({
        error: 'Thiếu ảnh thumbnail (upload hoặc URL).',
      });
    }

    // images: JSON-string mảng URL, hoặc string đơn, hoặc []
    let imagesArr = [];
    if (typeof images === 'string' && images.trim()) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) imagesArr = parsed.map(String);
      } catch {
        // Nếu là URL đơn, nhét vào mảng
        if (images.trim().startsWith('http')) imagesArr = [images.trim()];
      }
    } else if (Array.isArray(images)) {
      imagesArr = images.map(String);
    }

    const finalPrice = Math.max(0, Number(price) || 0);
    const finalOriginal =
      originalPrice === '' || originalPrice === undefined || originalPrice === null
        ? finalPrice
        : Math.max(0, Number(originalPrice) || 0);

    const slug = await ensureUniqueSlug(slugify(title));
    const product = await Product.create({
      title: String(title).trim().slice(0, 200),
      slug,
      description: String(description).slice(0, 2000),
      thumbnail: String(thumbnail).slice(0, 1000),
      images: imagesArr,
      category: category || null,
      price: finalPrice,
      originalPrice: finalOriginal,
      stock: Math.max(0, Number(stock) || 0),
      sellerName: String(sellerName).slice(0, 100),
      sellerZaloUrl: String(sellerZaloUrl).slice(0, 500),
      rating: Math.max(0, Math.min(5, Number(rating) || 0)),
      isPublished:
        isPublished === 'false' || isPublished === false
          ? false
          : Boolean(isPublished),
      isFeatured:
        isFeatured === 'true' || isFeatured === true
          ? true
          : Boolean(isFeatured),
      order: Number.isFinite(+order) ? +order : 0,
      isActive:
        isActive === 'false' || isActive === false ? false : Boolean(isActive),
    });

    const populated = await Product.findById(product._id)
      .populate('category', 'name slug icon color')
      .lean({ virtuals: true });
    res.status(201).json({ product: populated });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    console.error('createProduct error', err);
    res.status(500).json({ error: 'Tạo sản phẩm thất bại.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy.' });

    const {
      title,
      description,
      thumbnail: thumbnailInput,
      images,
      category,
      price,
      originalPrice,
      stock,
      sellerName,
      sellerZaloUrl,
      rating,
      isPublished,
      isFeatured,
      order,
      isActive,
    } = req.body;

    if (typeof title === 'string' && title.trim()) {
      product.title = title.trim().slice(0, 200);
      const newSlug = slugify(title);
      if (newSlug && newSlug !== product.slug) {
        product.slug = await ensureUniqueSlug(newSlug, product._id);
      }
    }
    if (typeof description === 'string')
      product.description = description.slice(0, 2000);
    if (category !== undefined) product.category = category || null;
    if (price !== undefined && price !== '') {
      product.price = Math.max(0, Number(price) || 0);
    }
    if (originalPrice !== undefined && originalPrice !== '') {
      product.originalPrice = Math.max(0, Number(originalPrice) || 0);
    }
    if (stock !== undefined && stock !== '') {
      product.stock = Math.max(0, Number(stock) || 0);
    }
    if (typeof sellerName === 'string')
      product.sellerName = sellerName.slice(0, 100);
    if (typeof sellerZaloUrl === 'string')
      product.sellerZaloUrl = sellerZaloUrl.slice(0, 500);
    if (rating !== undefined && rating !== '') {
      product.rating = Math.max(0, Math.min(5, Number(rating) || 0));
    }
    if (isPublished !== undefined) {
      product.isPublished =
        isPublished === 'false' || isPublished === false
          ? false
          : Boolean(isPublished);
    }
    if (isFeatured !== undefined) {
      product.isFeatured =
        isFeatured === 'true' || isFeatured === true
          ? true
          : Boolean(isFeatured);
    }
    if (order !== undefined && Number.isFinite(+order)) product.order = +order;
    if (isActive !== undefined) {
      product.isActive =
        isActive === 'false' || isActive === false ? false : Boolean(isActive);
    }

    if (typeof images === 'string' && images.trim()) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) product.images = parsed.map(String);
      } catch {
        if (images.trim().startsWith('http'))
          product.images = [images.trim()];
      }
    }

    if (req.file) {
      const oldName = filenameFromUrl(product.thumbnail);
      if (oldName) safeUnlink(absFromFilename(oldName));
      product.thumbnail = publicUrlFor(req.file.filename);
    } else if (typeof thumbnailInput === 'string' && thumbnailInput) {
      product.thumbnail = thumbnailInput.slice(0, 1000);
    }

    await product.save();
    const populated = await Product.findById(product._id)
      .populate('category', 'name slug icon color')
      .lean({ virtuals: true });
    res.json({ product: populated });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy.' });

    const cartCount = await CartItem.countDocuments({ productId: product._id });
    if (cartCount > 0) {
      return res.status(409).json({
        error: `Có ${cartCount} giỏ hàng đang chứa sản phẩm này. Vui lòng ẩn (isActive=false) thay vì xoá để giữ lịch sử.`,
        blockedBy: 'cart',
        count: cartCount,
      });
    }

    const oldName = filenameFromUrl(product.thumbnail);
    if (oldName) safeUnlink(absFromFilename(oldName));
    await product.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderProducts = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Product.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    const list = await Product.find()
      .populate('category', 'name slug icon color')
      .sort({ order: 1, createdAt: -1 })
      .lean({ virtuals: true });
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};

export const uploadProductThumbnail = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file.' });
    const product = await Product.findById(req.params.id);
    if (!product) {
      safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Không tìm thấy.' });
    }
    const oldName = filenameFromUrl(product.thumbnail);
    if (oldName) safeUnlink(absFromFilename(oldName));
    product.thumbnail = publicUrlFor(req.file.filename);
    await product.save();
    res.json({ product });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Upload thất bại.' });
  }
};