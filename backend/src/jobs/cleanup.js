import cron from 'node-cron';
import PopupEvent from '../models/PopupEvent.js';

let task = null;

export const startCleanupJob = () => {
  const expr = process.env.CLEANUP_CRON || '0 2 * * *';
  if (!cron.validate(expr)) {
    console.warn(`[Cron] Biểu thức CLEANUP_CRON="${expr}" không hợp lệ, bỏ qua.`);
    return;
  }
  task = cron.schedule(expr, async () => {
    try {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const r = await PopupEvent.deleteMany({ occurredAt: { $lt: cutoff } });
      console.log(`[Cron] Cleanup PopupEvent cũ hơn 90 ngày: xoá ${r.deletedCount} bản ghi.`);
    } catch (err) {
      console.error('[Cron] Cleanup thất bại:', err.message);
    }
  });
  console.log(`[Cron] Cleanup job đã lên lịch: "${expr}"`);
};

export const stopCleanupJob = () => {
  if (task) {
    task.stop();
    task = null;
  }
};