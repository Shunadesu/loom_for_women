import { create } from 'zustand';
import { MOCK_QUESTIONS } from '../data/mockExpertQA.js';

export const useExpertQAStore = create((set, get) => ({
  // Modal state
  isOpen: false,
  activeTab: 'inbox', // 'inbox' | 'new'

  // Questions data
  questions: MOCK_QUESTIONS,
  selectedQuestionId: MOCK_QUESTIONS[0]?.id || null,

  // Actions
  openModal: () => set({ isOpen: true }),
  
  closeModal: () => set({ isOpen: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  selectQuestion: (questionId) => set({ selectedQuestionId: questionId }),

  // Get selected question with messages
  getSelectedQuestion: () => {
    const { questions, selectedQuestionId } = get();
    return questions.find((q) => q.id === selectedQuestionId) || null;
  },

  // Add new question (mock - chỉ thêm vào local state)
  addQuestion: (questionData) => {
    const newQuestion = {
      id: `qa-${Date.now()}`,
      ...questionData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `m-${Date.now()}-1`,
          sender: 'user',
          senderName: 'Bạn',
          content: questionData.content,
          timestamp: new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        },
      ],
    };
    
    set((state) => ({
      questions: [newQuestion, ...state.questions],
      selectedQuestionId: newQuestion.id,
      activeTab: 'inbox',
    }));
  },

  // Add reply to selected question (mock)
  addReply: (content) => {
    const { selectedQuestionId } = get();
    if (!selectedQuestionId || !content.trim()) return;

    set((state) => ({
      questions: state.questions.map((q) => {
        if (q.id === selectedQuestionId) {
          const newMessage = {
            id: `m-${Date.now()}`,
            sender: 'user',
            senderName: 'Bạn',
            content: content.trim(),
            timestamp: new Date().toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
          };
          return {
            ...q,
            messages: [...q.messages, newMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      }),
    }));
  },
}));
