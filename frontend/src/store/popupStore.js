import { create } from 'zustand';

export const usePopupStore = create((set) => ({
  // 'welcome' | 'register' | 'closed' | null
  step: null,
  init: () => {
    const seen = sessionStorage.getItem('popup_completed');
    set({ step: seen ? 'closed' : 'welcome' });
  },
  next: () => set({ step: 'register' }),
  close: () => {
    sessionStorage.setItem('popup_completed', 'true');
    set({ step: 'closed' });
  },
  reset: () => {
    sessionStorage.removeItem('popup_completed');
    set({ step: 'welcome' });
  },
}));