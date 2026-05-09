import { zodResolver } from "@hookform/resolvers/zod";
import { Button, InfoItem, Input, PhoneInput } from "@node-stack/ui";
import { Mail, User, Phone } from "lucide-react";
import { FC } from "react";
import { useForm, Controller } from "react-hook-form";

import { ProfileFormValues, profileSchema } from "../types";

interface PersonalEditFormProps {
  isEditing: boolean;
  user?: { firstName?: string; lastName?: string; phone?: string; email?: string } | null;
  onSave: (data: ProfileFormValues) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
}

export const PersonalEditForm: FC<PersonalEditFormProps> = ({
  isEditing,
  user,
  onSave,
  isPending,
  onCancel,
}) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName:  user?.lastName  ?? "",
      phone:     user?.phone     ?? "",
      email:     user?.email     ?? "",
    },
  });

  if (!isEditing) {
    return (
      <div className="p-6 space-y-6 bg-surface border border-border rounded-[20px] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-fg uppercase">Detalles del Perfil</h3>
            <p className="text-[11px] font-medium text-fg-muted uppercase mt-0.5">Información Básica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={User}  label="Nombre"             value={user?.firstName || "No especificado"} />
          <InfoItem icon={User}  label="Apellido"           value={user?.lastName  || "No especificado"} />
          <InfoItem icon={Mail}  label="Correo Electrónico" value={user?.email     || "No especificado"} />
          <InfoItem icon={Phone} label="Número de Teléfono" value={user?.phone     || "No especificado"} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="p-6 space-y-6 bg-surface border border-border rounded-[20px] shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-fg uppercase">Editar Información</h3>
          <p className="text-[11px] font-medium text-fg-muted uppercase mt-0.5">Modo Edición</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-0.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <Input
            icon={User}
            placeholder="Tu nombre"
            {...register("firstName")}
            className="rounded-xl h-11 border-border bg-surface-muted text-[14px]"
          />
          {errors.firstName && (
            <p className="text-[11px] text-red-500 ml-0.5">{errors.firstName.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-0.5">
            Apellido <span className="text-fg-disabled font-normal normal-case">(opcional)</span>
          </label>
          <Input
            icon={User}
            placeholder="Tu apellido"
            {...register("lastName")}
            className="rounded-xl h-11 border-border bg-surface-muted text-[14px]"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-0.5">Correo Electrónico</label>
          <Input
            icon={Mail}
            disabled
            {...register("email")}
            className="rounded-xl h-11 bg-surface-muted border-border opacity-60 cursor-not-allowed text-[14px]"
          />
          <p className="text-[10px] text-fg-muted ml-0.5">El correo no puede modificarse.</p>
        </div>

        {/* Teléfono */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-0.5">Teléfono</label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value || ""}
                onChange={field.onChange}
                error={errors.phone?.message}
                className="h-11 rounded-xl border-border text-[14px]"
              />
            )}
          />
        </div>
      </div>

      <div className="pt-2 flex flex-col-reverse md:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full md:w-auto px-8 h-11 rounded-xl font-medium uppercase text-[11px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isPending}
          className="w-full md:w-auto px-10 h-11 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium uppercase text-[11px] shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
