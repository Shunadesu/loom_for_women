import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import heroRoutes from './routes/heroes.js';
import courseRoutes from './routes/courses.js';
import visitRoutes from './routes/visits.js';
import progressRoutes from './routes/progress.js';
import favoriteRoutes from './routes/favorites.js';
import commentRoutes from './routes/comments.js';
import certificateRoutes from './routes/certificates.js';
import pointRoutes from './routes/points.js';
import productRoutes from './routes/products.js';
import productCategoryRoutes from './routes/productCategories.js';
import cartRoutes from './routes/cart.js';
import adminCourseRoutes from './routes/adminCourses.js';
import adminCourseIntakeRoutes from './routes/adminCourseIntake.js';
import adminLessonRoutes from './routes/adminLessons.js';
import adminCommentRoutes from './routes/adminComments.js';
import adminProductRoutes from './routes/adminProducts.js';
import adminProductCategoryRoutes from './routes/adminProductCategories.js';
import documentRoutes from './routes/documents.js';
import adminDocumentRoutes, {
  lessonDocumentsRouter,
} from './routes/adminDocuments.js';
import passportRoutes from './routes/passport.js';
import forumPostRoutes from './routes/forumPosts.js';
import adminForumPostRoutes from './routes/adminForumPosts.js';
import consignmentProductRoutes from './routes/consignmentProducts.js';
import adminConsignmentProductRoutes from './routes/adminConsignmentProducts.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Behind proxy (nginx, etc.) — trust first hop
app.set('trust proxy', 1);

// CORS — chỉ cho phép origin nằm trong whitelist.
// Trước đây dùng `origin: true` (phản chiếu MỌI origin) kèm `credentials: true`,
// và biến CORS_ORIGINS trong .env thực tế KHÔNG được dùng.
const parseOriginList = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

const DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

const allowedOrigins = Array.from(
  new Set([
    ...parseOriginList(process.env.CORS_ORIGINS),
    ...(process.env.NODE_ENV === 'production' ? [] : DEV_ALLOWED_ORIGINS),
  ])
).filter((o) => o !== '*');

// Nếu cấu hình rộng (CORS_ORIGINS=*) thì chỉ cho phép khi KHÔNG bật credentials.
const allowAnyOrigin = parseOriginList(process.env.CORS_ORIGINS).includes('*');
const corsCredentials = !allowAnyOrigin;

if (process.env.NODE_ENV === 'production' && allowAnyOrigin) {
  console.warn(
    '[CORS] CORS_ORIGINS="*" — mọi origin đều gọi được API. Hãy liệt kê domain cụ thể.'
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Không có Origin header (curl, server-to-server) → cho phép.
      if (!origin) return callback(null, true);
      if (allowAnyOrigin) return callback(null, true);
      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      // Trả `false` thay vì `new Error(...)` — nếu throw, errorHandler sẽ log
      // "Unhandled error" mỗi lần bị chặn và trả 500, gây ồn log trên VPS.
      return callback(null, false);
    },
    credentials: corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    maxAge: 86400,
  })
);

app.use(helmet({
  crossOriginResourcePolicy: false, // Cho phép cross-origin ảnh
}));

// Riêng cho /uploads — allow cross-origin images
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limit
// Lưu ý: khi mount bằng app.use('/api', ...), Express cắt mount path khỏi
// req.path (thành '/health'), nên phải dùng originalUrl để so sánh.
// /api/health được miễn để hệ thống giám sát (uptime check) không bị chặn.
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const p = (req.originalUrl || req.url).split('?')[0];
    return p === '/api/health' || p === '/health';
  },
  message: { error: 'Bạn gửi quá nhiều request, vui lòng thử lại sau ít phút.' },
});

// Rate limit riêng cho endpoint ghi visit (bot quét site gọi liên tục).
const visitLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.VISIT_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn gửi quá nhiều request, vui lòng thử lại sau ít phút.' },
});

// Tracking lượt truy cập — đặt SAU rate limit để endpoint này cũng bị giới hạn.
// (Trước đây nó được mount TRƯỚC limiter ⇒ không bị chặn ⇒ log DB phình vô hạn.)
app.use('/api/visits', visitLimiter, visitRoutes);

app.use('/api', limiter);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'loom-backend', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/intake', adminCourseIntakeRoutes);
app.use('/api/admin/lessons', adminLessonRoutes);
app.use('/api/admin/comments', adminCommentRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/product-categories', adminProductCategoryRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);
app.use('/api/admin/lessons/:lessonId/documents', lessonDocumentsRouter);
app.use('/api/documents', documentRoutes);
app.use('/api/me', passportRoutes);
app.use('/api/forum-posts', forumPostRoutes);
app.use('/api/admin/forum-posts', adminForumPostRoutes);
app.use('/api/consignment-products', consignmentProductRoutes);
app.use('/api/admin/consignment-products', adminConsignmentProductRoutes);

// Static — phục vụ ảnh upload với cache
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    etag: true,
  })
);

// 404 + error
app.use(notFoundHandler);
app.use(errorHandler);

export default app;