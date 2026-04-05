import { create } from 'zustand';
import type { Template } from './types';

type ModalMode = 'create' | 'edit';

type TemplatesUIState = {
  modalOpen: boolean;
  modalMode: ModalMode;
  editingTemplate: Template | null;
  openCreateModal: () => void;
  openEditModal: (template: Template) => void;
  closeModal: () => void;
};

export const useTemplatesStore = create<TemplatesUIState>((set) => ({
  modalOpen: false,
  modalMode: 'create',
  editingTemplate: null,
  openCreateModal: () => set({ modalOpen: true, modalMode: 'create', editingTemplate: null }),
  openEditModal: (t) => set({ modalOpen: true, modalMode: 'edit', editingTemplate: t }),
  closeModal: () => set({ modalOpen: false, editingTemplate: null }),
}));
