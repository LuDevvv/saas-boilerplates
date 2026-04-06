import { type LabelHTMLAttributes, type FC } from "react";
import { cn } from "@utils/classNames";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: FC<LabelProps> = ({
  children,
  required,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
