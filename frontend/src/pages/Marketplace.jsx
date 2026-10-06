import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import MarketplaceHeader from '../components/marketplace/MarketplaceHeader.jsx';
import ProductSearchBar from '../components/marketplace/ProductSearchBar.jsx';
import PostProductBanner from '../components/marketplace/PostProductBanner.jsx';
import ProductCategoryGrid from '../components/marketplace/ProductCategoryGrid.jsx';
import ProductFilterBar from '../components/marketplace/ProductFilterBar.jsx';
import ProductPromoBanner from '../components/marketplace/ProductPromoBanner.jsx';
import ProductGrid from '../components/marketplace/ProductGrid.jsx';
import { useProductStore } from '../store/productStore.js';
import { useCartStore } from '../store/cartStore.js';

export default function Marketplace() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const error = useProductStore((s) => s.error);
  const list = useProductStore((s) => s.list);

  const addItem = useCartStore((s) => s.addItem);

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Fetch list khi mount
  useEffect(() => {
    list();
  }, [list]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Filter + sort client-side
  const displayProducts = useMemo(() => {
    let result = [...products];

    // Lọc theo category
    if (activeCategory) {
      result = result.filter(
        (p) => (p.category?._id || p.category?.id || '') === activeCategory
      );
    }

    // Lọc theo search query
    const q = debouncedQuery.toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'priceAsc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceDesc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        result.sort(
          (a, b) => (b.salesCount || 0) - (a.salesCount || 0)
        );
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const aDate = new Date(
            a.createdAt || a.updatedAt || 0
          ).getTime();
          const bDate = new Date(
            b.createdAt || b.updatedAt || 0
          ).getTime();
          return bDate - aDate;
        });
    }

    return result;
  }, [products, activeCategory, debouncedQuery, sortBy]);

  function handleAddToCart(product) {
    addItem(product, 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-6">
          <MarketplaceHeader count={products.length} />

          <ProductSearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => setDebouncedQuery(query.trim())}
          />

          <PostProductBanner />

          <ProductCategoryGrid
            categories={categories.filter((c) => c.slug !== 'tat-ca')}
            activeId={activeCategory}
            onChange={setActiveCategory}
          />

          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Backend chưa kết nối — đang hiển thị dữ liệu mẫu.{' '}
              <span className="font-bold">{error}</span>
            </div>
          )}

          <ProductFilterBar sortBy={sortBy} onSortChange={setSortBy} />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {displayProducts.length} sản phẩm
            </span>
          </div>

          <ProductPromoBanner />

          <ProductGrid
            products={displayProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>
    </motion.div>
  );
}