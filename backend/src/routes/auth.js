import { body } from 'express-validator';
import { Router } from 'express';
import { register, login, me, updateAvatar } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.post(
  '/register',
  [
    body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc.'),
    body('name').trim().notEmpty().withMessage('Tên là bắt buộc.').isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự.'),
    body('age')
      .isInt({ min: 13, max: 100 })
      .withMessage('Tuổi không hợp lệ (từ 13 đến 100).')
      .toInt(),
    body('occupation')
      .trim()
      .notEmpty()
      .withMessage('Nghề nghiệp là bắt buộc.')
      .isLength({ max: 100 })
      .withMessage('Nghề nghiệp tối đa 100 ký tự.'),
    // Giới tính: tuỳ chọn (để tương thích client cũ), nếu có thì phải hợp lệ.
    body('gender')
      .optional({ values: 'falsy' })
      .isIn(['female', 'male', 'other'])
      .withMessage('Giới tính không hợp lệ.'),
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

router.patch('/avatar', requireAuth, uploadAvatar.single('avatar'), updateAvatar);

export default router;