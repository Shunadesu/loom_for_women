import { Link } from 'react-router-dom';
import { QUICK_ACTIONS } from '../../data/homeContent.js';
import { useExpertQAStore } from '../../store/expertQAStore.js';
import { useForumStore } from '../../store/forumStore.js';
import { useSupportStore } from '../../store/supportStore.js';

// Ô icon: màu hồng thương hiệu, riêng "Hỗ trợ 24/7" dùng tông emerald.
const TONE_STYLES = {
  default: {
    box: 'bg-pink-50 text-[#E60067] group-hover:bg-[#E60067]',
  },
  emerald: {
    box: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
  },
};

export default function QuickActions() {
  const openExpertQA = useExpertQAStore((s) => s.openModal);
  const openForum = useForumStore((s) => s.openForum);
  const openSupport = useSupportStore((s) => s.openModal);

  function handleAction(action) {
    if (action === 'expertQA') openExpertQA();
    else if (action === 'forum') openForum();
    else if (action === 'support') openSupport();
  }

  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-xs sm:p-5">
      <div className="grid grid-cols-5 gap-3 text-center sm:gap-6">
        {QUICK_ACTIONS.map(({ id, label, Icon, to, action, tone = 'default' }) => {
          const { box } = TONE_STYLES[tone] || TONE_STYLES.default;

          const inner = (
            <>
              <div
                className={`mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-105 group-hover:text-white sm:h-12 sm:w-12 ${box}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 sm:text-xs">
                {label}
              </span>
            </>
          );

          const shell =
            'group flex cursor-pointer flex-col items-center';

          // Mục điều hướng tới route.
          if (to) {
            return (
              <Link key={id} to={to} className={shell}>
                {inner}
              </Link>
            );
          }

          // Mục mở modal.
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleAction(action)}
              className={shell}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
