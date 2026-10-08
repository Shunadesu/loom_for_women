import ConsignmentProduct from '../models/ConsignmentProduct.js';
import Product from '../models/Product.js';

/**
 * GET /api/admin/consignment-products
 * List tất cả sản phẩm ký gửi (admin only)
 */
export async function listAllConsignmentProducts(req, res, next) {
  try {
    const { status, limit = 100, skip = 0 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const items = await ConsignmentProduct.find(filter)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .populate('approvedBy', 'phone name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await ConsignmentProduct.countDocuments(filter);

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/consignment-products/:id/approve
 * Duyệt sản phẩm ký gửi → tạo Product record
 */
export async function approveConsignmentProduct(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;

    const consignment = await ConsignmentProduct.findById(id);
    if (!consignment) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm ký gửi.' });
    }

    if (consignment.status === 'approved') {
      return res.status(400).json({ error: 'Sản phẩm đã được duyệt trước đó.' });
    }

    // Tạo Product record mới
    const product = await Product.create({
      title: consignment.title,
      slug: consignment.slug,
      description: consignment.description,
      thumbnail: consignment.thumbnail,
      images: consignment.images,
      category: consignment.category,
      price: consignment.price,
      originalPrice: consignment.originalPrice,
      stock: consignment.stock,
      sellerName: consignment.sellerName,
      sellerPhone: consignment.sellerPhone,
      sellerZaloUrl: consignment.sellerZaloUrl,
      isFeatured: false,
      isPublished: true,
      isActive: true,
    });

    // Cập nhật consignment status
    consignment.status = 'approved';
    consignment.approvedBy = adminId;
    consignment.approvedAt = new Date();
    consignment.productId = product._id;
    await consignment.save();

    const populated = await ConsignmentProduct.findById(consignment._id)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .populate('approvedBy', 'phone name')
      .lean();

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/consignment-products/:id/reject
 * Từ chối sản phẩm ký gửi với lý do
 */
export async function rejectConsignmentProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Vui lòng nhập lý do từ chối.' });
    }

    const consignment = await ConsignmentProduct.findById(id);
    if (!consignment) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm ký gửi.' });
    }

    consignment.status = 'rejected';
    consignment.rejectionReason = reason.trim();
    await consignment.save();

    const populated = await ConsignmentProduct.findById(consignment._id)
      .populate('category', 'name slug icon color')
      .populate('userId', 'phone name')
      .lean();

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/consignment-products/:id
 * Xóa sản phẩm ký gửi
 */
export async function deleteConsignmentProduct(req, res, next) {
  try {
    const { id } = req.params;

    const consignment = await ConsignmentProduct.findByIdAndDelete(id);
    if (!consignment) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm ký gửi.' });
    }

    res.json({ message: 'Đã xóa sản phẩm ký gửi.', id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/consignment-products/stats
 * Thống kê số lượng theo status
 */
export async function getConsignmentStats(req, res, next) {
  try {
    const [pending, approved, rejected] = await Promise.all([
      ConsignmentProduct.countDocuments({ status: 'pending' }),
      ConsignmentProduct.countDocuments({ status: 'approved' }),
      ConsignmentProduct.countDocuments({ status: 'rejected' }),
    ]);

    res.json({ pending, approved, rejected, total: pending + approved + rejected });
  } catch (err) {
    next(err);
  }
}
