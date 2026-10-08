import { create } from 'zustand';

export const useForumStore = create((set) => ({
  isOpen: false,
  openForum: () => set({ isOpen: true }),
  closeForum: () => set({ isOpen: false }),
}));
