// Chuẩn hoá SĐT Việt Nam — copy từ frontend/src/utils/phone.js
// (đặt lại trong admin để không phụ thuộc relative path frontend)
export function normalizePhoneVN(input) {
  if (!input) return '';
  let s = String(input).replace(/[^\d+]/g, '');
  if (s.startsWith('+84')) s = '0' + s.slice(3);
  else if (s.startsWith('84') && s.length >= 10) s = '0' + s.slice(2);
  return s;
}