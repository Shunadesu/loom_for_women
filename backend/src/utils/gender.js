/**
 * Giới tính — dùng chung cho backend validate và hiển thị.
 *
 * Lưu trong DB theo giá trị tiếng Anh (female/male/other) để ổn định,
 * chỉ hiển thị nhãn tiếng Việt ra ngoài UI.
 */

/** Các giá trị hợp lệ lưu trong DB. */
export const GENDER_VALUES = ['female', 'male', 'other'];

/** Nhãn tiếng Việt tương ứng. */
export const GENDER_LABELS = {
  female: 'Nữ',
  male: 'Nam',
  other: 'Khác',
};

/**
 * Chuẩn hoá giá trị giới tính đầu vào.
 * Chấp nhận cả giá trị tiếng Anh lẫn tiếng Việt ('nu', 'nam', 'khac', 'nữ'...).
 * Trả về '' nếu không hợp lệ / rỗng.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeGender(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return '';

  // Giá trị chuẩn trong DB (female/male/other).
  if (GENDER_VALUES.includes(raw)) return raw;

  // Tra cứu theo nhãn tiếng Việt (không phân biệt hoa thường).
  const byLabel = GENDER_VALUES.find(
    (g) => GENDER_LABELS[g].toLowerCase() === raw
  );
  if (byLabel) return byLabel;

  // Bảng thay thế: 'nu', 'nam', 'khac' (không dấu) + 'nữ', 'nam', 'khác'.
  const alias = {
    nu: 'female',
    nữ: 'female',
    nam: 'male',
    khac: 'other',
    khác: 'other',
  };
  return alias[raw] || '';
}
