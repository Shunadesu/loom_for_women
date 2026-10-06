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

// ─── Product thumbnail upload dir ────────────────────────────
const UPLOAD_PRODUCT_DIR = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(UPLOAD_PRODUCT_DIR)) {
  fs.mkdirSync(UPLOAD_PRODUCT_DIR, { recursive: true });
}

// ─── Document (tài liệu học tập) upload dir ─────────────────
const UPLOAD_DOC_DIR = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(UPLOAD_DOC_DIR)) {
  fs.mkdirSync(UPLOAD_DOC_DIR, { recursive: true });
}

const imageFileFilter = (_req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
    file.mimetype
  );
  if (!ok) return cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).'));
  cb(null, true);
};

const documentFileFilter = (_req, file, cb) => {
  const ok = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
  ].includes(file.mimetype);
  if (!ok) {
    return cb(
      new Error('Chỉ chấp nhận file PDF, Excel (xls/xlsx) hoặc ảnh (jpg, png, webp).')
    );
  }
  cb(null, true);
};

const slugify = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';

const makeStorage = (dir) =>
  multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = (path.extname(file.originalname) || '').toLowerCase();
      const safeExt = /^\.(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : '.jpg';
      const random = crypto.randomBytes(6).toString('hex');
      cb(null, `${Date.now()}-${random}${safeExt}`);
    },
  });

const makeDocumentStorage = (dir) =>
  multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = (path.extname(file.originalname) || '').toLowerCase() || '.pdf';
      const safeExt = /^\.(pdf|xls|xlsx|jpg|jpeg|png|webp)$/.test(ext)
        ? ext
        : '.pdf';
      const base = slugify(path.basename(file.originalname, ext));
      const random = crypto.randomBytes(4).toString('hex');
      cb(null, `${Date.now()}-${base}-${random}${safeExt}`);
    },
  });

export const uploadHero = multer({
  storage: makeStorage(UPLOAD_HERO_DIR),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadCourse = multer({
  storage: makeStorage(UPLOAD_COURSE_DIR),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadProduct = multer({
  storage: makeStorage(UPLOAD_PRODUCT_DIR),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadDocument = multer({
  storage: makeDocumentStorage(UPLOAD_DOC_DIR),
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export {
  UPLOAD_HERO_DIR,
  UPLOAD_COURSE_DIR,
  UPLOAD_PRODUCT_DIR,
  UPLOAD_DOC_DIR,
};

/** Xoá file vật lý nếu thuộc thư gốc uploads của mình. */
export const safeUnlink = (absPath) => {
  try {
    if (!absPath) return;
    const norm = path.normalize(absPath);
    const isInUploads =
      (UPLOAD_HERO_DIR && norm.startsWith(UPLOAD_HERO_DIR)) ||
      (UPLOAD_COURSE_DIR && norm.startsWith(UPLOAD_COURSE_DIR)) ||
      (UPLOAD_PRODUCT_DIR && norm.startsWith(UPLOAD_PRODUCT_DIR)) ||
      (UPLOAD_DOC_DIR && norm.startsWith(UPLOAD_DOC_DIR));
    if (isInUploads && fs.existsSync(norm)) {
      fs.unlinkSync(norm);
    }
  } catch {
    // bỏ qua — không để lỗi xoá file làm hỏng request
  }
};