import { body } from 'express-validator';
import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc.'),
    body('name').optional().isString().isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự.'),
    body('password')
      .isString()
      .isLength({ min: 6 })
      .withMessage('Mật khẩu tối thiểu 6 ký tự.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc.'),
    body('password').isString().withMessage('Vui lòng nhập mật khẩu.'),
  ],
  login
);

router.get('/me', requireAuth, me);

export default router;