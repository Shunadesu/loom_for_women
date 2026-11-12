import {
  ShieldIcon,
  CalendarIcon,
  QuestionMarkIcon,
  ShareIcon,
  BookOpenIcon,
  PhoneCallIcon,
} from '../icons/index.jsx';

const CHIPS = [
  { id: 'passport', label: 'Hộ Chiếu An Toàn', Icon: ShieldIcon },
  { id: 'workshop', label: 'Workshop', Icon: CalendarIcon, badge: 3 },
  { id: 'expert', label: 'Hỏi Chuyên Gia', Icon: QuestionMarkIcon, badge: 3 },
  { id: 'forum', label: 'Diễn Đàn', Icon: ShareIcon, badge: 3 },
  { id: 'documents', label: 'Tài Liệu Đã Lưu', Icon: BookOpenIcon },
  { id: 'support', label: 'Hỗ Trợ 24/7', Icon: PhoneCallIcon, tone: 'emerald' },
];

export default function PassportChips({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
      {CHIPS.map((chip) => {
        const isActive = activeTab === chip.id;
        const Icon = chip.Icon;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={[
              'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full py-2 px-3.5 text-center text-xs font-bold transition-all',
              isActive
                ? 'bg-[#E60067] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            <Icon
              aria-hidden="true"
              className={`h-3.5 w-3.5 ${!isActive && chip.tone === 'emerald' ? 'text-emerald-600' : ''}`}
            />
            <span>
              {chip.label}
              {typeof chip.badge === 'number' && chip.badge > 0 ? ` (${chip.badge})` : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
