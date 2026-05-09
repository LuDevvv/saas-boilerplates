import { FC, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  Loader2,
  Clock,
  Tag,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Paperclip,
  User,
  AlertCircle,
  LifeBuoy,
  Timer,
} from "lucide-react";
import { StatusPill, TwoColumnLayout } from "@node-stack/ui";
import {
  useTicket,
  useAddTicketMessage,
  useUpdateTicketStatus,
} from "@/features/tickets";
import { priorityConfig, statusConfig } from "@/features/tickets/config";
import { cn } from "@/utils/classNames";

const TicketDetail: FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading, error } = useTicket(ticketId || "");
  const replyMutation = useAddTicketMessage(ticketId || "");
  const statusMutation = useUpdateTicketStatus(ticketId || "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-xl font-heading text-fg">No pudimos encontrar este ticket</h2>
        <button
          onClick={() => navigate("/tickets")}
          className="h-10 px-5 rounded-xl bg-surface border border-border text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong text-[13px] font-medium transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await replyMutation.mutateAsync(reply);
      setReply("");
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const handleClose = () => statusMutation.mutate("closed");

  const status = statusConfig[ticket.status];
  const prio = priorityConfig[ticket.priority];

  const sla =
    ticket.status !== "closed" && ticket.status !== "resolved"
      ? ticket.priority === "critical"
        ? { label: "Vence en 30m", tone: "danger" as const, pulse: true }
        : ticket.priority === "high"
        ? { label: "Vence en 2h", tone: "warning" as const, pulse: true }
        : ticket.priority === "medium"
        ? { label: "Vence en 24h", tone: "neutral" as const }
        : null
      : null;

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/tickets")}
            className="h-10 w-10 rounded-xl bg-surface border border-border text-fg-muted hover:bg-surface-hover hover:text-fg hover:border-border-strong flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold text-fg-muted uppercase tracking-wider">
                Ticket #{ticket.id.slice(-6).toUpperCase()}
              </span>
              <StatusPill label={status.label} tone={status.tone} />
              {sla && <StatusPill label={sla.label} tone={sla.tone} pulse={sla.pulse} />}
            </div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-fg leading-tight tracking-tight truncate max-w-2xl">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ticket.status !== "closed" && (
            <button
              onClick={handleClose}
              disabled={statusMutation.isPending}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-red-500/25 bg-red-500/[0.06] hover:bg-red-500/10 hover:border-red-500/35 text-red-600 dark:text-red-400 text-[12px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {statusMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Cerrar ticket
                </>
              )}
            </button>
          )}
          <button className="h-10 w-10 rounded-xl bg-surface border border-border text-fg-muted hover:bg-surface-hover hover:text-fg flex items-center justify-center transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TwoColumnLayout */}
      <TwoColumnLayout>
        <TwoColumnLayout.Main className="lg:col-span-9 lg:col-start-1">
          <div className="rounded-[20px] border border-border bg-surface overflow-hidden flex flex-col min-h-[600px]">
            <div className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Original description */}
              <div className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="max-w-[85%] flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[13px] font-semibold text-fg">Tú (Autor)</span>
                    <span className="text-[10px] text-fg-muted">Hace 2 días</span>
                  </div>
                  <div className="bg-surface-muted p-4 rounded-2xl rounded-tl-md border border-border-subtle">
                    <p className="text-[14px] text-fg leading-relaxed whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {ticket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", msg.isAdmin ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn(
                      "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center border",
                      msg.isAdmin
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : "bg-primary/15 border-primary/20 text-primary"
                    )}
                  >
                    {msg.isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={cn("max-w-[85%] flex flex-col", msg.isAdmin ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "flex items-center gap-2 mb-1.5",
                        msg.isAdmin ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <span className="text-[13px] font-semibold text-fg">
                        {msg.isAdmin ? "Soporte técnico" : "Tú"}
                      </span>
                      <span className="text-[10px] text-fg-muted">Hace 1h</span>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-2xl border",
                        msg.isAdmin
                          ? "bg-emerald-500/[0.04] border-emerald-500/15 rounded-tr-md"
                          : "bg-surface-muted border-border-subtle rounded-tl-md"
                      )}
                    >
                      <p className="text-[14px] text-fg leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle bg-surface-muted">
              {ticket.status === "closed" ? (
                <div className="flex items-center justify-center py-3 gap-2 text-fg-muted text-[13px]">
                  <XCircle className="h-4 w-4" />
                  Este ticket está cerrado y no acepta más respuestas.
                </div>
              ) : (
                <form onSubmit={handleReply} className="relative">
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="w-full p-4 pr-32 bg-surface border border-border rounded-xl text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                    <button type="button" className="p-2 text-fg-muted hover:text-fg transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!reply.trim() || replyMutation.isPending}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary hover:bg-primary-600 text-primary-foreground text-[12px] font-semibold disabled:opacity-50 transition-colors"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          Responder
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside className="lg:col-span-3 lg:col-start-10">
          <div className="flex flex-col gap-4">
            {/* Metadata card */}
            <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-[11px] font-bold text-fg-muted uppercase tracking-wider mb-4">
                Detalles del ticket
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-fg-muted flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    Prioridad
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      prio.chip
                    )}
                  >
                    {prio.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-fg-muted flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Creado
                  </span>
                  <span className="text-[11px] text-fg-secondary">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-fg-muted flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    Asignado a
                  </span>
                  <span className="text-[11px] text-fg-secondary">
                    {ticket.assignedTo || "Sin asignar"}
                  </span>
                </div>

                {sla && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-fg-muted flex items-center gap-1.5">
                      <Timer className="h-3 w-3" />
                      SLA
                    </span>
                    <StatusPill label={sla.label} tone={sla.tone} pulse={sla.pulse} />
                  </div>
                )}

                <div className="pt-3 border-t border-border-subtle">
                  <div className="flex items-start gap-2 p-3 bg-primary/[0.06] rounded-xl border border-primary/15">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-fg-secondary leading-snug">
                      Recibirás notificaciones por cada respuesta del equipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick assign — mock */}
            <div className="rounded-[20px] border border-border bg-surface p-5">
              <h3 className="text-[11px] font-bold text-fg-muted uppercase tracking-wider mb-3">
                Asignación rápida
              </h3>
              <div className="space-y-1.5">
                {["Soporte L1", "Soporte L2", "Engineering"].map((team) => (
                  <button
                    key={team}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-fg-secondary hover:bg-surface-hover hover:text-fg transition-colors"
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags — mock */}
            <div className="rounded-[20px] border border-border bg-surface p-5">
              <h3 className="text-[11px] font-bold text-fg-muted uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {["billing", "ui-bug", "premium"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-muted border border-border-subtle text-fg-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Help promo */}
            <div className="rounded-[20px] p-5 bg-gradient-to-br from-primary to-primary-600 dark:from-primary/[0.18] dark:to-surface-elevated border border-white/10 dark:border-border text-white dark:text-fg relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4">
                <LifeBuoy className="w-20 h-20 opacity-10" />
              </div>
              <div className="relative">
                <p className="text-[13px] font-semibold leading-snug">¿Necesitas algo más?</p>
                <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                  Nuestros agentes responden en menos de 2 h en horario laboral.
                </p>
              </div>
            </div>
          </div>
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>
    </div>
  );
};

export default TicketDetail;
