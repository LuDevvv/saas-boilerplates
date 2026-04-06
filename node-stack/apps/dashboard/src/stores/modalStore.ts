import { create } from "zustand";

type ModalType = string;

interface ModalState {
  openModals: Set<ModalType>;
  previousModal: ModalType | null;
  modalData: Record<string, unknown>;

  openModal: (modal: ModalType, data?: unknown) => void;
  closeModal: (modal: ModalType) => void;
  closeAllModals: () => void;
  isModalOpen: (modal: ModalType) => boolean;

  setPreviousModal: (modal: ModalType | null) => void;
  getModalData: <T = unknown>(modal: string) => T | undefined;
}

export const useModalStore = create<ModalState>((set, get) => ({
  openModals: new Set(),
  previousModal: null,
  modalData: {},

  setPreviousModal: (modal) => set({ previousModal: modal }),

  openModal: (modal, data) => {
    set((state) => ({
      openModals: new Set(state.openModals).add(modal),
      modalData: data ? { ...state.modalData, [modal]: data } : state.modalData,
    }));
  },

  closeModal: (modal) => {
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.delete(modal);
      const newData = { ...state.modalData };
      delete newData[modal];
      return { openModals: newSet, modalData: newData };
    });
  },

  closeAllModals: () => {
    set({ openModals: new Set(), previousModal: null, modalData: {} });
  },

  isModalOpen: (modal) => get().openModals.has(modal),

  getModalData: <T = unknown>(modal: string) => get().modalData[modal] as T | undefined,
}));