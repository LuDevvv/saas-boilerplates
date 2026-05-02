import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@node-stack/ui";
import { Loader2, Globe } from "lucide-react";
import { EventSelector } from "./EventSelector";

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
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;
    
    await onCreate(url, selectedEvents);
    handleClose();
  };

  const handleClose = () => {
    setUrl("");
    setSelectedEvents([]);
    onClose();
  };

  const isValid = url.trim().startsWith("http") && selectedEvents.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-[32px] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Registrar Webhook
          </DialogTitle>
          <DialogDescription className="font-label text-slate-500 mt-2">
            Configura un endpoint para recibir notificaciones en tiempo real sobre eventos en tu espacio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[11px] font-heading uppercase text-slate-400 ml-1">
              URL del Endpoint
            </Label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="url"
                placeholder="https://tu-servidor.com/webhook"
                className="pl-11 rounded-2xl h-12 border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:ring-indigo-500/20 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 font-label ml-1">
              Debe ser una URL pública segura (HTTPS recomendada).
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] font-heading uppercase text-slate-400 ml-1">
              Eventos a suscribir
            </Label>
            <EventSelector 
              selectedEvents={selectedEvents} 
              onChange={setSelectedEvents} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading uppercase text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
