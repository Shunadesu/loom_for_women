import mongoose from 'mongoose';
import PointTransaction from '../models/PointTransaction.js';

/**
 * Cộng/trừ điểm cho user, có lưu lịch sử vào PointTransaction.
 * - Không idempotent — gọi nhiều lần sẽ cộng nhiều lần. Caller phải tự check.
 * - Trả về transaction document.
 */
export async function awardPoints({
  userId,
  delta,
  type,
  refId = null,
  description = '',
}) {
  if (!userId || !delta || !type) return null;
  const tx = await PointTransaction.create({
    userId,
    delta: Number(delta),
    type,
    refId: refId ? String(refId) : null,
    description: description.slice(0, 200),
  });
  return tx.toObject ? tx.toObject() : tx;
}

/**
 * Tính tổng điểm hiện tại của user (sum tất cả delta).
 */
export async function getUserPoints(userId) {
  if (!userId) return 0;
  const oid = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  const result = await PointTransaction.aggregate([
    { $match: { userId: oid } },
    { $group: { _id: null, total: { $sum: '$delta' } } },
  ]);
  return result[0]?.total ?? 0;
}

// Điểm mặc định theo hành động — admin có thể chỉnh trong Config (TODO).
export const POINT_RULES = {
  LESSON_COMPLETE: 5,
  COURSE_FINISH: 100,
  COMMENT: 2,
};

/**
 * Hệ thống cấp người dùng dựa trên tổng điểm tích lũy.
 * Sắp xếp từ thấp → cao; ngưỡng `min` (inclusive) tới `max` (inclusive) trừ Infinity.
 * `color` dùng thống nhất giữa backend & frontend (khóa Tailwind palette).
 */
export const TIERS = [
  { key: 'newcomer', label: 'Mới', color: 'slate', min: 0, max: 99 },
  { key: 'silver', label: 'Bạc', color: 'slate', min: 100, max: 499 },
  { key: 'gold', label: 'Vàng', color: 'amber', min: 500, max: 1999 },
  { key: 'platinum', label: 'Bạch kim', color: 'cyan', min: 2000, max: Infinity },
];

/**
 * Tính cấp (tier) từ tổng điểm.
 * @param {number} total
 * @returns {{ key: string, label: string, color: string, min: number, max: number }}
 */
export function computeTierFromPoints(total) {
  const safe = Number.isFinite(Number(total)) ? Number(total) : 0;
  // Duyệt ngược để tìm mức cao nhất phù hợp.
  for (let i = TIERS.length - 1; i >= 0; i -= 1) {
    if (safe >= TIERS[i].min) return { ...TIERS[i] };
  }
  return { ...TIERS[0] };
}