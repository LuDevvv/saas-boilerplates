import { FC, useState } from "react";
import { X, Loader2, AlertCircle, Send, Bug, Zap, CreditCard, MessageSquare } from "lucide-react";
import { useCreateTicket, type TicketPriority, type TicketCategory } from "../index";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal: FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const createMutation = useCreateTicket();

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium" as TicketPriority,
    category: "general" as TicketCategory,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticket = await createMutation.mutateAsync(formData);
      onClose();
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  const categories: { key: TicketCategory; label: string; icon: any }[] = [
    { key: "bug", label: "Bug / Error", icon: Bug },
    { key: "feature", label: "Mejora / Feature", icon: Zap },
    { key: "billing", label: "Facturación", icon: CreditCard },
    { key: "general", label: "General", icon: MessageSquare },
  ];

  const priorities: { key: TicketPriority; label: string; color: string }[] = [
    { key: "low", label: "Baja", color: "bg-gray-100 text-gray-600" },
    { key: "medium", label: "Media", color: "bg-blue-100 text-blue-600" },
    { key: "high", label: "Alta", color: "bg-amber-100 text-amber-600" },
    { key: "critical", label: "Crítica", color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl transition-all dark:bg-gray-900 border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading text-gray-950 dark:text-white ">
              Abrir Nuevo Ticket
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cuéntanos qué necesitas y nuestro equipo te ayudará pronto.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-label text-gray-700 dark:text-gray-300 mb-2">
                Asunto
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Problema con la integración de API"
                className="input-standard"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-label text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.key })}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-2xl border text-xs font-label transition-all cursor-pointer",
                        formData.category === cat.key
                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-400"
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 dark:bg-gray-800/50 dark:border-white/5 dark:hover:border-white/10"
                      )}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-label text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map((prio) => (
                    <button
                      key={prio.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: prio.key })}
                      className={cn(
                        "p-3 rounded-2xl border text-xs font-label transition-all cursor-pointer",
                        formData.priority === prio.key
                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-400"
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 dark:bg-gray-800/50 dark:border-white/5 dark:hover:border-white/10"
                      )}
                    >
                      {prio.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-label text-gray-700 dark:text-gray-300 mb-2">
                Descripción detallada
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explica detalladamente el problema o solicitud..."
                className="input-standard resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex-1 py-4"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar Ticket
                </>
              )}
            </button>
          </div>

          {createMutation.isError && (
            <div className="mt-4 flex items-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-500/20">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-label">Error al crear el ticket. Inténtalo de nuevo.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;