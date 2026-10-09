import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startCleanupJob, stopCleanupJob } from './jobs/cleanup.js';

const PORT = Number(process.env.PORT) || 3010;

const start = async () => {
  await connectDB();
  startCleanupJob();
  console.log(
    `[Server] PUBLIC_BASE_URL = ${process.env.PUBLIC_BASE_URL || '(unset → localhost)'}`,
  );

  const server = app.listen(PORT, () => {
    console.log(`[Server] Loom backend đang chạy tại http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[Server] Nhận ${signal}, đang tắt...`);
    stopCleanupJob();
    server.close(() => {
      console.log('[Server] HTTP đã đóng.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  console.error('[Server] Khởi động thất bại:', err);
  process.exit(1);
});