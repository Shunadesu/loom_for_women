/**
 * Nút cuối card, đổi text + màu theo % tiến độ.
 * - 0%   → BẮT ĐẦU HỌC  (text-[#E60067])
 * - 1-99 → TIẾP TỤC HỌC (XX%)  (text-teal-600)
 * - 100  → HỌC LẠI (text-emerald-600)
 */
export default function CourseProgressButton({ progressPct = 0, onClick }) {
  const pct = Number(progressPct) || 0;

  let label;
  let className =
    'text-[10px] font-bold uppercase tracking-wider transition-colors';

  if (pct >= 100) {
    label = 'HỌC LẠI';
    className += ' text-emerald-600 hover:underline';
  } else if (pct > 0) {
    label = `TIẾP TỤC HỌC (${pct}%)`;
    className += ' text-teal-600 hover:underline';
  } else {
    label = 'BẮT ĐẦU HỌC';
    className += ' text-[#E60067] hover:underline';
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}
