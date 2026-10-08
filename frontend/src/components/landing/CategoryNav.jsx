import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '../icons/index.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useForumStore } from '../../store/forumStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

/**
 * CategoryNav — dùng cho cả "Học tập cùng Loom" và "Mua sắm cùng Loom".
 * Props:
 *   - title: tiêu đề section
 *   - items: [{ id, label, Icon, to, badge?, ping?, action? }]
 */
export default function CategoryNav({ title, items }) {
  const openCart = useCartStore((s) => s.openCart);
  const openForum = useForumStore((s) => s.openForum);
  const user = useAuthStore((s) => s.user);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  const handleClick = (item, e) => {
    if (item.action === 'cart') {
      e.preventDefault();
      if (!user) {
        openLoginDrawer('/gio-hang');
        return;
      }
      openCart();
    } else if (item.action === 'forum') {
      e.preventDefault();
      openForum();
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-xs font-bold text-slate-900">{title}</h3>
        <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-slate-400" />
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {items.map((item) => {
          const { id, label, Icon, to, badge, ping } = item;
          
          return (
            <Link
              key={id}
              to={to}
              onClick={(e) => handleClick(item, e)}
              className="group flex flex-col items-center"
            >
              <div className="relative mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fce8f1] text-[#E60067] transition-transform group-hover:scale-105">
                <Icon aria-hidden="true" className="h-5 w-5" />
                {typeof badge === 'number' && badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#E60067] text-[9px] font-black text-white">
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}