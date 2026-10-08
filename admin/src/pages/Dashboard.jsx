import { useAuthStore } from '../store/authStore.js';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-xs text-slate-500">
          Xin chào <span className="font-bold text-slate-700">{user?.name || user?.phone}</span> — chọn một mục bên trái để bắt đầu.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/heroes"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            🖼️
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hero Banner</h3>
            <p className="text-[11px] text-slate-500">Quản lý ảnh trượt trang chủ</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <a
          href="/categories"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            📁
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh mục KH</h3>
            <p className="text-[11px] text-slate-500">Quản lý danh mục khóa học</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <a
          href="/courses"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            📚
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Khóa học</h3>
            <p className="text-[11px] text-slate-500">Quản lý khóa học & bài học</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <a
          href="/product-categories"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            🛍️
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh mục SP</h3>
            <p className="text-[11px] text-slate-500">Quản lý danh mục Cửa hàng</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <a
          href="/products"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            📦
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sản phẩm</h3>
            <p className="text-[11px] text-slate-500">Quản lý sản phẩm</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <a
          href="/forum-posts"
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-pink-200 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-lg text-[#E60067]">
            💬
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Diễn đàn</h3>
            <p className="text-[11px] text-slate-500">Quản lý bài viết diễn đàn</p>
          </div>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-[#E60067]">
            ›
          </span>
        </a>

        <div className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 opacity-60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            👥
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Người dùng</h3>
            <p className="text-[11px] text-slate-400">Sắp ra mắt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
