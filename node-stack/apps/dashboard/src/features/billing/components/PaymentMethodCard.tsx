import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Plus, Trash2, Star } from "lucide-react";
import { FC, useState, useEffect, ReactNode } from "react";

import { cn } from "@/utils/classNames";

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodCardProps {
  methods: PaymentMethod[];
  isLoading?: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

// ─── Brand logos ──────────────────────────────────────────────────────────────

function getBrandBg(type: string): string {
  switch (type.toLowerCase()) {
    case "visa":       return "from-[#1A1F71] to-[#0A0E40]";
    case "mastercard": return "from-[#1C1C1C] to-[#0D0D0D]";
    case "amex":       return "from-[#006FCF] to-[#003087]";
    case "paypal":     return "from-[#003087] to-[#001F5A]";
    case "discover":   return "from-[#E65C00] to-[#C44800]";
    default:           return "from-[#374151] to-[#1F2937]";
  }
}

function getBrandMark(type: string): ReactNode {
  switch (type.toLowerCase()) {
    case "visa":
      return (
        <span className="text-white/90 text-[9px] font-black italic">
          VISA
        </span>
      );
    case "mastercard":
      return (
        <div className="flex items-center">
          <div className="h-[14px] w-[14px] rounded-full bg-[#EB001B] opacity-90" />
          <div className="h-[14px] w-[14px] rounded-full bg-[#F79E1B] opacity-85 -ml-[6px]" />
        </div>
      );
    case "amex":
      return (
        <span className="text-white/80 text-[6px] font-bold">AMEX</span>
      );
    case "paypal":
      return (
        <span className="text-white/80 text-[7px] font-bold">PayPal</span>
      );
    case "discover":
      return (
        <div className="h-[10px] w-[10px] rounded-full bg-[#F79E1B] opacity-90" />
      );
    default:
      return null;
  }
}

// ─── Card thumbnail — realistic mini credit card ──────────────────────────────

const CardThumbnail: FC<{ type: string; last4: string }> = ({ type, last4 }) => {
  return (
    <div className={cn(
      "h-[52px] w-[80px] rounded-[8px] bg-gradient-to-br flex flex-col justify-between p-2 shrink-0 relative overflow-hidden",
      getBrandBg(type)
    )}>
      {/* Subtle top-left shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />

      {/* EMV chip — gold metallic */}
      <div
        className="h-[11px] w-[15px] rounded-[2px] relative z-10"
        style={{ background: "linear-gradient(135deg, #D4AF37 0%, #B8920A 50%, #D4AF37 100%)" }}
      />

      {/* Bottom row: number dots + last4 + brand mark */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map(g => (
            <div key={g} className="flex gap-[1.5px]">
              {[0, 1, 2, 3].map(d => (
                <div key={d} className="h-[2.5px] w-[2.5px] rounded-full bg-white/40" />
              ))}
            </div>
          ))}
          <span className="text-white/85 text-[6px] font-mono ml-1.5">{last4}</span>
        </div>
        <div className="shrink-0 ml-1">{getBrandMark(type)}</div>
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyMethods: FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
    <div className="h-12 w-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
      <Plus className="h-5 w-5 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-[13px] font-semibold text-fg">Sin métodos de pago</p>
    <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
      Añade una tarjeta para gestionar tu suscripción.
    </p>
    <button
      onClick={onAdd}
      className="mt-4 h-9 px-5 rounded-xl text-white text-[12px] font-medium active:scale-[0.98] transition-all"
      style={{ background: "linear-gradient(to right, #4D94DB, #004080)" }}
    >
      Añadir tarjeta
    </button>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const MethodSkeleton: FC = () => (
  <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
    <div className="h-[52px] w-[80px] rounded-[8px] bg-surface-hover shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-36 rounded-full bg-surface-hover" />
      <div className="h-3 w-24 rounded-full bg-surface-hover" />
    </div>
    <div className="h-8 w-8 rounded-lg bg-surface-hover shrink-0" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const PaymentMethodCard: FC<PaymentMethodCardProps> = ({
  methods,
  isLoading,
  onAdd,
  onDelete,
  onSetDefault,
}) => {
  // Local ordered list — default card always floats to top with animation
  const [ordered, setOrdered] = useState<PaymentMethod[]>([]);
  const [listRef] = useAutoAnimate<HTMLDivElement>({ duration: 350 });

  useEffect(() => {
    setOrdered([...methods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)));
  }, [methods]);

  const handleSetDefault = (id: string) => {
    setOrdered(prev => {
      const target = prev.find(m => m.id === id);
      if (!target) return prev;
      return [
        { ...target, isDefault: true },
        ...prev.filter(m => m.id !== id).map(m => ({ ...m, isDefault: false })),
      ];
    });
    onSetDefault?.(id);
  };

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-fg">
          Métodos de pago
        </h3>
        {ordered.length > 0 && (
          <span className="text-[12px] text-gray-400">
            {ordered.length} guardado{ordered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <>
          <MethodSkeleton />
          <MethodSkeleton />
        </>
      ) : ordered.length === 0 ? (
        <EmptyMethods onAdd={onAdd} />
      ) : (
        <>
          {/* Animated list */}
          <div ref={listRef} className="divide-y divide-border flex-1">
            {ordered.map(method => (
              <div
                key={method.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors duration-150"
              >
                <CardThumbnail type={method.type} last4={method.last4} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-fg leading-snug">
                      {method.type} •••• {method.last4}
                    </p>
                    {method.isDefault && (
                      <span className="text-[10px] font-bold uppercase text-primary bg-primary/[0.08] dark:bg-primary/15 px-1.5 py-0.5 rounded-md shrink-0">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-fg-muted mt-0.5">
                    Expira {method.expiry}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onSetDefault && !method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      title="Establecer como principal"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all active:scale-90"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(method.id)}
                    title="Eliminar método"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dashed add button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={onAdd}
              className="w-full h-11 rounded-xl border-2 border-dashed border-border hover:border-primary/40 dark:hover:border-primary/30 flex items-center justify-center gap-2 text-[13px] font-medium text-gray-400 hover:text-primary transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Añadir método de pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};
