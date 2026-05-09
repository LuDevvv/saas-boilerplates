import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label } from "@node-stack/ui";
import { Loader2, Globe } from "lucide-react";
import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";

import { EventSelector } from "./EventSelector";

import { ModalLayout } from "@/layouts/ModalLayout";

const webhookSchema = z.object({
  url: z.string().url("Ingresa una URL válida").startsWith("http", "La URL debe comenzar con http o https"),
  events: z.array(z.string()).min(1, "Selecciona al menos un evento"),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

interface AddWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (url: string, events: string[]) => Promise<void>;
  isLoading: boolean;
}

export const AddWebhookModal: FC<AddWebhookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<WebhookFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(webhookSchema as any),
    mode: "onChange",
    defaultValues: {
      url: "",
      events: [],
    },
  });

  const onSubmit = async (data: WebhookFormValues) => {
    await onCreate(data.url, data.events);
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      variant="modal"
      size="lg"
      title="Registrar Webhook"
      description="Configura un endpoint para recibir notificaciones en tiempo real sobre eventos de tu compañía."
      footer={
        <Button
          type="submit"
          form="add-webhook-form"
          disabled={isLoading || !isValid}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-xs shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Crear Webhook"
          )}
        </Button>
      }
    >
      <form id="add-webhook-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-[11px] font-heading uppercase text-gray-400 ml-1">
            URL del Endpoint
          </Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="url"
              placeholder="https://tu-servidor.com/webhook"
              className="pl-11 rounded-xl h-12"
              error={errors.url?.message}
              {...register("url")}
              autoFocus
            />
          </div>
          <p className="text-[10px] text-gray-400 font-label ml-1">
            Debe ser una URL pública segura (HTTPS recomendada).
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-[11px] font-heading uppercase text-gray-400 ml-1">
            Eventos a suscribir
          </Label>
          <Controller
            name="events"
            control={control}
            render={({ field }) => (
              <EventSelector
                selectedEvents={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.events && (
            <p className="text-[11px] text-danger font-medium ml-1">{errors.events.message}</p>
          )}
        </div>
      </form>
    </ModalLayout>
  );
};
