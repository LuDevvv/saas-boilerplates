import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Send, Bug, Zap, CreditCard, MessageSquare } from "lucide-react";
import { useCreateTicket } from "../index";
import type { TicketPriority, TicketCategory, CreateTicketDto } from "@node-stack/types";
import { CreateTicketSchema } from "@node-stack/validators";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";
import { Button, Input } from "@node-stack/ui";
import { ModalLayout } from "@/layouts/ModalLayout";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal: FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const createMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTicketDto>({
    resolver: zodResolver(CreateTicketSchema as any),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "general",
    },
  });

  const onSubmit = async (data: CreateTicketDto) => {
    try {
      const ticket = await createMutation.mutateAsync(data);
      handleClose();
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const categories: { key: TicketCategory; label: string; icon: any }[] = [
    { key: "bug",     label: "Bug / Error",      icon: Bug },
    { key: "feature", label: "Mejora / Feature",  icon: Zap },
    { key: "billing", label: "Facturación",        icon: CreditCard },
    { key: "general", label: "General",            icon: MessageSquare },
  ];

  const priorities: { key: TicketPriority; label: string }[] = [
    { key: "low",      label: "Baja" },
    { key: "medium",   label: "Media" },
    { key: "high",     label: "Alta" },
    { key: "critical", label: "Crítica" },
  ];

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      variant="modal"
      size="lg"
      title="Abrir Nuevo Ticket"
      description="Cuéntanos qué necesitas y nuestro equipo te ayudará pronto."
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            className="h-11 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-ticket-form"
            loading={createMutation.isPending}
            fullWidth
            className="h-11 rounded-xl shadow-lg shadow-primary/25"
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar Ticket
          </Button>
        </div>
      }
    >
      <form id="create-ticket-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
        <Input
          label="Asunto"
          placeholder="Ej: Problema con la integración de API"
          required
          error={errors.subject?.message}
          {...register("subject")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-[13px] font-medium text-fg-secondary mb-2">
              Categoría
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => field.onChange(cat.key)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer",
                        field.value === cat.key
                          ? "bg-primary-50 border-primary/20 text-primary-700 dark:bg-primary/10 dark:border-primary/30 dark:text-primary-light"
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 dark:bg-white/5 dark:border-white/5 dark:hover:border-white/10"
                      )}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[13px] font-medium text-fg-secondary mb-2">
              Prioridad
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map((prio) => (
                    <button
                      key={prio.key}
                      type="button"
                      onClick={() => field.onChange(prio.key)}
                      className={cn(
                        "p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer",
                        field.value === prio.key
                          ? "bg-primary-50 border-primary/20 text-primary-700 dark:bg-primary/10 dark:border-primary/30 dark:text-primary-light"
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 dark:bg-white/5 dark:border-white/5 dark:hover:border-white/10"
                      )}
                    >
                      {prio.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-medium text-fg-secondary mb-2">
            Descripción detallada
          </label>
          <textarea
            required
            rows={4}
            placeholder="Explica detalladamente el problema o solicitud..."
            className={cn(
              "flex w-full py-3 px-4 text-sm font-medium outline-none transition-all duration-300 resize-none",
              "bg-canvas dark:bg-canvas-dark border border-border rounded-xl",
              "focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 dark:focus:ring-primary/10 dark:focus:border-primary",
              errors.description ? "border-danger focus:border-danger focus:ring-danger/10" : ""
            )}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-2 text-[12px] font-medium text-danger animate-in fade-in slide-in-from-top-1 duration-300">
              {errors.description.message}
            </p>
          )}
        </div>

        {createMutation.isError && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Error al crear el ticket. Inténtalo de nuevo.</p>
          </div>
        )}
      </form>
    </ModalLayout>
  );
};

export default CreateTicketModal;
