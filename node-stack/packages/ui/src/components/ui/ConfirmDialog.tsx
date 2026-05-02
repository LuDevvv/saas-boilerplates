import React from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "../../utils.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog.js";
import { Button } from "./Button.js";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "default";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default",
}) => {
  const variantStyles = {
    danger: "text-[#EF4F5F] bg-[#EF4F5F]/10",
    warning: "text-[#F4A524] bg-[#F4A524]/10",
    default: "text-[#004080] bg-[#004080]/10 dark:text-[#00E6E6] dark:bg-[#00E6E6]/10",
  };

  const iconVariants = {
    danger: ShieldAlert,
    warning: AlertTriangle,
    default: Trash2,
  };

  const Icon = iconVariants[variant];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center sm:items-start gap-6">
            <div className={cn("flex items-center justify-center w-14 h-14 rounded-2xl", variantStyles[variant])}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
            className="min-w-[120px]"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
