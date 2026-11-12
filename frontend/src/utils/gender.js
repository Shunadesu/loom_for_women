/**
 * Giới tính — danh sách lựa chọn + nhãn hiển thị.
 *
 * Giá trị lưu trong DB (khớp với backend `backend/src/utils/gender.js`):
 * 'female' | 'male' | 'other'. Rỗng = người dùng chưa cung cấp.
 */

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
  { value: 'other', label: 'Khác' },
];

/** Nhãn tiếng Việt theo giá trị trong DB. */
export const GENDER_LABELS = GENDER_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

/**
 * Lấy nhãn hiển thị của giới tính.
 * @param {string} value - giá trị trong DB
 * @param {string} [fallback='—'] - giá trị khi rỗng/không hợp lệ
 * @returns {string}
 */
export function genderLabel(value, fallback = '—') {
  return GENDER_LABELS[value] || fallback;
}
