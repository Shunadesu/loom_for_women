import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareIcon, SparklesIcon, XMarkIcon } from '../icons/index.jsx';
import { useExpertQAStore } from '../../store/expertQAStore.js';
import QuestionList from './QuestionList.jsx';
import ThreadView from './ThreadView.jsx';
import NewQuestionForm from './NewQuestionForm.jsx';

export default function ExpertQAModal() {
  const {
    isOpen,
    activeTab,
    questions,
    selectedQuestionId,
    closeModal,
    setActiveTab,
    selectQuestion,
    addQuestion,
    addReply,
    getSelectedQuestion,
  } = useExpertQAStore();

  const [unreadCount] = useState(3); // Mock unread count

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

  const selectedQuestion = getSelectedQuestion();

  const handleNewQuestion = (formData) => {
    addQuestion(formData);
    // Switch to inbox tab to see the new question
    setActiveTab('inbox');
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E60067] to-rose-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquareIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm leading-tight">
                      Hòm thư Hỏi Đáp Chuyên Gia
                    </h3>
                    <p className="text-[10px] text-pink-100">
                      Inbox trực tiếp với chuyên gia An ninh mạng & Tài chính Loom
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

              {/* Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50 px-4 pt-2 gap-2">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'inbox'
                      ? 'border-[#E60067] text-[#E60067]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>💬 Inbox Chuyên gia</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#E60067] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'new'
                      ? 'border-[#E60067] text-[#E60067]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>✍️ Đặt Câu Hỏi Mới</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'inbox' ? (
                  <div className="flex flex-col md:flex-row gap-4 h-full">
                    <QuestionList
                      questions={questions}
                      selectedId={selectedQuestionId}
                      onSelect={selectQuestion}
                    />
                    <ThreadView
                      question={selectedQuestion}
                      onAddReply={addReply}
                    />
                  </div>
                ) : (
                  <NewQuestionForm
                    onSubmit={handleNewQuestion}
                    onCancel={() => setActiveTab('inbox')}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
