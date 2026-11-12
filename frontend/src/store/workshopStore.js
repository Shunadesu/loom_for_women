import { create } from 'zustand';
import { MOCK_WORKSHOPS } from '../data/mockWorkshops.js';

export const useWorkshopStore = create((set, get) => ({
  isOpen: false,
  activeFilter: 'all', // 'all' | category string | 'mine'
  workshops: MOCK_WORKSHOPS,
  myTickets: [], // [workshopId]

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setFilter: (filter) => set({ activeFilter: filter }),

  register: (workshopId) => {
    const { myTickets } = get();
    if (myTickets.includes(workshopId)) return;
    set((state) => ({
      myTickets: [...state.myTickets, workshopId],
      workshops: state.workshops.map((w) =>
        w.id === workshopId
          ? { ...w, registered: Math.min(w.capacity, w.registered + 1) }
          : w
      ),
    }));
  },

  cancel: (workshopId) => {
    set((state) => ({
      myTickets: state.myTickets.filter((id) => id !== workshopId),
      workshops: state.workshops.map((w) =>
        w.id === workshopId
          ? { ...w, registered: Math.max(0, w.registered - 1) }
          : w
      ),
    }));
  },

  getFiltered: () => {
    const { workshops, activeFilter, myTickets } = get();
    if (activeFilter === 'mine') {
      return workshops.filter((w) => myTickets.includes(w.id));
    }
    if (activeFilter === 'all') return workshops;
    return workshops.filter((w) => w.category === activeFilter);
  },
}));
