import path from 'path';
import Config, { CONFIG_ID } from '../models/Config.js';
import { safeUnlink, UPLOAD_BRAND_DIR } from '../middleware/upload.js';

/**
 * Quản lý logo thương hiệu.
 * Lưu trong Config singleton (logoUrl / logoAlt).
 * URL lưu dạng relative path để frontend ghép base URL (nhất quán với hero).
 */
const publicUrlFor = (filename) => `/uploads/brand/${filename}`;

/** Lấy tên file từ URL (relative hoặc full). */
const filenameFromUrl = (url) => {
  if (!url) return null;
  try {
    // URL relative: /uploads/brand/xxx.png
    const parsed = new URL(url, 'http://localhost');
    const last = parsed.pathname.split('/').pop();
    return last || null;
  } catch {
    return null;
  }
};

/** Đường dẫn tuyệt đối trong thư mục uploads/brand — chỉ khi nằm trong đó mới cho xoá. */
const absFromFilename = (filename) =>
  filename ? path.join(UPLOAD_BRAND_DIR, filename) : null;

/**
 * Upload / thay logo.
 * - Cần file ảnh ở field "logo" (multer: uploadLogo.single('logo')).
 * - Xoá file cũ (nếu nằm trong uploads/brand) trước khi lưu URL mới.
 */
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Thiếu file ảnh (field "logo").' });
    }

    const { logoAlt } = req.body || {};

    const current = await Config.findById(CONFIG_ID);
    const oldName = filenameFromUrl(current?.logoUrl);
    if (oldName) safeUnlink(absFromFilename(oldName));

    const patch = { logoUrl: publicUrlFor(req.file.filename) };
    if (typeof logoAlt === 'string' && logoAlt.trim()) {
      patch.logoAlt = logoAlt.trim().slice(0, 200);
    }

    const config = await Config.findByIdAndUpdate(
      CONFIG_ID,
      { $set: patch },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ config });
  } catch (err) {
    // Lỗi → dọn file vừa upload, không để rác
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Tải logo lên thất bại.' });
  }
};

/**
 * Xoá logo → quay về logo mặc định /logo.png (logoUrl = '').
 */
export const deleteLogo = async (_req, res) => {
  try {
    const current = await Config.findById(CONFIG_ID);
    const oldName = filenameFromUrl(current?.logoUrl);
    if (oldName) safeUnlink(absFromFilename(oldName));

    const config = await Config.findByIdAndUpdate(
      CONFIG_ID,
      { $set: { logoUrl: '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: 'Xoá logo thất bại.' });
  }
};
