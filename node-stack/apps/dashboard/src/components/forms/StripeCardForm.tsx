import { useState, memo, useCallback } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/form/Button";

// Robust error translation
const ERROR_TRANSLATIONS: Record<string, string> = {
  "Your card number is incomplete.": "El número de tarjeta está incompleto.",
  "Your card number is invalid.": "El número de tarjeta no es válido.",
  "Your card's expiration date is incomplete.":
    "La fecha de expiración está incompleta.",
  "Your card's expiration date is invalid.":
    "La fecha de expiración no es válida.",
  "Your card's security code is incomplete.": "El código CVV está incompleto.",
  "Your card's security code is invalid.": "El código CVV no es válido.",
  "Your card has expired.": "Tu tarjeta ha expirado.",
  "Your card was declined.": "Tu tarjeta fue rechazada.",
  "Your card has insufficient funds.": "Fondos insuficientes.",
  "An error occurred while processing your card.":
    "Error al procesar la tarjeta.",
};

// Premium styling for Stripe Elements
const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1F2937",
      letterSpacing: "0.025em",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": { color: "#9CA3AF" },
      iconColor: "#9CA3AF",
    },
    invalid: { color: "#EF4444", iconColor: "#EF4444" },
  },
};

interface StripeCardFormProps {
  onComplete: (paymentMethodId: string) => Promise<void> | void;
  label?: string;
}

const StripeCardForm = ({
  onComplete,
  label = "Guardar",
}: StripeCardFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const translateError = useCallback((errorMessage: string): string => {
    return ERROR_TRANSLATIONS[errorMessage] || errorMessage;
  }, []);

  const handleChange = useCallback(
    (event: any) => {
      setCardError(event.error ? translateError(event.error.message) : null);
    },
    [translateError]
  );

  const handleSubmit = useCallback(async () => {
    if (loading || !stripe || !elements) return;

    setLoading(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement)
        throw new Error("No se pudo acceder al formulario de tarjeta.");

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) throw error;
      if (!paymentMethod) throw new Error("No se generó el método de pago.");

      await onComplete(paymentMethod.id);
    } catch (err: any) {
      setCardError(
        translateError(err.message) || "Error desconocido al procesar el pago"
      );
    } finally {
      setLoading(false);
    }
  }, [stripe, elements, loading, onComplete, translateError]);

  if (!stripe || !elements) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Helper to determine ring color based on focus/error
  const getContainerClass = (fieldName: string) => `
    relative flex items-center bg-white dark:bg-gray-950
    border-[1px] rounded-2xl transition-all duration-300
    ${cardError
      ? "border-red-500 shadow-sm"
      : focusedField === fieldName
        ? "border-primary-500 ring-2 ring-primary-500/10 shadow-sm"
        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm"
    }
  `;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">
      {/* Card Number */}
      <div className="group flex flex-col gap-1.5 w-full">
        <label className="px-1 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Número de Tarjeta
        </label>
        <div className={getContainerClass("cardNumber")}>
          <div className="pl-4 pr-1 text-gray-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="flex-1 p-3.5">
            <CardNumberElement
              options={{ ...ELEMENT_OPTIONS, showIcon: false }}
              onChange={handleChange}
              onFocus={() => setFocusedField("cardNumber")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expiry */}
        <div className="group flex flex-col gap-1.5 w-full">
          <label className="px-1 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Vencimiento
          </label>
          <div className={getContainerClass("cardExpiry")}>
            <div className="pl-4 pr-1 text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1 p-3.5">
              <CardExpiryElement
                options={ELEMENT_OPTIONS}
                onChange={handleChange}
                onFocus={() => setFocusedField("cardExpiry")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
        </div>

        {/* CVC */}
        <div className="group flex flex-col gap-1.5 w-full">
          <label className="px-1 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Código CVC
          </label>
          <div className={getContainerClass("cardCvc")}>
            <div className="pl-4 pr-1 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 p-3.5">
              <CardCvcElement
                options={ELEMENT_OPTIONS}
                onChange={handleChange}
                onFocus={() => setFocusedField("cardCvc")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {cardError && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-lg p-3 flex items-start gap-2 border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        className="mt-4 py-4 text-base font-black rounded-2xl active:scale-95 transition-all shadow-xl shadow-primary-500/20"
      >
        {label === "Guardar" ? "Guardar" : label}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-[9px] text-gray-400 dark:text-gray-500 py-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-bold uppercase tracking-widest">Pago 100% Seguro vía SSL</span>
      </div>
    </div>
  );
};

export default memo(StripeCardForm);
