import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-2xl">🔍</p>
        <p className="mt-2 text-sm font-bold text-slate-700">
          Không tìm thấy sản phẩm phù hợp
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Hãy thử chọn danh mục khác hoặc xoá bộ lọc tìm kiếm nhé.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p) => (
        <ProductCard
          key={p._id || p.slug}
          product={p}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}