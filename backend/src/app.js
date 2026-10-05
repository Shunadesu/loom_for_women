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
import categoryRoutes from './routes/categories.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import favoriteRoutes from './routes/favorites.js';
import commentRoutes from './routes/comments.js';
import certificateRoutes from './routes/certificates.js';
import pointRoutes from './routes/points.js';
import adminCategoryRoutes from './routes/adminCategories.js';
import adminCourseRoutes from './routes/adminCourses.js';
import adminLessonRoutes from './routes/adminLessons.js';
import adminCommentRoutes from './routes/adminComments.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Behind proxy (nginx, etc.) — trust first hop
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// CORS
// - CORS_ORIGINS=*                  → cho phép mọi origin (echo lại origin cụ thể, tương thích credentials)
// - CORS_ORIGINS=rỗng               → cho phép mọi origin (mặc định an toàn cho dev)
// - CORS_ORIGINS=a.com,b.com        → chỉ cho phép các origin trong danh sách
const rawOrigins = (process.env.CORS_ORIGINS || '').trim();
const isWildcard = rawOrigins === '' || rawOrigins === '*';
const allowedOriginsList = rawOrigins
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s && s !== '*');

app.use(
  cors({
    origin(origin, cb) {
      // Cho phép request không có Origin (server-to-server, curl, Postman)
      if (!origin) return cb(null, true);

      if (isWildcard) {
        // Echo lại origin để tương thích với Access-Control-Allow-Credentials
        return cb(null, origin);
      }

      if (allowedOriginsList.includes(origin)) {
        return cb(null, origin);
      }

      return cb(new Error(`Origin ${origin} không được phép bởi CORS.`));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limit
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn gửi quá nhiều request, vui lòng thử lại sau ít phút.' },
});
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
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/lessons', adminLessonRoutes);
app.use('/api/admin/comments', adminCommentRoutes);

// Static — phục vụ ảnh upload từ admin
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