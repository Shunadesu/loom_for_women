import mongoose from 'mongoose';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

/**
 * POST /api/cart  { productId, quantity? }
 * - Nếu đã có: tăng quantity
 * - Nếu chưa: tạo mới
 * - Validate: product tồn tại, isActive=true, isPublished=true, stock > 0
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'productId không hợp lệ.' });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      isPublished: true,
    }).lean();
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
    }
    if ((product.stock || 0) <= 0) {
      return res.status(400).json({ error: 'Sản phẩm đã hết hàng.' });
    }

    // Upsert: tăng quantity nếu đã có
    const item = await CartItem.findOneAndUpdate(
      { userId: req.user._id, productId: product._id },
      { $inc: { quantity: qty }, $setOnInsert: { userId: req.user._id, productId: product._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Đảm bảo không vượt quá stock
    if (item.quantity > product.stock) {
      item.quantity = product.stock;
      await item.save();
    }

    res.status(201).json({ item });
  } catch (err) {
    console.error('addToCart error', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Sản phẩm đã có trong giỏ.' });
    }
    res.status(500).json({ error: 'Thêm vào giỏ thất bại.' });
  }
};

/**
 * GET /api/cart
 * Trả về { items: [CartItem với product populated], total, count }
 */
export const getCart = async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.user._id })
      .populate('productId', 'title slug thumbnail price originalPrice stock isActive isPublished')
      .sort({ createdAt: -1 })
      .lean();

    // Filter ra sản phẩm đã bị ẩn
    const validItems = items.filter(
      (it) => it.productId && it.productId.isActive && it.productId.isPublished
    );

    let total = 0;
    let count = 0;
    for (const it of validItems) {
      total += it.quantity * (it.productId.price || 0);
      count += it.quantity;
    }

    res.json({ items: validItems, total, count });
  } catch (err) {
    console.error('getCart error', err);
    res.status(500).json({ error: 'Không tải được giỏ hàng.' });
  }
};

/**
 * PATCH /api/cart/:itemId  { quantity }
 */
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));

    const item = await CartItem.findOne({
      _id: req.params.itemId,
      userId: req.user._id,
    });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy.' });

    if (qty === 0) {
      await item.deleteOne();
      return res.json({ ok: true, removed: true });
    }

    // Check stock
    const product = await Product.findById(item.productId).lean();
    if (product) {
      if (qty > product.stock) {
        return res.status(400).json({
          error: `Chỉ còn ${product.stock} sản phẩm trong kho.`,
        });
      }
    }

    item.quantity = qty;
    await item.save();

    const populated = await CartItem.findById(item._id)
      .populate('productId', 'title slug thumbnail price originalPrice stock')
      .lean();
    res.json({ item: populated });
  } catch (err) {
    console.error('updateCartItem error', err);
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

/**
 * DELETE /api/cart/:itemId
 */
export const removeCartItem = async (req, res) => {
  try {
    const item = await CartItem.findOneAndDelete({
      _id: req.params.itemId,
      userId: req.user._id,
    });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('removeCartItem error', err);
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};