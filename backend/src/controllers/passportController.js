import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Message from '../models/Message.js';
import { calculateSideIncome } from '../utils/income.js';

/**
 * GET /api/me/passport
 * Get user's safety passport data
 */
export async function getPassport(req, res) {
  try {
    const user = req.user;

    // Get all user's progress
    const progressList = await UserProgress.find({ userId: user._id })
      .populate('courseId', 'title')
      .lean();

    // Calculate completed courses
    const completedCoursesCount = progressList.filter(
      (p) => p.progressPct === 100
    ).length;

    // Get user's posted products (assuming Product has sellerPhone field)
    const postedProductsCount = await Product.countDocuments({
      sellerPhone: user.phone,
    });

    // Calculate side income based on progress
    const sideIncome = calculateSideIncome(progressList);

    // Generate QR payload (verification URL)
    const qrPayload = `${process.env.FRONTEND_URL || 'http://localhost:3012'}/verify/${user.passportSerial}`;

    // Prepare response
    const passportData = {
      profile: {
        _id: user._id,
        name: user.name || 'Bạn của Loom',
        phone: user.phone,
        avatar: user.avatar,
        location: user.location || 'KCN PouYuen',
        zaloVerified: user.zaloVerified,
        passportSerial: user.passportSerial,
      },
      stats: {
        completedCourses: completedCoursesCount,
        postedProducts: postedProductsCount,
        sideIncome: sideIncome,
      },
      badges: user.badges || [],
      qrPayload: qrPayload,
      progressList: progressList.map((p) => ({
        courseId: p.courseId?._id,
        courseTitle: p.courseId?.title,
        progressPct: p.progressPct,
        completedLessons: p.completedLessons?.length || 0,
      })),
    };

    res.json(passportData);
  } catch (error) {
    console.error('Error fetching passport:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin hộ chiếu' });
  }
}

/**
 * GET /api/products/me
 * Get user's posted products
 */
export async function getMyProducts(req, res) {
  try {
    const user = req.user;

    // Find products by seller phone
    const products = await Product.find({ sellerPhone: user.phone })
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching my products:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm' });
  }
}

/**
 * GET /api/me/orders
 * Get orders from customers
 */
export async function getMyOrders(req, res) {
  try {
    const user = req.user;

    // Find all orders where current user is the seller
    const orders = await Order.find({ sellerUserId: user._id })
      .populate('productId', 'title imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng' });
  }
}

/**
 * GET /api/me/messages
 * Get customer messages
 */
export async function getMyMessages(req, res) {
  try {
    const user = req.user;

    // Find all message conversations where current user is the seller
    const messages = await Message.find({ sellerId: user._id, isActive: true })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Format response
    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      from: msg.buyerName,
      fromPhone: msg.buyerPhone,
      avatar: msg.buyerAvatar,
      lastMessage: msg.lastMessage,
      time: formatTimeAgo(msg.lastMessageAt),
      unread: msg.unreadCount,
      productId: msg.productId,
      productTitle: msg.productTitle,
      lastMessageAt: msg.lastMessageAt,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching my messages:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tin nhắn' });
  }
}

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
}
