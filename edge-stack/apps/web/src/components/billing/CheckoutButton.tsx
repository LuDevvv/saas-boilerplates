import React from "react";
import { Button, cn } from "@workspace/ui";
import { Loader2, Activity } from "lucide-react";

interface CheckoutButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  isProcessing: boolean;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  children: React.ReactNode;
  className?: string;
}

/**
 * Specialized button for payment checkout with EdgeStack premium aesthetics.
 */
export function CheckoutButton({
  onClick,
  isLoading,
  isProcessing,
  variant = "default",
  children,
  className,
}: CheckoutButtonProps) {
  return (
    <div className="relative group/checkout w-full">
      {variant === "default" && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-blue))] rounded-2xl blur opacity-25 group-hover/checkout:opacity-50 transition duration-500" />
      )}
      <Button
        className={cn(
          "relative w-full text-[13px] font-black uppercase tracking-[0.2em] italic min-h-[64px] rounded-2xl transition-all duration-500",
          variant === "default" &&
            "bg-[#1A1D1F] hover:bg-black text-white shadow-2xl border-none",
          className,
        )}
        variant={variant}
        onClick={onClick}
        disabled={isLoading || isProcessing}
      >
        <div className="flex items-center justify-center gap-3">
          {isProcessing ? (
            <>
              <Loader2
                className="h-5 w-5 animate-spin text-[hsl(var(--brand-primary))]"
                strokeWidth={3}
              />
              <span className="animate-pulse">
                Redirecting to Secure Gateway...
              </span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 opacity-0 group-hover/checkout:opacity-100 transition-opacity duration-300" />
              {children}
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
