const DEFAULT_NOTICES = [
  'Khóa học mới sắp ra mắt trong tháng 4',
  'Đừng quên tiếp tục khóa học của bạn về phòng chống lừa đảo',
  'Mở khóa chức năng đóng góp nội dung học tập!',
];

export default function CourseNoticeBanner({ notices = DEFAULT_NOTICES }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#E60067] p-4 text-white shadow-md">
      <div className="flex items-start justify-between">
        <div className="max-w-[68%] space-y-2">
          <div className="inline-block rounded-full bg-white px-3 py-0.5 text-xs font-black uppercase tracking-wide text-[#E60067] shadow-xs">
            THÔNG BÁO
          </div>
          <ul className="space-y-1.5 text-[11px] font-semibold leading-tight">
            {notices.map((text, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-300">✓</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-pink-100/30 text-4xl shadow-inner">
          🧶
        </div>
      </div>
    </div>
  );
}