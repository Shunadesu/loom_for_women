import { NEWS_ITEMS } from '../../data/homeContent.js';

export default function NewsList() {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900">Tin tức</h3>
        <button
          type="button"
          className="text-[11px] font-normal text-slate-400 transition-colors hover:text-[#E60067]"
        >
          Xem tất cả ›
        </button>
      </div>
      <div className="space-y-2.5">
        {NEWS_ITEMS.map((item) => (
          <article
            key={item.id}
            className="flex cursor-pointer gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs transition-colors hover:border-pink-200"
          >
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <span className="rounded-md bg-pink-50 px-2 py-0.5 text-[9px] font-semibold text-[#E60067]">
                  {item.tag}
                </span>
                <h4 className="mt-1 line-clamp-1 text-xs font-bold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                  {item.desc}
                </p>
              </div>
              <span className="text-[9px] text-slate-400">{item.date}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}