import { to12HourFormat, to24HourFormat } from "@/helpers/TimeConversion";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/utils/classNames";
import { FC, useEffect, useRef, useState } from "react";

export const TimeInput: FC<{
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  error?: string;
  className?: string;
  hasError?: boolean;
}> = ({ value, onChange, name: _name, label, error, className, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the 24h value into parts
  const parse24h = (val: string) => {
    if (!val || !val.includes(":"))
      return { hour: 8, minute: 0, period: "AM" as const };
    const [h, m] = val.split(":").map(Number);
    const hour24 = h ?? 8;
    const min = m ?? 0;
    const period = hour24 >= 12 ? ("PM" as const) : ("AM" as const);
    const hour12 = hour24 % 12 || 12;
    return { hour: hour12, minute: min, period };
  };

  const { hour, minute, period } = parse24h(value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (h: number, m: number, p: string) => {
    // Convert to 24h and call onChange
    const formatted12 = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )} ${p}`;
    const val24 = to24HourFormat(formatted12);
    onChange(val24);
  };

  const incrementHour = () => {
    const newHour = hour >= 12 ? 1 : hour + 1;
    update(newHour, minute, period);
  };

  const decrementHour = () => {
    const newHour = hour <= 1 ? 12 : hour - 1;
    update(newHour, minute, period);
  };

  const incrementMinute = () => {
    const newMinute = minute >= 55 ? 0 : minute + 5;
    update(hour, newMinute, period);
  };

  const decrementMinute = () => {
    const newMinute = minute <= 0 ? 55 : minute - 5;
    update(hour, newMinute, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    update(hour, minute, newPeriod);
  };

  const showError = hasError || !!error;
  const displayValue = to12HourFormat(value);

  const SpinButton: FC<{
    onUp: () => void;
    onDown: () => void;
    value: string;
    label: string;
  }> = ({ onUp, onDown, value: val, label: lbl }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {lbl}
      </span>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onUp}
          className="p-1 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all active:scale-90"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums w-12 text-center select-none">
          {val}
        </span>
        <button
          type="button"
          onClick={onDown}
          className="p-1 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all active:scale-90"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn("group flex flex-col gap-2", className)}
      ref={containerRef}
    >
      {label && (
        <label className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-focus-within:text-primary-500">
            {label}
          </span>
        </label>
      )}

      <div className="relative">
        {/* Display Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full py-3.5 pl-11 pr-4 text-[15px] text-left",
            "text-gray-900 dark:text-white",
            "bg-white dark:bg-gray-800/50",
            "border-2 rounded-2xl",
            "transition-all duration-300",
            "focus:outline-none",
            showError
              ? "border-red-200 dark:border-red-900/50 focus:border-red-500 shadow-sm"
              : isOpen
                ? "border-primary-500 shadow-sm"
                : "border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md"
          )}
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300">
            <Clock className={cn("w-5 h-5", isOpen && "text-primary-500")} />
          </div>
          <span
            className={cn("font-medium", !displayValue && "text-gray-400/80")}
          >
            {displayValue || "hh:mm AM/PM"}
          </span>
        </button>

        {/* Time Picker Dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-[1000] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-center gap-3">
                {/* Hour */}
                <SpinButton
                  label="Hora"
                  value={String(hour).padStart(2, "0")}
                  onUp={incrementHour}
                  onDown={decrementHour}
                />

                {/* Separator */}
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 mt-5 select-none">
                  :
                </span>

                {/* Minute */}
                <SpinButton
                  label="Min"
                  value={String(minute).padStart(2, "0")}
                  onUp={incrementMinute}
                  onDown={decrementMinute}
                />

                {/* AM/PM Toggle */}
                <div className="flex flex-col items-center gap-1 ml-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    &nbsp;
                  </span>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mt-1 cursor-pointer",
                      "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-2 border-primary-100 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/40"
                    )}
                  >
                    {period}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Select Times */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2.5">
              <div className="flex flex-wrap gap-1 justify-center">
                {[
                  "08:00",
                  "12:00",
                  "18:00",
                  "22:00",
                ].map((time) => {
                  const isSelected = value === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        onChange(time);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 border",
                        isSelected
                          ? "bg-primary-500 text-white border-primary-500 shadow-md transform scale-105"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400"
                      )}
                    >
                      {to12HourFormat(time).replace(/^0/, "").replace(" ", "")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-1 text-xs font-medium animate-in slide-in-from-top-1 duration-300 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
