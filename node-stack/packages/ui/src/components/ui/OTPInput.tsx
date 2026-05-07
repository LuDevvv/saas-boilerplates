import React from "react";
import { cn } from "../../utils.js";

interface OTPInputProps {
  length: number;
  code: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  // eslint-disable-next-line no-unused-vars
  onChange: (index: number, value: string) => void;
  // eslint-disable-next-line no-unused-vars
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  // eslint-disable-next-line no-unused-vars
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length,
  code,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
  disabled,
  className,
}) => {
  return (
    <div
      className={cn("flex gap-3 justify-center", className)}
      onPaste={onPaste}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index] ?? ""}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-heading",
            "text-fg bg-white dark:bg-gray-800/50",
            "border-2 border-gray-100 dark:border-gray-700/50 rounded-2xl",
            "transition-all duration-300 ease-out-expo shadow-sm",
            "focus:outline-none focus:border-primary-500 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-950"
          )}
        />
      ))}
    </div>
  );
};
