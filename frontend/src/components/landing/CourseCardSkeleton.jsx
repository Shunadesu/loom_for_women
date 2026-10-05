export default function CourseCardSkeleton() {
  return (
    <div className="flex animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs sm:flex-row">
      <div className="h-28 w-full shrink-0 bg-slate-100 sm:h-28 sm:w-28" />
      <div className="flex-1 space-y-2 p-3">
        <div className="h-3 w-16 rounded-full bg-slate-100" />
        <div className="h-3 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        <div className="mt-2 h-3 w-1/3 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}