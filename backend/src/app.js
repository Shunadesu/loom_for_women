import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();

// Behind proxy (nginx, etc.) — trust first hop
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Cho phép request không có Origin (server-to-server, curl)
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
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
app.use('/api/admin', adminRoutes);

// 404 + error
app.use(notFoundHandler);
app.use(errorHandler);

export default app;