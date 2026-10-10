import { create } from 'zustand';

/**
 * Store thông báo toàn cục.
 * - notify({ title, message, type }) → mở modal centered, user phải bấm OK để đóng
 *   type ∈ 'success' | 'error' | 'info' | 'warning'
 * - toast({ title?, message, type, duration? }) → hiện toast góc trên-phải, tự ẩn
 */

let toastId = 0;

export const useNotificationStore = create((set, get) => ({
  toasts: [],
  modal: null, // { title, message, type } | null

  notify: ({ title = '', message = '', type = 'info' } = {}) => {
    set({ modal: { title, message, type } });
  },

  closeModal: () => set({ modal: null }),

  toast: ({ title = '', message = '', type = 'info', duration = 2500 } = {}) => {
    const id = ++toastId;
    const item = { id, title, message, type };
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }
    return id;
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/**
 * Hook tiện ích — gọi trực tiếp mà không cần selector nhiều lần.
 * const { notify, toast } = useNotification();
 */
export function useNotification() {
  const notify = useNotificationStore((s) => s.notify);
  const toast = useNotificationStore((s) => s.toast);
  const closeModal = useNotificationStore((s) => s.closeModal);
  return { notify, toast, closeModal };
}
