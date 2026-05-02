import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Select,
} from "@node-stack/ui";
import { Loader2, Mail } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  role: z.enum(["admin", "member", "guest"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteFormValues) => Promise<void>;
  isLoading: boolean;
}

export const InviteMemberModal: FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "member",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteFormValues) => {
    await onInvite(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-slate-900 dark:text-white">Invitar Miembro</DialogTitle>
          <DialogDescription className="font-label text-slate-500 mt-2">
            Envía una invitación a alguien para que se una a tu espacio de trabajo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[11px] font-heading uppercase text-slate-400 ml-1">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                placeholder="ejemplo@correo.com"
                className="pl-11 rounded-2xl h-12 border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:ring-primary/20 transition-all"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 font-label ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Select 
              label="Rol en el Espacio"
              value={selectedRole} 
              onChange={(val: any) => setValue("role", val)}
              options={[
                { value: "member", label: "Miembro (Estándar)" },
                { value: "admin", label: "Administrador (Control total)" },
                { value: "guest", label: "Invitado (Solo lectura)" },
              ]}
              searchable={false}
            />
            <p className="text-[10px] text-slate-400 font-label ml-1 leading-relaxed">
              {selectedRole === "admin" && "Puede gestionar miembros, configuración y facturación."}
              {selectedRole === "member" && "Puede crear y editar recursos pero no gestionar el espacio."}
              {selectedRole === "guest" && "Solo puede ver los recursos del espacio."}
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-xs shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Invitación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
