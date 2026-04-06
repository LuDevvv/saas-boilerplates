import { useModalStore } from "@/stores/modalStore";

export const useModal = () => {
  const {
    isModalOpen,
    openModal,
    closeModal,
    closeAllModals,
    modalData,
    getModalData,
  } = useModalStore();

  return {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
    closeAll: closeAllModals,
    getData: getModalData,
  };
};