import { FC, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Input,
  Label
} from "@node-stack/ui";
import { Loader2, Key } from "lucide-react";
import { SecretDisplay } from "./SecretDisplay";

interface CreateKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<any>;
  isLoading: boolean;
}

export const CreateKeyDialog: FC<CreateKeyDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const result = await onCreate(name);
      if (result?.secret) {
        setGeneratedSecret(result.secret);
      }
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  const handleClose = () => {
    setName("");
    setGeneratedSecret(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl">
              <Key className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            Nueva Clave API
          </DialogTitle>
          <DialogDescription className="font-label text-slate-500 mt-2">
            {generatedSecret 
              ? "Tu clave ha sido generada correctamente." 
              : "Asigna un nombre a tu clave para identificarla fácilmente."}
          </DialogDescription>
        </DialogHeader>

        {generatedSecret ? (
          <div className="py-6">
            <SecretDisplay secret={generatedSecret} />
            <div className="mt-8">
              <Button 
                className="w-full h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-heading uppercase text-xs shadow-lg"
                onClick={handleClose}
              >
                He guardado mi clave
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] font-heading uppercase text-slate-400 ml-1">
                Nombre de la Clave
              </Label>
              <Input
                id="name"
                placeholder="Ej: Producción - App Móvil"
                className="rounded-2xl h-12 border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:ring-cyan-500/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-heading uppercase text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar Clave API"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
