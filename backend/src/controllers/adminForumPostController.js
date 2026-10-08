import ForumPost from '../models/ForumPost.js';

/**
 * GET /api/admin/forum-posts
 * Lấy tất cả bài viết, có thể filter theo status
 */
export async function getAllForumPosts(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const posts = await ForumPost.find(filter)
      .populate('author', 'name avatar location phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/forum-posts/:id/approve
 * Duyệt bài
 */
export async function approveForumPost(req, res, next) {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    )
      .populate('author', 'name avatar location phone')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/forum-posts/:id/reject
 * Từ chối bài
 */
export async function rejectForumPost(req, res, next) {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    )
      .populate('author', 'name avatar location phone')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/forum-posts/:id/quality
 * Đánh dấu bài chất lượng + nhập voucher
 */
export async function markQualityPost(req, res, next) {
  try {
    const { isQuality, voucherCode } = req.body;

    const update = {
      isQualityPost: Boolean(isQuality),
      voucherCode: isQuality ? (voucherCode || null) : null,
    };

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate('author', 'name avatar location phone')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/forum-posts/:id
 * Xóa bài
 */
export async function deleteForumPost(req, res, next) {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    res.json({ message: 'Đã xóa bài viết.' });
  } catch (err) {
    next(err);
  }
}
