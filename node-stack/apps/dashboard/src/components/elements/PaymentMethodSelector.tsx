import React from "react";
import { CreditCard } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <div className="mb-6 w-full">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        Método de pago
      </label>

      <div
        onClick={() => onSelect("card")}
        className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer group ${selectedMethod === "card"
          ? "border-indigo-600 bg-indigo-50/20 shadow-sm"
          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white"
          }`}
      >
        {/* Radio Indicator */}
        <div
          className={`mr-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${selectedMethod === "card" ? "border-indigo-600" : "border-gray-300"
            }`}
        >
          {selectedMethod === "card" && (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          )}
        </div>

        {/* Icon & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selectedMethod === "card"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-100 text-gray-400"
                }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                Tarjeta de Crédito / Débito
              </p>
              <p className="text-xs text-gray-500 truncate">
                Procesamiento seguro via Stripe
              </p>
            </div>
          </div>
        </div>

        {/* Card Logos - Hidden on mobile, visible on sm+ */}
        <div className="hidden sm:flex items-center gap-3 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all shrink-0 ml-4">
          <img
            src="/payments/visa.png"
            alt="Visa"
            className="w-[34px] h-auto object-contain"
          />
          <img
            src="/payments/mastercard.png"
            alt="Mastercard"
            className="w-[28px] h-auto object-contain"
          />
          <img
            src="/payments/amex.png"
            alt="Amex"
            className="w-[30px] h-auto object-contain scale-110"
          />
        </div>
      </div>
    </div>
  );
};
