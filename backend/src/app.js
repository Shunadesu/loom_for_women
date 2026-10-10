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
import productRoutes from './routes/products.js';
import productCategoryRoutes from './routes/productCategories.js';
import cartRoutes from './routes/cart.js';
import adminCategoryRoutes from './routes/adminCategories.js';
import adminCourseRoutes from './routes/adminCourses.js';
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

// CORS - Cho phép tất cả origins
app.use(
  cors({
    origin: true,
    credentials: true,
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
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
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