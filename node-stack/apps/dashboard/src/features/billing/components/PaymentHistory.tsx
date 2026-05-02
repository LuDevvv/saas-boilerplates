import { FC } from "react";
import { CreditCard, FileText, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@node-stack/ui";
import { DataTable } from "@node-stack/ui";
import { cn } from "@/lib/utils";

export interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  method: string;
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
  className?: string;
}

export const PaymentHistory: FC<PaymentHistoryProps> = ({ payments, className }) => {
  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: "id",
      header: "Referencia",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <span className="font-label text-gray-900 dark:text-white uppercase text-[11px]">
            {row.getValue("id")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-[13px] font-label text-gray-500 dark:text-gray-400">
          {row.getValue("date")}
        </span>
      ),
    },
    {
      accessorKey: "method",
      header: "Método",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-3 w-3 text-gray-400" />
          <span className="text-[12px] font-heading text-gray-600 dark:text-gray-300">
            {row.getValue("method")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-heading text-gray-950 dark:text-white text-[14px]">
          {row.getValue("amount")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const isPaid = status === "Pagado";
        return (
          <Badge className={cn(
            "px-2.5 py-0.5 rounded-full text-[9px] font-label uppercase border-none",
            isPaid
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
              : "bg-red-50 text-red-600 dark:bg-red-500/10"
          )}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95">
            <Download className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Buscar facturas..."
      />
    </div>
  );
};