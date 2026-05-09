import { FC, useState, useMemo } from "react";
import { FileText, Download, Receipt } from "lucide-react";
import { Badge, FilterTabs, SearchInput } from "@node-stack/ui";
import { cn } from "@/utils/classNames";

export interface PaymentRecord {
  id: string;
  number?: string;
  date: string;
  amount: string;
  status: string;
  method?: string;
  pdfUrl?: string;
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
  isLoading?: boolean;
  className?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "all",       label: "Todos" },
  { value: "Pagado",    label: "Pagados" },
  { value: "Pendiente", label: "Pendientes" },
  { value: "Anulado",   label: "Anulados" },
];

function getStatusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s === "pagado" || s === "paid")     return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  if (s === "pendiente" || s === "pending") return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  return "bg-gray-100 text-gray-500 dark:bg-white/[0.08] dark:text-gray-400";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRow: FC = () => (
  <div className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
    <div className="h-8 w-8 rounded-lg bg-surface-hover shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-28 rounded-full bg-surface-hover" />
      <div className="sm:hidden h-3 w-36 rounded-full bg-surface-hover" />
    </div>
    <div className="hidden sm:block h-3.5 w-20 rounded-full bg-surface-hover" />
    <div className="hidden sm:block h-3.5 w-16 rounded-full bg-surface-hover" />
    <div className="hidden sm:block h-5 w-14 rounded-full bg-surface-hover" />
    <div className="h-8 w-8 rounded-lg bg-surface-hover shrink-0" />
  </div>
);

// ─── Invoice row ──────────────────────────────────────────────────────────────

const InvoiceRow: FC<{ payment: PaymentRecord }> = ({ payment }) => (
  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors duration-150">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="h-8 w-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
        <FileText className="h-4 w-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-fg truncate font-mono">
          {payment.number || payment.id}
        </p>
        <p className="sm:hidden text-[11px] text-gray-400 mt-0.5">
          {payment.date} · <span className="font-semibold text-fg">{payment.amount}</span>
        </p>
      </div>
    </div>

    <span className="hidden sm:block w-28 text-[12px] text-fg-muted shrink-0">
      {payment.date}
    </span>
    <span className="hidden sm:block w-20 text-[13px] font-semibold text-fg tabular-nums shrink-0">
      {payment.amount}
    </span>

    <div className="hidden sm:flex w-20 shrink-0">
      <Badge className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border-none whitespace-nowrap", getStatusStyle(payment.status))}>
        {payment.status}
      </Badge>
    </div>

    <div className="sm:hidden shrink-0">
      <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border-none", getStatusStyle(payment.status))}>
        {payment.status}
      </Badge>
    </div>

    <button
      onClick={() => payment.pdfUrl && window.open(payment.pdfUrl, "_blank")}
      disabled={!payment.pdfUrl}
      title={payment.pdfUrl ? "Descargar factura" : "PDF no disponible"}
      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed"
    >
      <Download className="h-4 w-4" />
    </button>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyInvoices: FC<{ hasSearch: boolean }> = ({ hasSearch }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
    <div className="h-12 w-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
      <Receipt className="h-5 w-5 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-[13px] font-semibold text-fg-secondary">
      {hasSearch ? "Sin resultados" : "Sin facturas aún"}
    </p>
    <p className="text-[12px] text-gray-400 mt-1">
      {hasSearch
        ? "Prueba con otro número de referencia o fecha."
        : "Las facturas de tus pagos aparecerán aquí."}
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const PaymentHistory: FC<PaymentHistoryProps> = ({
  payments,
  isLoading,
  className,
}) => {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = payments;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.number || p.id).toLowerCase().includes(q) ||
        p.amount.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [payments, search, statusFilter]);

  return (
    <div className={cn(
      "rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <h3 className="text-[14px] font-semibold text-fg shrink-0">
          Historial de facturas
        </h3>
        {payments.length > 0 && (
          <span className="text-[12px] text-gray-400 shrink-0">
            {filtered.length} de {payments.length}
          </span>
        )}
      </div>

      {/* Search + filters */}
      {(isLoading || payments.length > 0) && (
        <div className="px-5 py-3 border-b border-border space-y-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por referencia, monto o fecha..."
            size="sm"
          />
          {/* Status filter */}
          <FilterTabs
            size="sm"
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filtrar facturas por estado"
            options={STATUS_FILTERS}
          />
        </div>
      )}

      {/* Column headers — desktop */}
      {(isLoading || filtered.length > 0) && (
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b border-border bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex-1 text-[11px] font-bold uppercase text-gray-400">Referencia</div>
          <div className="w-28 text-[11px] font-bold uppercase text-gray-400">Fecha</div>
          <div className="w-20 text-[11px] font-bold uppercase text-gray-400">Monto</div>
          <div className="w-20 text-[11px] font-bold uppercase text-gray-400">Estado</div>
          <div className="w-8" />
        </div>
      )}

      {/* Rows */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyInvoices hasSearch={search.trim().length > 0 || statusFilter !== "all"} />
      ) : (
        <div className="divide-y divide-border">
          {filtered.map(p => <InvoiceRow key={p.id} payment={p} />)}
        </div>
      )}
    </div>
  );
};
