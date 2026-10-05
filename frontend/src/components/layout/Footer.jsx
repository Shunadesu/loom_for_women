import { Link, useLocation } from 'react-router-dom';
import { SmartphoneIcon } from '../icons/index.jsx';

// Cột 2: các link khám phá — map 1-1 với PRIMARY trong NavBar
const EXPLORE_LINKS = [
  { to: '/', label: 'Trang chủ & Tin tức hoạt động' },
  { to: '/khoa-hoc', label: 'Khóa học trực tuyến & Chứng chỉ' },
  { to: '/cua-hang', label: 'Cửa hàng phụ kiện & Nhu yếu phẩm' },
  { to: '/thu-vien', label: 'Thư viện tài liệu & Biểu mẫu' },
  { to: '/he-chieu', label: 'Hộ chiếu an toàn & Đổi quà' },
];

// Cột 3: hotline — `accent` quy định màu số (rose cho khẩn cấp quốc gia, pink cho Loom)
const HOTLINES = [
  {
    label: 'Tổng đài Bảo vệ Phụ nữ & Trẻ em',
    number: '111',
    accent: 'rose',
  },
  {
    label: 'Cảnh sát khẩn cấp',
    number: '113',
    accent: 'rose',
  },
  {
    label: 'Tư vấn Tâm lý & Pháp lý Loom',
    number: '1900 969 680',
    accent: 'pink',
  },
];

const HOTLINE_ACCENT_CLASS = {
  rose: 'text-rose-600',
  pink: 'text-[#E60067]',
};

const ZALO_DESCRIPTION =
  'Hệ sinh thái hỗ trợ cả giao diện Web trên máy tính và Zalo Mini App trực tiếp trên điện thoại thông minh.';
const ZALO_LABEL = 'Mở Zalo Mini App (Điện thoại)';
const BRAND_DESCRIPTION =
  'Nền tảng số Hộ Chiếu An Toàn giúp nữ công nhân nâng cao kỹ năng an toàn số, tài chính thông minh và phát triển sinh kế thủ công bền vững.';
const BRAND_TITLE = 'LOOM FOR WOMEN';

export default function Footer() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white text-xs text-slate-600">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Cột 1: Brand block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E60067] shadow-xs">
                <img
                  src="/logo.png"
                  alt="Logo Loom for Women"
                  className="h-full w-auto max-w-full object-contain"
                />
              </div>
              <span className="text-sm font-extrabold text-slate-900">
                {BRAND_TITLE}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {BRAND_DESCRIPTION}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Tiêu chuẩn ESG (S)
              </span>
              <span className="rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                Đồng hành cùng Zalo
              </span>
            </div>
          </div>

          {/* Cột 2: Khám phá nền tảng */}
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Khám phá nền tảng
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="cursor-pointer transition-colors hover:text-[#E60067]"
                  >
                    • {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Đường dây nóng khẩn cấp */}
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Đường dây nóng khẩn cấp
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {HOTLINES.map((item) => (
                <li
                  key={item.number}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-1.5"
                >
                  <span className="font-semibold text-slate-700">
                    {item.label}:
                  </span>
                  <a
                    href={`tel:${item.number.replace(/\s/g, '')}`}
                    className={`font-black transition-opacity hover:opacity-80 ${
                      HOTLINE_ACCENT_CLASS[item.accent]
                    }`}
                    title={`Gọi ${item.number}`}
                  >
                    {item.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Trải nghiệm kép tiện lợi */}
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Trải nghiệm kép tiện lợi
            </h4>
            <p className="mb-2 text-[11px] text-slate-500">
              {ZALO_DESCRIPTION}
            </p>
            <a
              href="#"
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E60067] px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#c90059]"
              title={ZALO_LABEL}
            >
              <SmartphoneIcon className="h-3.5 w-3.5" />
              <span>{ZALO_LABEL}</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6 text-[11px] text-slate-500">
          <div>
            © 2026 <strong>Loom for Women</strong> - Dự án Nền tảng số Hộ Chiếu
            An Toàn. Giữ toàn bộ bản quyền.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="cursor-pointer transition-colors hover:text-[#E60067]"
            >
              Chính sách bảo mật
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              className="cursor-pointer transition-colors hover:text-[#E60067]"
            >
              Điều khoản sử dụng
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              className="cursor-pointer transition-colors hover:text-[#E60067]"
            >
              Cam kết ESG 2026
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}