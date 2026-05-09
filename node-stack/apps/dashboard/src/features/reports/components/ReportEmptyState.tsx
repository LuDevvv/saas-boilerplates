import { FC } from "react";
import { FileText } from "lucide-react";
import { Button, EmptyState } from "@node-stack/ui";

interface ReportEmptyStateProps {
  onCreateFirst: () => void;
}

export const ReportEmptyState: FC<ReportEmptyStateProps> = ({ onCreateFirst }) => (
  <EmptyState
    icon={FileText}
    title="No se encontraron reportes"
    description="Comienza a generar reportes para exportar tus datos de inteligencia de negocio."
    action={
      <Button
        onClick={onCreateFirst}
        className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
      >
        Generar primer reporte
      </Button>
    }
  />
);
