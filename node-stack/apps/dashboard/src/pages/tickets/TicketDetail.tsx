import { FC, useState, useRef, useEffect } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";
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
  LifeBuoy
} from "lucide-react";
import {
  useTicket,
  useAddTicketMessage,
  useUpdateTicketStatus
} from "@/features/tickets";
import { TicketStatus, TicketPriority } from "@/features/tickets";
import { cn } from "@/utils/classNames";

const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string }> = {
  low: { label: "Baja", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  medium: { label: "Media", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  high: { label: "Alta", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  critical: { label: "Crítica", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
};

const statusConfig: Record<TicketStatus, { label: string; dot: string; color: string }> = {
  open: { label: "Abierto", dot: "bg-blue-500", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  in_progress: { label: "En progreso", dot: "bg-amber-500", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  resolved: { label: "Resuelto", dot: "bg-emerald-500", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  closed: { label: "Cerrado", dot: "bg-gray-400", color: "text-gray-600 bg-gray-50 dark:bg-gray-800" },
};

const TicketDetail: FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading, error } = useTicket(ticketId || "");
  const replyMutation = useAddTicketMessage(ticketId || "");
  const statusMutation = useUpdateTicketStatus(ticketId || "");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-heading">No pudimos encontrar este ticket</h2>
        <button onClick={() => navigate("/tickets")} className="btn-secondary">
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

  const handleClose = () => {
    statusMutation.mutate("closed");
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tickets")}
            className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-label text-gray-400 uppercase ">
                Ticket #{ticket.id.slice(-6)}
              </span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-label uppercase er", statusConfig[ticket.status].color)}>
                {statusConfig[ticket.status].label}
              </span>
            </div>
            <h1 className="text-2xl font-heading text-gray-950 dark:text-white truncate max-w-md">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ticket.status !== "closed" && (
            <button
              onClick={handleClose}
              disabled={statusMutation.isPending}
              className="btn-danger py-2.5 px-6"
            >
              {statusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Cerrar Ticket
                </>
              )}
            </button>
          )}
          <button className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-all">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full">
        {/* Main Chat Area */}
        <div className="xl:col-span-3 flex flex-col bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[600px]">
          {/* Thread */}
          <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Original Description as first message */}
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-heading text-gray-950 dark:text-white">Tú (Autor)</span>
                  <span className="text-[10px] text-gray-400 font-label">Hace 2 días</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {ticket.messages?.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4",
                  msg.isAdmin ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center",
                  msg.isAdmin
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  {msg.isAdmin ? (
                    <Shield className="h-5 w-5 text-purple-600" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%]",
                  msg.isAdmin ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "flex items-center gap-2 mb-1.5",
                    msg.isAdmin ? "flex-row-reverse" : "flex-row"
                  )}>
                    <span className="text-sm font-heading text-gray-950 dark:text-white">
                      {msg.isAdmin ? "Soporte Técnico" : "Tú"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-label">Hace 1h</span>
                  </div>
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all",
                    msg.isAdmin
                      ? "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-500/10 rounded-tr-none shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-white/5 rounded-tl-none"
                  )}>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-white/5">
            {ticket.status === "closed" ? (
              <div className="flex items-center justify-center py-4 gap-2 text-gray-500 font-heading text-sm">
                <XCircle className="h-5 w-5" />
                Este ticket está cerrado y no acepta más respuestas.
              </div>
            ) : (
              <form onSubmit={handleReply} className="relative">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full p-5 pr-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none shadow-sm"
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="btn-primary py-2.5 px-5 shadow-blue-500/20"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Responder</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Metadata */}
        <aside className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/5 p-6 shadow-sm">
            <h3 className="text-sm font-label text-gray-950 dark:text-white uppercase  mb-6">
              Detalles del Ticket
            </h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-label text-gray-400 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Prioridad
                </span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-label uppercase", priorityConfig[ticket.priority].bg, priorityConfig[ticket.priority].color)}>
                  {priorityConfig[ticket.priority].label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-label text-gray-400 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Creado
                </span>
                <span className="text-xs font-label text-gray-700 dark:text-gray-300">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-label text-gray-400 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Asignado a
                </span>
                <span className="text-xs font-label text-gray-700 dark:text-gray-300">
                  {ticket.assignedTo || "Pendiente"}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-[10px] font-label text-blue-700 dark:text-blue-400 leading-tight">
                    Recibirás notificaciones por cada respuesta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-6 text-white overflow-hidden relative group shadow-lg shadow-blue-500/20">
            <div className="relative z-10">
              <h3 className="font-heading mb-2">¿Necesitas algo más?</h3>
              <p className="text-xs text-blue-100 opacity-90 leading-relaxed">
                Nuestros agentes de soporte suelen responder en menos de 2 horas durante horario laboral.
              </p>
            </div>
            <LifeBuoy className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TicketDetail;
