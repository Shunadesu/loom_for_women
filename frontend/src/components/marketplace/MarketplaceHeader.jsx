import { ShopIcon } from '../../components/icons/index.jsx';

export default function MarketplaceHeader({ count }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-[#E60067]">
          <ShopIcon aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-extrabold text-slate-900">
            Chợ Sinh Kế Loom
          </h2>
          <p className="text-[11px] text-slate-500">
            Sản phẩm thủ công do Nữ công nhân tự làm
            {typeof count === 'number' && count > 0 ? (
              <span className="ml-1 font-bold text-[#E60067]">
                · {count} sản phẩm
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}