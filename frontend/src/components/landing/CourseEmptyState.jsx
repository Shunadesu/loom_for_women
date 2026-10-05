import { BookIcon } from '../icons/index.jsx';

export default function CourseEmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
      <BookIcon aria-hidden="true" className="mb-2 h-10 w-10 text-slate-300" />
      <p className="text-sm font-bold text-slate-700">Chưa có khóa học nào</p>
      <p className="mt-1 text-xs text-slate-400">
        Thử đổi bộ lọc hoặc từ khóa khác.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 rounded-full bg-pink-50 px-4 py-1.5 text-xs font-bold text-[#E60067] hover:bg-pink-100"
        >
          Xem tất cả
        </button>
      )}
    </div>
  );
}