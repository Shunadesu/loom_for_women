/**
 * Chuẩn hoá SĐT phía client trước khi gửi lên backend.
 * Mirror của logic trong backend/src/controllers/authController.js.
 *
 * Hỗ trợ các format phổ biến tại VN:
 *   0901234567
 *   +84 90 123 4567
 *   090-123-4567
 *   090.123.4567
 *   901 234 567 (thiếu số 0 đầu)
 *   0123456789 (seed/test — đầu 01 cũng được)
 *
 * Trả về chuỗi đã chuẩn hoá (dạng 0xxxxxxxxx, 10 số) hoặc chuỗi gốc nếu không match.
 */
export function normalizePhoneVN(input) {
  if (typeof input !== 'string') return input;
  const digits = input.replace(/[\s\-().+]/g, '');
  if (!/^[0-9]{9,11}$/.test(digits)) return input;
  if (digits.startsWith('84') && digits.length === 11) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  if (digits.length === 9 && /^[35789]/.test(digits)) {
    return '0' + digits;
  }
  return input;
}