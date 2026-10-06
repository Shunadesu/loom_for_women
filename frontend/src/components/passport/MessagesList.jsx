import { MessageCircleIcon, ClockIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';

export default function MessagesList() {
  const myMessages = usePassportStore((s) => s.myMessages);
  const unreadCount = myMessages.filter((m) => m.unread > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <MessageCircleIcon className="w-4 h-4 text-[#E60067]" />
          Tin nhắn từ khách hàng
        </h3>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold text-[#E60067]">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {myMessages.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-xs">Chưa có tin nhắn nào</p>
        </div>
      ) : (
        <>
          {myMessages.map((msg) => (
            <button
              key={msg._id}
              className="w-full bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-pink-200 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <img
                  src={msg.avatar}
                  alt={msg.from}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{msg.from}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{msg.time}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{msg.lastMessage}</p>
                </div>
                {msg.unread > 0 && (
                  <span className="bg-[#E60067] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {msg.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </>
      )}

      <div className="text-center">
        <p className="text-[10px] text-slate-400 italic">
          Tính năng chat đầy đủ sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}
