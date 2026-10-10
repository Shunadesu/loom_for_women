import {
  ShoppingBagIcon,
  MessageCircleIcon,
  PercentIcon,
  StarIcon,
} from '../../components/icons/index.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import { useNotification } from '../../store/notificationStore.js';

function formatVND(n) {
  if (!n) return '0₫';
  return `${Number(n).toLocaleString('vi-VN')}₫`;
}

export default function ProductCard({ product, onAddToCart }) {
  const discount = product.discountPct ?? 0;
  const rating = product.rating || 0;
  const { toast } = useNotification();

  function handleZalo() {
    const url = product.sellerZaloUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleAdd() {
    if (typeof onAddToCart === 'function') onAddToCart(product);
    else toast({ type: 'success', message: `Đã thêm "${product.title}" vào giỏ (mock).` });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-shadow hover:shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.thumbnail ? (
          <img
            src={resolveImageUrl(product.thumbnail)}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300">
            🛍
          </div>
        )}
        {discount > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
            <PercentIcon aria-hidden="true" className="h-3 w-3" />
            -{discount}%
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-extrabold text-white">
            Hết hàng
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-[13px] font-extrabold leading-tight text-slate-900">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-0.5">
            <StarIcon aria-hidden="true" className="h-3 w-3 text-amber-500" />
            <span className="font-bold text-slate-700">
              {rating ? rating.toFixed(1) : '—'}
            </span>
          </div>
          <span>·</span>
          <span>Đã bán {product.salesCount ?? 0}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-[#E60067]">
            {formatVND(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-slate-400 line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>

        {product.sellerName && (
          <p className="text-[10px] text-slate-500">
            👤 {product.sellerName}
          </p>
        )}

        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#E60067] px-2 py-2 text-[11px] font-extrabold text-white transition-colors hover:bg-[#d0005a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBagIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Thêm vào giỏ
          </button>
          <button
            type="button"
            onClick={handleZalo}
            disabled={!product.sellerZaloUrl}
            className="flex items-center justify-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-[11px] font-extrabold text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Liên hệ Zalo"
            title="Liên hệ Zalo với người bán"
          >
            <MessageCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}