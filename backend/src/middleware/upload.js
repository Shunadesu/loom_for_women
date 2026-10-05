import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Hero upload dir ──────────────────────────────────────────
const UPLOAD_HERO_DIR = path.join(__dirname, '../../uploads/heroes');
if (!fs.existsSync(UPLOAD_HERO_DIR)) {
  fs.mkdirSync(UPLOAD_HERO_DIR, { recursive: true });
}

// ─── Course thumbnail upload dir ──────────────────────────────
const UPLOAD_COURSE_DIR = path.join(__dirname, '../../uploads/courses');
if (!fs.existsSync(UPLOAD_COURSE_DIR)) {
  fs.mkdirSync(UPLOAD_COURSE_DIR, { recursive: true });
}

const fileFilter = (_req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
    file.mimetype
  );
  if (!ok) return cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).'));
  cb(null, true);
};

const makeStorage = (dir) =>
  multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safeExt = /^\.(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : '.jpg';
      const random = crypto.randomBytes(6).toString('hex');
      cb(null, `${Date.now()}-${random}${safeExt}`);
    },
  });

export const uploadHero = multer({
  storage: makeStorage(UPLOAD_HERO_DIR),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadCourse = multer({
  storage: makeStorage(UPLOAD_COURSE_DIR),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export { UPLOAD_HERO_DIR, UPLOAD_COURSE_DIR };

/** Xoá file vật lý nếu thuộc thư mục uploads của mình. */
export const safeUnlink = (absPath) => {
  try {
    if (!absPath) return;
    const norm = path.normalize(absPath);
    const isInUploads =
      (UPLOAD_HERO_DIR && norm.startsWith(UPLOAD_HERO_DIR)) ||
      (UPLOAD_COURSE_DIR && norm.startsWith(UPLOAD_COURSE_DIR));
    if (isInUploads && fs.existsSync(norm)) {
      fs.unlinkSync(norm);
    }
  } catch {
    // bỏ qua — không để lỗi xoá file làm hỏng request
  }
};