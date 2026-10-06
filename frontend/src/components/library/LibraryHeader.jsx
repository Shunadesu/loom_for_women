import { BookOpenIcon } from '../icons/index.jsx';

export default function LibraryHeader() {
  return (
    <div className="bg-gradient-to-r from-[#E60067] via-[#f72585] to-rose-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
      <div>
        <span className="bg-white/20 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Tài liệu học tập
        </span>
        <h2 className="text-sm font-bold mt-1">Danh sách tài liệu của các bài học</h2>
        <p className="text-[11px] text-pink-100 mt-0.5">
          Lưu trữ, tải về máy và xem ngoại tuyến các giáo trình học tập Loom
        </p>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
        <BookOpenIcon aria-hidden="true" className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}