import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Thiếu hoặc sai định dạng Authorization header.' });
    }
    const token = header.slice(7).trim();
    if (!token) return res.status(401).json({ error: 'Token rỗng.' });

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User không tồn tại hoặc đã bị vô hiệu hoá.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token hết hạn, vui lòng đăng nhập lại.' });
    }
    return res.status(401).json({ error: 'Token không hợp lệ.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Chưa xác thực.' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Cần quyền admin.' });
  }
  next();
};

// Optional: nếu có token thì attach user, không bắt buộc
export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const token = header.slice(7).trim();
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (user && user.isActive) req.user = user;
    }
  } catch {
    // bỏ qua — endpoint public vẫn chạy được
  }
  next();
};