import { Link, useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '../icons/index.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useForumStore } from '../../store/forumStore.js';
import { useExpertQAStore } from '../../store/expertQAStore.js';
import { useSupportStore } from '../../store/supportStore.js';
import { useDocumentStore } from '../../store/documentStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

// Ô icon theo tông: mặc định hồng thương hiệu, "SOS 24/7" dùng emerald.
const TONE_STYLES = {
  default: 'bg-[#fce8f1] text-[#E60067]',
  emerald: 'bg-emerald-50 text-emerald-600',
};

/**
 * CategoryNav — dùng cho các card "Học tập cùng Loom" và "An toàn & Hỗ trợ".
 * Props:
 *   - title {string}
 *   - titleIcon {Component}  icon nhỏ cạnh tiêu đề
 *   - items [{ id, label, Icon, to?, action?, tone?, badge?, ping? }]
 *     `action` hỗ trợ: 'forum' | 'expertQA' | 'support' | 'guide' | 'cart'
 */
export default function CategoryNav({ title, titleIcon: TitleIcon, items }) {
  const navigate = useNavigate();
  const openCart = useCartStore((s) => s.openCart);
  const openForum = useForumStore((s) => s.openForum);
  const openExpertQA = useExpertQAStore((s) => s.openModal);
  const openSupport = useSupportStore((s) => s.openModal);
  const setDocumentFilter = useDocumentStore((s) => s.setFilter);
  const user = useAuthStore((s) => s.user);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  function handleAction(item, e) {
    e.preventDefault();

    if (item.action === 'forum') {
      openForum();
    } else if (item.action === 'expertQA') {
      openExpertQA();
    } else if (item.action === 'support') {
      openSupport();
    } else if (item.action === 'cart') {
      if (!user) {
        openLoginDrawer('/gio-hang');
        return;
      }
      openCart();
    } else if (item.action === 'guide') {
      // Mở thư viện và lọc sẵn các tài liệu dạng "HƯỚNG DẪN" (cẩm nang).
      setDocumentFilter({ format: 'guide' });
      navigate('/thu-vien');
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs sm:p-4">
      <div className="mb-3 flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          {TitleIcon && (
            <TitleIcon aria-hidden="true" className="h-4 w-4 text-[#E60067]" />
          )}
          <span>{title}</span>
        </h3>
        <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-slate-400" />
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {items.map((item) => {
          const { id, label, Icon, to, action, badge, ping, tone = 'default' } = item;
          const boxClass = TONE_STYLES[tone] || TONE_STYLES.default;

          const inner = (
            <>
              <div
                className={`relative mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${boxClass}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                {typeof badge === 'number' && badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#E60067] text-[9px] font-black text-white">
                    {badge}
                  </span>
                )}
                {ping && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-red-500"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-700">{label}</span>
            </>
          );

          const shell = 'group flex cursor-pointer flex-col items-center';

          // Mục mở modal / hành động đặc biệt.
          if (action) {
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => handleAction(item, e)}
                className={shell}
              >
                {inner}
              </button>
            );
          }

          // Mục điều hướng tới route.
          return (
            <Link key={id} to={to} className={shell}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
