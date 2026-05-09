import {
  Button,
  CalloutCard,
  EmptyState,
  PageHeader,
  SectionHeader,
  Skeleton,
  StatusPill,
  TwoColumnLayout,
} from "@node-stack/ui";
import type { StatusPillTone } from "@node-stack/ui";
import {
  Download,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  Loader2,
} from "lucide-react";
import { FC, useState } from "react";


import {
  usePortabilityRequests,
  useRequestExport,
  useDownloadExport,
} from "../hooks/usePortability";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/utils/classNames";

const STATUS_CONFIG: Record<
  string,
  { label: string; tone: StatusPillTone; pulse?: boolean }
> = {
  completed:  { label: "Completado",  tone: "success" },
  pending:    { label: "Pendiente",   tone: "warning", pulse: true },
  processing: { label: "Procesando",  tone: "info",    pulse: true },
  failed:     { label: "Fallido",     tone: "danger" },
  expired:    { label: "Expirado",    tone: "neutral" },
};

const SCHEDULE_OPTIONS = [
  { value: "off",     label: "Desactivado",  description: "Solo bajo demanda" },
  { value: "weekly",  label: "Semanal",      description: "Cada lunes a las 09:00" },
  { value: "monthly", label: "Mensual",      description: "El día 1 de cada mes" },
] as const;

type ScheduleValue = (typeof SCHEDULE_OPTIONS)[number]["value"];

const PortabilityPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: requests, isLoading } = usePortabilityRequests(activeWorkspaceId);
  const { mutate: requestExport, isPending: isRequesting } = useRequestExport(activeWorkspaceId);
  const { mutate: downloadExport, isPending: isDownloading } = useDownloadExport(activeWorkspaceId);

  // Mock — replace with backend when scheduling endpoint exists
  const [schedule, setSchedule] = useState<ScheduleValue>("off");
  const [emailDelivery, setEmailDelivery] = useState(true);

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Exportación de datos"
        description="Cumplimiento GDPR. Descarga un paquete con toda la información de tu compañía o programa exports periódicos."
        action={
          <Button
            onClick={() => requestExport()}
            loading={isRequesting}
            className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
          >
            <Database className="mr-1.5 h-4 w-4" />
            Solicitar exportación
          </Button>
        }
        className="mb-6"
      />

      <TwoColumnLayout>
        <TwoColumnLayout.Main className="flex flex-col gap-6">
          {/* Active requests table */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              eyebrow="HISTORIAL"
              title="Exportaciones recientes"
              description="Revisa el estado de tus solicitudes y descarga el paquete cuando esté listo."
            />

            <div className="rounded-[20px] border border-border bg-surface overflow-hidden shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-muted text-[10px] font-bold uppercase tracking-wider text-fg-muted border-b border-border-subtle">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Skeleton className="h-8 w-24 ml-auto" />
                          </td>
                        </tr>
                      ))
                    ) : !requests || requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-0">
                          <EmptyState
                            icon={Database}
                            title="Sin exportaciones solicitadas"
                            description="Cuando solicites una exportación, aparecerá aquí con el estado del procesamiento."
                            compact
                            className="border-none"
                          />
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => {
                        const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                        return (
                          <tr key={req.id} className="hover:bg-surface-hover transition-colors">
                            <td className="px-6 py-4 font-mono text-[12px] text-fg-secondary">
                              {req.id.split("-")[0]}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-fg-secondary tabular-nums">
                              {new Date(req.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <StatusPill
                                label={cfg.label}
                                tone={cfg.tone}
                                pulse={cfg.pulse}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              {req.status === "completed" ? (
                                <button
                                  onClick={() => downloadExport(req.id)}
                                  disabled={isDownloading}
                                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-[12px] font-semibold transition-colors disabled:opacity-60"
                                >
                                  {isDownloading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Download className="h-3.5 w-3.5" />
                                  )}
                                  Descargar
                                </button>
                              ) : req.status === "failed" ? (
                                <span className="text-[11px] text-fg-muted">—</span>
                              ) : (
                                <span className="text-[11px] text-fg-muted inline-flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 animate-pulse" />
                                  En cola
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Scheduled exports section */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              eyebrow="AUTOMATIZACIÓN"
              title="Exports programados"
              description="Genera exports automáticos sin tener que solicitarlos manualmente."
            />

            <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] space-y-4">
              {/* Frequency selector */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                  Frecuencia
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SCHEDULE_OPTIONS.map((opt) => {
                    const isActive = schedule === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSchedule(opt.value)}
                        className={cn(
                          "text-left p-3 rounded-xl border transition-colors",
                          isActive
                            ? "bg-primary/[0.06] border-primary/25"
                            : "bg-surface-muted border-border hover:border-border-strong"
                        )}
                      >
                        <p
                          className={cn(
                            "text-[13px] font-semibold",
                            isActive ? "text-primary" : "text-fg"
                          )}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-fg-muted mt-0.5">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email delivery toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-muted">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-[10px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-fg">Envío por email</p>
                    <p className="text-[11px] text-fg-muted">
                      Recibe el link de descarga directamente en tu bandeja
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailDelivery((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors shrink-0",
                    emailDelivery ? "bg-primary" : "bg-surface-hover border border-border"
                  )}
                  aria-pressed={emailDelivery}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all shadow-sm",
                      emailDelivery ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {schedule !== "off" && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-fg-secondary leading-snug">
                    Programación activa. Próxima ejecución:{" "}
                    <span className="text-fg font-medium">
                      {schedule === "weekly" ? "lunes próximo · 09:00" : "1 del mes próximo · 09:00"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside className="flex flex-col gap-4">
          <CalloutCard
            icon={Database}
            iconTone="primary"
            variant="card"
            eyebrow="GDPR"
            title="Descarga total"
            description="Descarga un .zip con todo el dato del workspace: usuarios, archivos, configuraciones, logs y métricas."
            action={
              <Button
                onClick={() => requestExport()}
                loading={isRequesting}
                variant="outline"
                className="w-full rounded-xl text-[12px] font-medium"
              >
                Generar .zip ahora
              </Button>
            }
          />

          <CalloutCard
            icon={AlertCircle}
            iconTone="warning"
            variant="muted"
            eyebrow="IMPORTANTE"
            title="Retención de exports"
            description="Los archivos generados están disponibles por 7 días tras completarse. Después se eliminan automáticamente por seguridad."
          />

          <CalloutCard
            icon={Calendar}
            iconTone="info"
            variant="muted"
            title="¿Necesitas otro formato?"
            description="Además de .zip, ofrecemos export a CSV, JSON y migraciones directas a otras plataformas. Contacta soporte."
          />
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>
    </div>
  );
};

export default PortabilityPage;
