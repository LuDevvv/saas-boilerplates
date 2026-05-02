import React, { useState, useEffect } from "react";
import { Input, type InputProps } from "./Input.js";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "../../utils.js";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showStrength?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = true, value, onChange, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState({
      length: false,
      special: false,
      number: false,
      case: false,
    });

    const password = typeof value === "string" ? value : "";

    useEffect(() => {
      const checks = {
        length: password.length >= 12,
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        number: /[0-9]/.test(password),
        case: /[a-z]/.test(password) && /[A-Z]/.test(password),
      };

      setRequirements(checks);

      let score = 0;
      if (checks.length) score++;
      if (checks.special) score++;
      if (checks.number) score++;
      if (checks.case) score++;

      setStrength(score);
    }, [password]);

    const getStrengthColor = () => {
      if (strength === 0) return "bg-[#E2E8F0] dark:bg-[#FFFFFF]/5";
      if (strength <= 1) return "bg-[#EF4F5F]";
      if (strength <= 3) return "bg-[#F4A524]";
      return "bg-[#00E6E6]";
    };

    const getStrengthLabel = () => {
      if (strength === 0) return "";
      if (strength <= 1) return "Weak";
      if (strength <= 3) return "Fair";
      return "Strong";
    };

    return (
      <div className="flex flex-col gap-4">
        <Input
          {...props}
          ref={ref}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          rightElement={
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="text-[#64748B] hover:text-[#004080] dark:text-[#94A3B8] dark:hover:text-[#00E6E6] transition-colors"
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {showStrength && password.length > 0 && (
          <div className="flex flex-col gap-4 p-5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#FFFFFF]/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-label uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8]">
                Your Password must include
              </span>
              <div className="flex flex-col gap-2">
                <RequirementItem label="At least 12 characters" met={requirements.length} />
                <RequirementItem label="At least one special character" met={requirements.special} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-label text-[#64748B] dark:text-[#94A3B8]">
                  Password Strength
                </span>
                <span className={cn(
                  "text-[11px] font-label",
                  strength <= 1 ? "text-[#EF4F5F]" : strength <= 3 ? "text-[#F4A524]" : "text-[#00E6E6]"
                )}>
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="flex gap-1.5 h-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-500",
                      i <= strength ? getStrengthColor() : "bg-[#E2E8F0] dark:bg-[#FFFFFF]/5"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={cn(
      "flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300",
      met ? "bg-[#00E6E6]/10 text-[#00E6E6]" : "bg-[#E2E8F0] dark:bg-[#FFFFFF]/5 text-[#64748B]/30"
    )}>
      {met ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
    </div>
    <span className={cn(
      "text-[13px] transition-all duration-300",
      met ? "text-[#0F172A] dark:text-[#F8FAFC]" : "text-[#64748B] dark:text-[#94A3B8]"
    )}>
      {label}
    </span>
  </div>
);

PasswordInput.displayName = "PasswordInput";
