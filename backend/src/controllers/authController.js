import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

// Chấp nhận: 0901234567, 84901234567, +84901234567, 9 012 345 67, 090-123-4567
// Yêu cầu: 9–11 chữ số sau khi bỏ khoảng trắng/dấu phân cách
const PHONE_DIGITS_ONLY = /^[0-9]{9,11}$/;

/**
 * Chuẩn hoá SĐT về dạng 0xxxxxxxxx (10 số) hoặc trả về chuỗi gốc nếu không match.
 * Trả về null nếu không hợp lệ.
 *
 * Hỗ trợ các format phổ biến tại VN:
 *   0901234567
 *   84 90 123 4567
 *   +84 901 234 567
 *   090-123-4567
 *   090.123.4567
 *   901 234 567  (thiếu 0 — sẽ tự thêm)
 *
 * Bắt buộc: 9–11 chữ số, bắt đầu bằng 0 (10 số), 84 (11 số), hoặc 3/5/7/8/9 (9 số).
 * Lưu ý: không bắt buộc đầu số 3/5/7/8/9 để cho phép SĐT test/seed như 0123456789.
 */
function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s\-().+]/g, '');
  if (!PHONE_DIGITS_ONLY.test(digits)) return null;
  // 84xxxxxxxxx (11 số) -> 0xxxxxxxxx
  if (digits.startsWith('84') && digits.length === 11) {
    return '0' + digits.slice(2);
  }
  // 0xxxxxxxxx (10 số) — ok
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  // xxxxxxxxx (9 số, thiếu 0) — tự thêm nếu đầu là 3/5/7/8/9
  if (digits.length === 9 && /^[35789]/.test(digits)) {
    return '0' + digits;
  }
  return null;
}

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name = '', password = '' } = req.body;
  const phone = normalizePhone(req.body.phone);
  if (!phone) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ.' });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'Số điện thoại đã được đăng ký.' });
    }

    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : '';

    const user = await User.create({
      phone,
      name: typeof name === 'string' ? name.trim().slice(0, 50) : '',
      passwordHash,
    });

    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.status(201).json({ user: user.toSafeJSON(), token });
  } catch (err) {
    res.status(500).json({ error: 'Đăng ký thất bại, vui lòng thử lại.' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { password = '' } = req.body;
  const phone = normalizePhone(req.body.phone);
  if (!phone) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ.' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Số điện thoại chưa đăng ký.' });
    }

    // Nếu user đã đặt password thì bắt buộc verify
    if (user.passwordHash) {
      if (!password) {
        return res.status(401).json({ error: 'Vui lòng nhập mật khẩu.' });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.json({ user: user.toSafeJSON(), token });
  } catch (err) {
    res.status(500).json({ error: 'Đăng nhập thất bại, vui lòng thử lại.' });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
};