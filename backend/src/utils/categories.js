/**
 * Danh mục nội dung khóa học — dùng chung cho admin form và backend validate.
 */
export const CATEGORY_OPTIONS = [
  'Phòng chống lừa đảo',
  'Quản lý tài chính',
  'Kỹ năng thủ công',
  'Quyền lợi lao động',
];

export const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0];

/** Chuẩn hoá giá trị category đầu vào (rỗng → mặc định). */
export function normalizeCategory(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const match = CATEGORY_OPTIONS.find(
    (c) => c.toLowerCase() === raw.toLowerCase()
  );
  return match || raw.slice(0, 100);
}
