import { useState } from 'react';
import { ClockIcon, ShieldAlertIcon, TriangleAlertIcon, SendIcon } from '../icons/index.jsx';

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

export default function ThreadView({ question, onAddReply }) {
  const [replyText, setReplyText] = useState('');

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Chọn một câu hỏi để xem chi tiết
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(replyText);
      setReplyText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50/60 rounded-2xl p-3 border border-slate-100">
      {/* Question header */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#E60067]">
              #{question.id.toUpperCase()} • {question.category}
            </span>
            <PriorityBadge priority={question.priority} />
          </div>
          
          <h4 className="font-bold text-sm text-slate-900 mt-1">
            {question.title}
          </h4>
          
          <p className="text-xs text-slate-600 mt-1 bg-white p-2.5 rounded-xl border border-slate-100">
            {question.content}
          </p>
        </div>

        {/* Messages thread */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {question.messages.map((message) => {
            const isUser = message.sender === 'user';
            
            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[9px] font-semibold text-slate-400 mb-0.5 px-1">
                  {message.senderName}
                  {message.role && ` • ${message.role}`} • {message.timestamp}
                </span>
                <div
                  className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                    isUser
                      ? 'bg-[#E60067] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply form */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2 pt-2 border-t border-slate-200">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Đặt câu hỏi phụ cho chuyên gia..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E60067]"
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          className="bg-[#E60067] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#c90059] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 shadow-xs transition-colors"
        >
          <SendIcon className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
}
