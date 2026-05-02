import { FC } from "react";
import { Plus } from "lucide-react";
import { Button, Card } from "@node-stack/ui";

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodCardProps {
  methods: PaymentMethod[];
  onAdd: () => void;
  onEdit: (method: PaymentMethod) => void;
  className?: string;
}

export const PaymentMethodCard: FC<PaymentMethodCardProps> = ({
  methods,
  onAdd,
  onEdit,
  className,
}) => {
  const defaultMethod = methods.find(m => m.isDefault) || methods[0];
  
  if (!defaultMethod) {
    return (
      <Card className="card-premium p-6 flex flex-col h-full border-[var(--border)] shadow-sm bg-[var(--surface)]">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-gray-500 mb-4">No tienes métodos de pago</p>
          <Button onClick={onAdd} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Añadir método de pago
          </Button>
        </div>
      </Card>
    );
  }

  const logoPath = `/payments/${defaultMethod.type.toLowerCase()}.png`;

  return (
    <Card className={`card-premium p-6 flex flex-col h-full border-[var(--border)] shadow-sm bg-[var(--surface)] ${className || ""}`}>
      <div className="flex items-start justify-between w-full mb-8">
        <div className="flex items-center gap-5">
          <div className="relative h-14 w-20 shrink-0 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)] p-3 flex items-center justify-center shadow-sm overflow-hidden">
            <img
              src={logoPath}
              alt={defaultMethod.type}
              className="h-full w-full object-contain relative z-10 filter contrast-[1.1]"
            />
          </div>
          <div>
            <p className="text-[10px] font-label uppercase text-gray-400">Método de Pago</p>
            <h3 className="text-lg font-heading text-gray-950 dark:text-white">
              {defaultMethod.type} •••• {defaultMethod.last4}
            </h3>
            <p className="text-[10px] font-label text-gray-400 uppercase mt-0.5">Expira {defaultMethod.expiry}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(defaultMethod)}
          className="rounded-xl h-9 px-4 text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 active:scale-95 font-label uppercase text-[10px]"
        >
          Editar
        </Button>
      </div>

      <div className="mt-auto pt-8 pb-4 flex items-center justify-between border-t border-[var(--border)]">
        <p className="text-[9px] font-label text-gray-400 uppercase">Gestionar otros métodos</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-[10px] font-label uppercase text-gray-900 dark:text-white hover:text-[var(--primary)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir Nuevo
        </button>
      </div>
    </Card>
  );
};