import { FC } from "react";
import { Mail, Save } from "lucide-react";
import { Button, Input } from "@node-stack/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormValues, profileSchema } from "../types";

interface PersonalEditFormProps {
  user?: { firstName?: string; lastName?: string; email?: string } | null;
  onSave: (data: ProfileFormValues) => Promise<void>;
  isPending: boolean;
}

export const PersonalEditForm: FC<PersonalEditFormProps> = ({ user, onSave, isPending }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    }
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="card-premium p-6 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4 md:pb-6">
        <h3 className="text-lg font-heading text-gray-950 dark:text-white">Información Personal</h3>
        <span className="hidden sm:inline text-[11px] font-label text-gray-400 uppercase">Ajustes Generales</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1">
          <Input 
            label="Nombre"
            placeholder="Tu nombre"
            {...register("firstName")}
            className="rounded-xl h-12"
          />
          {errors.firstName && <p className="text-[10px] text-red-500 font-label ml-1">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Input 
            label="Apellido"
            placeholder="Tu apellido"
            {...register("lastName")}
            className="rounded-xl h-12"
          />
          {errors.lastName && <p className="text-[10px] text-red-500 font-label ml-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Input 
          label="Correo Electrónico"
          icon={Mail}
          disabled
          {...register("email")}
          className="rounded-xl bg-gray-50 dark:bg-white/5 opacity-70 h-12"
        />
        <p className="text-[10px] md:text-[11px] text-gray-400 font-label ml-1">El email está vinculado a tu seguridad y no puede cambiarse.</p>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          loading={isPending}
          className="w-full sm:w-auto px-10 h-12 rounded-xl bg-[#004080] hover:bg-[#003366] text-white font-heading transition-all active:scale-95 shadow-lg shadow-blue-900/10"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};