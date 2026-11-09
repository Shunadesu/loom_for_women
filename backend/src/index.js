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

  // Bắt lỗi listen (EADDRINUSE…) — không bắt thì Node ném 'error' event chưa xử lý
  // ⇒ process chết ngay ⇒ pm2/aaPanel restart liên tục ⇒ CPU 100%.
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[Server] Port ${PORT} đang bị chiếm. Hãy dừng process cũ (pm2 delete <app>) hoặc đổi PORT.`,
      );
    } else {
      console.error('[Server] Lỗi HTTP server:', err);
    }
    process.exit(1);
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

// Log lỗi rồi thoát có kiểm soát thay vì crash im lặng (pm2 sẽ restart sạch).
process.on('uncaughtException', (err) => {
  console.error('[Server] uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] unhandledRejection:', reason);
  process.exit(1);
});

start().catch((err) => {
  console.error('[Server] Khởi động thất bại:', err);
  process.exit(1);
});