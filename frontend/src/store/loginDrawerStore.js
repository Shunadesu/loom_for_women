import { create } from 'zustand';

export const useLoginDrawerStore = create((set) => ({
  isOpen: false,
  redirectPath: '/',
  
  openLoginDrawer: (redirectPath = '/') => 
    set({ isOpen: true, redirectPath }),
  
  closeLoginDrawer: () => 
    set({ isOpen: false }),
}));
