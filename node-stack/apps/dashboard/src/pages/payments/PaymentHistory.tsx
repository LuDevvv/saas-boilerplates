import { Button, DataTable, Badge } from "@node-stack/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";

import { appToast } from "@/components/alerts/Toasts";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useInvoices } from "@/features/billing/hooks/useBilling";

interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  method: string;
}

const PaymentHistory = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const queryClient = useQueryClient();

  const { mutate: deletePayment } = useMutation({
    mutationFn: async (_id: string) => {
      // Mock delete as backend doesn't support deleting invoices directly via client yet
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "invoices"] });
      appToast.success({ title: "Factura eliminada", description: "El registro ha sido removido." });
    }
  });

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: "id",
      header: "Factura",
      cell: ({ row }) => (
        <span className="font-label text-fg uppercase  text-[11px]">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-[13px] font-label text-gray-600 dark:text-gray-300">{row.getValue("date")}</span>      ),
    },
    {
      accessorKey: "method",
      header: "Método",
      cell: ({ row }) => (
        <span className="text-[12px] font-label text-fg-secondary uppercase  bg-surface-muted px-2.5 py-1 rounded-md border border-border-subtle">{row.getValue("method")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-kpi text-fg text-[15px] ">{row.getValue("amount")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "Pagado" ? "success" : status === "Fallido" ? "destructive" : "warning";
        return (
          <Badge variant={variant} className="">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface-hover active:scale-95 transition-all">
            <Download className="h-4 w-4 text-fg-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition-all"
            onClick={() => deletePayment(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const mappedHistory: PaymentRecord[] = (invoices || []).map(inv => ({
    id: inv.id,
    date: new Date(inv.date).toLocaleDateString(),
    amount: `$${inv.amount / 100}`,
    status: inv.status === "paid" ? "Pagado" : "Pendiente",
    method: "Visa"
  }));

  return (
    <div className="w-full animate-fade-in-up pb-10 flex flex-col gap-10 max-w-[1600px] mx-auto px-4 md:px-6">
      <SectionHeader
        title="Historial de Pagos"
        subtitle="Consulta y descarga tus facturas y recibos anteriores."
      />

      <div className="w-full max-w-6xl">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] border border-gray-100/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:border-white/20">
          {/* Ambient Background Blur */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <DataTable
              data={mappedHistory}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar por ID de factura o método..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
