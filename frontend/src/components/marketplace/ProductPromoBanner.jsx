import { SparklesIcon } from '../../components/icons/index.jsx';

export default function ProductPromoBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-500 via-pink-500 to-rose-500 px-4 py-4 text-white shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <SparklesIcon aria-hidden="true" className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-extrabold leading-tight">
          Khám phá phụ kiện handmade mới nhất
        </p>
        <p className="mt-0.5 text-[11px] text-white/90">
          Ưu đãi lên đến 30% — giao hàng tận nơi toàn quốc
        </p>
      </div>
    </div>
  );
}