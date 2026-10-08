import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NEWS_ITEMS } from '../data/homeContent.js';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserCircleIcon,
  ShareIcon,
  CalendarIcon,
} from '../components/icons/index.jsx';

/**
 * NewsDetail — trang chi tiết một bài viết tin tức.
 * Dữ liệu lấy từ NEWS_ITEMS (data/homeContent.js) theo slug.
 */
export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const item = NEWS_ITEMS.find((n) => n.slug === slug);

  if (!item) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-pink-300 hover:text-[#E60067]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
        <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xs sm:p-10">
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Không tìm thấy bài viết
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Bài viết bạn đang tìm không tồn tại hoặc đã bị gỡ.
          </p>
        </div>
      </main>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.desc,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép liên kết!');
      } catch {
        alert('Không thể chia sẻ.');
      }
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
      {/* Top bar: back + share */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-pink-300 hover:text-[#E60067]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Quay lại</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          title="Chia sẻ bài viết"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-pink-300 hover:text-[#E60067]"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs"
      >
        {/* Cover image */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-80">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          <span className="absolute left-4 top-4 rounded-full bg-[#E60067] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            {item.tag}
          </span>
        </div>

        <div className="p-5 sm:p-8">
          {/* Title */}
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
            {item.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <UserCircleIcon className="h-4 w-4" />
              {item.author || 'Ban biên tập'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              {item.date}
            </span>
            {item.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                {item.readTime}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-slate-200" />

          {/* Content blocks */}
          <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
            {item.content?.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h2
                    key={idx}
                    className="pt-2 text-lg font-extrabold text-slate-900 sm:text-xl"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'callout') {
                return (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-pink-200 bg-pink-50/60 p-4 text-sm text-slate-800"
                  >
                    <span className="mt-0.5 text-[#E60067]">💡</span>
                    <p className="flex-1 leading-relaxed">{block.text}</p>
                  </div>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* Footer: related */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">
              Bài viết liên quan
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {NEWS_ITEMS.filter((n) => n.slug !== item.slug).map((n) => (
                <Link
                  key={n.id}
                  to={`/tin-tuc/${n.slug}`}
                  className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-pink-200 hover:shadow-sm"
                >
                  <img
                    src={n.image}
                    alt={n.title}
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="rounded-md bg-pink-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#E60067]">
                      {n.tag}
                    </span>
                    <h4 className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-[#E60067]">
                      {n.title}
                    </h4>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {n.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </main>
  );
}
