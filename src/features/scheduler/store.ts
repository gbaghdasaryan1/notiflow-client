import { create } from 'zustand';

type SchedulerUIState = {
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useSchedulerStore = create<SchedulerUIState>((set) => ({
  modalOpen: false,
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}));
