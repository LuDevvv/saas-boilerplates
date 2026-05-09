import { Checkbox, Label } from "@node-stack/ui";
import { FC } from "react";

export const WEBHOOK_EVENTS = [
  { id: "user.created", label: "Usuario Creado", description: "Se dispara cuando un nuevo usuario se registra." },
  { id: "user.updated", label: "Usuario Actualizado", description: "Se dispara cuando el perfil del usuario cambia." },
  { id: "workspace.updated", label: "Espacio Actualizado", description: "Se dispara cuando cambian los datos del espacio." },
  { id: "billing.subscription.created", label: "Suscripción Creada", description: "Se dispara cuando se inicia un nuevo plan." },
  { id: "billing.subscription.updated", label: "Suscripción Actualizada", description: "Se dispara ante cambios en el plan." },
  { id: "billing.invoice.paid", label: "Factura Pagada", description: "Se dispara tras un pago exitoso." },
  { id: "ai.job.completed", label: "IA: Tarea Completada", description: "Se dispara cuando un proceso de IA finaliza." },
];

interface EventSelectorProps {
  selectedEvents: string[];
  onChange: (events: string[]) => void;
}

export const EventSelector: FC<EventSelectorProps> = ({ selectedEvents, onChange }) => {
  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      onChange(selectedEvents.filter(id => id !== eventId));
    } else {
      onChange([...selectedEvents, eventId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {WEBHOOK_EVENTS.map((event) => (
        <div 
          key={event.id}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
            selectedEvents.includes(event.id) 
              ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm" 
              : "border-border bg-canvas hover:bg-surface"
          }`}
          onClick={() => toggleEvent(event.id)}
        >
          <Checkbox 
            id={event.id}
            checked={selectedEvents.includes(event.id)}
            onChange={() => toggleEvent(event.id)}
            className="mt-1"
          />
          <div className="space-y-1">
            <Label htmlFor={event.id} className="text-sm font-heading cursor-pointer leading-none">
              {event.label}
            </Label>
            <p className="text-[10px] text-slate-400 font-label leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
