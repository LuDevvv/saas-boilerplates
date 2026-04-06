import { FC } from "react";
import { AlertCircle } from "lucide-react";
import { ModalLayout } from "@/layouts/ModalLayout";
import { ModalFooter } from "../ui/ModalFooter";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  message,
  onCancel,
  onConfirm,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isProcessing = false,
}) => {
  const defaultMessage = `Esta acción no se puede deshacer. Se eliminará permanentemente "${itemName}" y todos sus datos asociados.`;

  const renderFooter = () => (
    <ModalFooter
      onCancel={onCancel}
      onSubmit={onConfirm}
      isSubmitting={isProcessing}
      submitText={confirmText}
      cancelText={cancelText}
      submittingText="Eliminando..."
      variant="danger"
    />
  );

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={renderFooter()}
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {message || defaultMessage}
          </p>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ConfirmDeleteModal;
