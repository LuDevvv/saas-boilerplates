import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@node-stack/ui";
import { AlertCircle, Loader2, Mail, ShieldCheck, User, Eye } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ModalLayout } from "@/layouts/ModalLayout";
import { cn } from "@/utils/classNames";

const inviteSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  role: z.enum(["admin", "member", "guest"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Resolves on success, throws on failure — error message shown inside modal */
  onInvite: (data: InviteFormValues) => Promise<void>;
  isLoading: boolean;
}

// ─── Role option cards ────────────────────────────────────────────────────────

const ROLES = [
  {
    value: "member" as const,
    label: "Miembro",
    hint: "Puede crear y editar recursos pero no gestionar la compañía.",
    icon: User,
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "admin" as const,
    label: "Administrador",
    hint: "Control total: miembros, configuración y facturación.",
    icon: ShieldCheck,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "guest" as const,
    label: "Invitado",
    hint: "Solo puede visualizar los recursos de la compañía.",
    icon: Eye,
    iconBg: "bg-surface-hover",
    iconColor: "text-fg-secondary",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const InviteMemberModal: FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  isLoading,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inviteSchema as any),
    defaultValues: { role: "member" },
  });

  const selectedRole = watch("role");

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const onSubmit = async (data: InviteFormValues) => {
    setApiError(null);
    try {
      await onInvite(data);
      handleClose(); // only close on success
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? "";
      const ERROR_MAP: Record<string, string> = {
        "A pending invitation already exists": "Ya existe una invitación pendiente para este correo. Cancélala primero.",
        "User is already a member": "Este usuario ya es miembro del equipo.",
      };
      setApiError(ERROR_MAP[msg] ?? (msg || "No se pudo enviar la invitación."));
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title="Invitar al Equipo"
      description="El usuario recibirá un correo para unirse a tu compañía."
      variant="drawer-right"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-11 px-6 rounded-xl text-[13px] font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="invite-member-form"
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary-600 text-white text-[13px] font-medium shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar invitación"
            )}
          </Button>
        </div>
      }
    >
      <form
        id="invite-member-form"
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 py-6 space-y-6"
      >
        {/* API error banner */}
        {apiError && (
          <div className="flex items-start gap-2.5 rounded-[12px] bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 dark:text-red-400 leading-relaxed">{apiError}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase  text-gray-400">
            Correo Electrónico
          </label>
          <Input
            icon={Mail}
            placeholder="nombre@empresa.com"
            className="h-11 rounded-xl text-[14px]"
            autoFocus
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Role selector — visual cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase  text-gray-400">
            Rol en la Compañía
          </label>
          <div className="space-y-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue("role", role.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-[14px] border text-left transition-all duration-150 active:scale-[0.99]",
                    isSelected
                      ? "border-primary/30 bg-primary/[0.04] dark:bg-primary/[0.08]"
                      : "border-[var(--border)] bg-white dark:bg-surface hover:border-border-strong"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0",
                    role.iconBg
                  )}>
                    <Icon className={cn("h-4 w-4", role.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] font-semibold leading-snug",
                      isSelected ? "text-fg" : "text-fg-secondary"
                    )}>
                      {role.label}
                    </p>
                    <p className="text-[11px] text-fg-muted leading-relaxed mt-0.5">
                      {role.hint}
                    </p>
                  </div>
                  {/* Selected indicator */}
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 shrink-0 transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {isSelected && (
                      <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </ModalLayout>
  );
};
