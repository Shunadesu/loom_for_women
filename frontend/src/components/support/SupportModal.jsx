import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon, PhoneCallIcon, SendIcon } from '../icons/index.jsx';
import { useSupportStore } from '../../store/supportStore.js';

export default function SupportModal() {
  const { isOpen, messages, closeModal, addMessage } = useSupportStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      addMessage(messageText);
      setMessageText('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[80vh]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E60067] to-rose-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E60067] p-1 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                    <img
                      src="https://drive.google.com/thumbnail?id=1asdIo2tmk_ouFc-psQb51vzMoAFOPNXP&sz=w1000"
                      alt="Loom Logo"
                      className="w-full h-full object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm leading-tight">
                        Inbox Hỗ Trợ Loom
                      </h3>
                      <span className="bg-emerald-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                        • Trực tuyến
                      </span>
                    </div>
                    <p className="text-[10px] text-pink-100">
                      Hỗ trợ kỹ thuật, khóa học &amp; rút thưởng
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Đóng"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Info Banner */}
              <div className="bg-pink-50 border-b border-pink-100 px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-pink-900 flex items-center gap-1">
                  <ShieldCheckIcon className="w-4 h-4 text-[#E60067]" />
                  <span>Hỗ trợ miễn phí cho công nhân 24/7</span>
                </span>
                <a
                  href="tel:18000000"
                  className="bg-white hover:bg-slate-50 text-[#E60067] font-bold text-[10px] px-2.5 py-1 rounded-full border border-pink-200 flex items-center gap-1 shadow-xs transition-colors"
                >
                  <PhoneCallIcon className="w-3 h-3" />
                  <span>Gọi 1800-LOOM</span>
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
                {messages.map((message) => {
                  const isUser = message.sender === 'user';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] font-semibold text-slate-400 mb-0.5 px-1">
                        {message.senderName} • {message.timestamp}
                      </span>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#E60067] text-white rounded-br-none font-medium'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none font-normal'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập câu hỏi hỗ trợ gửi cho Loom..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#E60067] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-[#E60067] hover:bg-[#c90059] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
