import ConsignmentProduct from '../models/ConsignmentProduct.js';
import { slugify } from '../utils/slugify.js';

/**
 * GET /api/consignment-products
 * List sản phẩm ký gửi đã approve (public)
 */
export async function listConsignmentProducts(req, res, next) {
  try {
    const { category, search, limit = 50, skip = 0 } = req.query;

    const filter = { status: 'approved' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await ConsignmentProduct.find(filter)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .sort({ order: 1, createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consignment-products
 * User đăng sản phẩm ký gửi mới (auth required)
 */
export async function createConsignmentProduct(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập để đăng ký gửi sản phẩm.' });
    }

    const {
      title,
      description,
      thumbnail,
      images,
      category,
      price,
      originalPrice,
      stock,
      sellerName,
      sellerPhone,
      sellerZaloUrl,
    } = req.body;

    if (!title || !thumbnail || !price || !sellerName || !sellerPhone) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
    }

    const slug = slugify(title);

    const item = await ConsignmentProduct.create({
      title,
      slug,
      description: description || '',
      thumbnail,
      images: images || [],
      category: category || null,
      price: Number(price),
      originalPrice: Number(originalPrice || 0),
      stock: Number(stock || 1),
      sellerName,
      sellerPhone,
      sellerZaloUrl: sellerZaloUrl || '',
      userId,
      status: 'pending',
    });

    const populated = await ConsignmentProduct.findById(item._id)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consignment-products/my
 * List sản phẩm ký gửi của user hiện tại (auth required)
 */
export async function getMyConsignmentProducts(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
    }

    const items = await ConsignmentProduct.find({ userId })
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consignment-products/:id
 * Chi tiết sản phẩm ký gửi
 */
export async function getConsignmentProductById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await ConsignmentProduct.findById(id)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .populate('approvedBy', 'phone name')
      .lean();

    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm ký gửi.' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
}
