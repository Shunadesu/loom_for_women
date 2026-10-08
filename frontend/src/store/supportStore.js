import { create } from 'zustand';

export const useSupportStore = create((set, get) => ({
  // Modal state
  isOpen: false,

  // Mock messages (2 tin nhắn chào từ CSKH)
  messages: [
    {
      id: 'msg-1',
      sender: 'support',
      senderName: 'Loom CSKH Hỗ Trợ Nhanh',
      content: 'Chào chị Mai Hường! Em là CSKH Loom. Chị đang cần hỗ trợ về Khóa học, Hộ chiếu An toàn số hay đăng bán sản phẩm trên Chợ sinh kế ạ?',
      timestamp: '08:00',
    },
    {
      id: 'msg-2',
      sender: 'support',
      senderName: 'Loom CSKH Hỗ Trợ Nhanh',
      content: 'Chị cũng có thể bấm nút gọi đường dây nóng 1800-LOOM (Miễn phí cước) nếu cần hỗ trợ khẩn cấp nhé!',
      timestamp: '08:01',
    },
  ],

  // Actions
  openModal: () => set({ isOpen: true }),
  
  closeModal: () => set({ isOpen: false }),

  // Add user message
  addMessage: (content) => {
    if (!content.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Bạn',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    // Mock auto-reply sau 1-2 giây
    setTimeout(() => {
      const autoReply = {
        id: `msg-${Date.now()}-reply`,
        sender: 'support',
        senderName: 'Loom CSKH Hỗ Trợ Nhanh',
        content: 'Cảm ơn chị đã gửi câu hỏi! Bộ phận CSKH sẽ phản hồi trong vòng 5-10 phút. Vui lòng giữ máy ạ! 😊',
        timestamp: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };

      set((state) => ({
        messages: [...state.messages, autoReply],
      }));
    }, 1500);
  },
}));
