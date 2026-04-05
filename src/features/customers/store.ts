import { create } from 'zustand';

type CustomersUIState = {
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useCustomersStore = create<CustomersUIState>((set) => ({
  modalOpen: false,
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}));
