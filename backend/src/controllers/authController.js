import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { phone, name = '', password = '' } = req.body;

  if (!PHONE_REGEX.test(phone)) {
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

  const { phone, password = '' } = req.body;

  if (!PHONE_REGEX.test(phone)) {
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