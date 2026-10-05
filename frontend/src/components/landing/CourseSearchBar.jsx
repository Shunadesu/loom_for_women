import { SearchIcon } from '../../components/icons/index.jsx';

export default function CourseSearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Bạn tìm khóa học nào?"
          className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-[#E60067] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-[#E60067] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#d0005a]"
      >
        Tìm
      </button>
    </form>
  );
}