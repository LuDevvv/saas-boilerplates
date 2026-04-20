import { create } from "zustand";

type ModalType = "premium" | "feedback" | "settings"; // Generic boilerplate modals

interface ModalState {
  openModals: Set<ModalType>;
  openModal: (modal: ModalType) => void;
  closeModal: (modal: ModalType) => void;
  closeAllModals: () => void;
  isModalOpen: (modal: ModalType) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  openModals: new Set(),

  openModal: (modal) => {
    set((state) => ({
      openModals: new Set(state.openModals).add(modal),
    }));
  },

  closeModal: (modal) => {
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.delete(modal);
      return { openModals: newSet };
    });
  },

  closeAllModals: () => {
    set({
      openModals: new Set(),
    });
  },

  isModalOpen: (modal) => {
    return get().openModals.has(modal);
  },
}));
