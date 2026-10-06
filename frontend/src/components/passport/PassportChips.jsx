import { MessageCircleIcon, ShieldIcon, StoreIcon, PackageIcon, BookIcon, GiftIcon } from '../icons/index.jsx';

const CHIPS = [
  { id: 'messages', label: 'Tin Nhắn Khách', Icon: MessageCircleIcon, badge: 1 },
  { id: 'passport', label: 'Hộ Chiếu', Icon: ShieldIcon },
  { id: 'myProducts', label: 'Sản Phẩm Đăng', Icon: StoreIcon, badge: 2 },
  { id: 'orders', label: 'Đơn Khách Đặt', Icon: PackageIcon, badge: 3, hasPulse: true },
  { id: 'documents', label: 'Tài Liệu', Icon: BookIcon },
  { id: 'gifts', label: 'Quà Tặng', Icon: GiftIcon },
];

export default function PassportChips({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CHIPS.map((chip) => {
        const isActive = activeTab === chip.id;
        return (
          <button
            key={chip.id}
            onClick={() => onChange(chip.id)}
            className={[
              'py-2 px-3 rounded-full font-bold text-center text-[11px] shrink-0 transition-all cursor-pointer flex items-center gap-1.5',
              isActive
                ? 'bg-[#E60067] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            <chip.Icon className="w-3.5 h-3.5" />
            <span>{chip.label}</span>
            {chip.badge && (
              <span className={[
                'font-extrabold text-[9px] px-1.5 py-0.2 rounded-full',
                isActive
                  ? 'bg-white text-[#E60067]'
                  : 'bg-[#E60067] text-white'
              ].join(' ')}>
                {chip.badge}
              </span>
            )}
            {chip.hasPulse && !isActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
