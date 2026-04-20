import { FC, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/classNames";

interface ModalFooterProps {
  children?: ReactNode;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submittingText?: string;
  formId?: string;
  variant?: "primary" | "danger";
  className?: string;
  disabled?: boolean;
}

export const ModalFooter: FC<ModalFooterProps> = ({
  children,
  onCancel,
  onSubmit,
  submitText,
  cancelText = "Cancelar",
  isSubmitting = false,
  submittingText = "Guardando...",
  formId,
  variant = "primary",
  className,
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row justify-end gap-3 w-full",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full sm:w-auto disabled:opacity-50"
            >
              <span>{cancelText}</span>
            </button>
          )}
          {(onSubmit || formId) && (
            <button
              type={formId ? "submit" : "button"}
              form={formId}
              onClick={onSubmit}
              disabled={disabled || isSubmitting}
              className={cn(
                "flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-2xl transition-all active:scale-95 shadow-xl w-full sm:w-auto",
                variant === "danger"
                  ? isSubmitting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:scale-[1.02] shadow-red-500/20 hover:from-red-600 hover:to-red-700"
                  : isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-[1.02] shadow-blue-500/20"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{submittingText}</span>
                </>
              ) : (
                <span>{submitText}</span>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};
