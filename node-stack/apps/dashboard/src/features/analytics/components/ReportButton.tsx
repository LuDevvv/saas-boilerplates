import { Button } from "@node-stack/ui";
import { Download } from "lucide-react";

import { appToast } from "@/components/alerts/Toasts";

export const ReportButton: React.FC = () => (
  <Button
    className="btn-secondary text-[10px] h-9 px-4"
    onClick={() => appToast.success({ title: "Reporte en camino", description: "Tu reporte ha sido generado y comenzará a descargarse en breve." })}
  >
    <Download className="w-3.5 h-3.5 mr-2" />
    Reporte
  </Button>
);