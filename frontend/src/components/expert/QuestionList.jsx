import { ClockIcon, ShieldAlertIcon, TriangleAlertIcon } from '../icons/index.jsx';
import { formatRelativeTime } from '../../data/mockExpertQA.js';

function PriorityBadge({ priority }) {
  const badges = {
    urgent: {
      label: 'Khẩn cấp',
      className: 'bg-red-100 text-red-700 border-red-200',
      Icon: ShieldAlertIcon,
    },
    high: {
      label: 'Gấp',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      Icon: TriangleAlertIcon,
    },
    normal: {
      label: 'Bình thường',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Icon: ClockIcon,
    },
  };

  const badge = badges[priority] || badges.normal;
  const { Icon } = badge;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge.className}`}>
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

export default function QuestionList({ questions, selectedId, onSelect }) {
  return (
    <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-3 space-y-2 max-h-48 md:max-h-full overflow-y-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        Danh sách câu hỏi
      </p>
      
      {questions.map((question) => {
        const isSelected = question.id === selectedId;
        const isAnswered = question.status === 'answered';
        
        return (
          <button
            key={question.id}
            onClick={() => onSelect(question.id)}
            className={`w-full text-left p-2.5 rounded-2xl border transition-all ${
              isSelected
                ? 'border-[#E60067] bg-pink-50/70 shadow-xs'
                : 'border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#E60067]">
                {question.category}
              </span>
              <PriorityBadge priority={question.priority} />
            </div>
            
            <p className="text-xs font-bold text-slate-800 line-clamp-1">
              {question.title}
            </p>
            
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
              <span>{formatRelativeTime(question.updatedAt)}</span>
              <span className="flex items-center gap-0.5 font-semibold text-slate-600">
                {isAnswered ? '✅ Đã giải đáp' : '⏳ Đang chờ'}
              </span>
            </div>
          </button>
        );
      })}
      
      {questions.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Chưa có câu hỏi nào
        </div>
      )}
    </div>
  );
}
