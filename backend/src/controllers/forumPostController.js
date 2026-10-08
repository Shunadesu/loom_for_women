import ForumPost from '../models/ForumPost.js';

/**
 * GET /api/forum-posts
 * Lấy danh sách bài đã duyệt (approved), có thể filter theo category
 */
export async function getForumPosts(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { status: 'approved' };
    
    if (category && category !== 'all') {
      filter.category = category;
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
 * GET /api/forum-posts/:id
 * Xem chi tiết 1 bài (chỉ approved)
 */
export async function getForumPostById(req, res, next) {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.id,
      status: 'approved',
    })
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
 * POST /api/forum-posts
 * Đăng bài mới (require auth)
 */
export async function createForumPost(req, res, next) {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Tiêu đề không được quá 200 ký tự.' });
    }

    if (content.length > 10000) {
      return res.status(400).json({ error: 'Nội dung không được quá 10,000 ký tự.' });
    }

    if (!['income-tips', 'scam-warning', 'learning-tips'].includes(category)) {
      return res.status(400).json({ error: 'Danh mục không hợp lệ.' });
    }

    const post = await ForumPost.create({
      title: title.trim(),
      content: content.trim(),
      category,
      author: req.user._id,
      status: 'pending',
    });

    const populated = await ForumPost.findById(post._id)
      .populate('author', 'name avatar location phone')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/forum-posts/:id/like
 * Like/unlike bài (require auth)
 */
export async function toggleLikeForumPost(req, res, next) {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.id,
      status: 'approved',
    });

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    const userId = req.user._id;
    const isLiked = post.likedBy.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.json({ likes: post.likes, isLiked: !isLiked });
  } catch (err) {
    next(err);
  }
}
