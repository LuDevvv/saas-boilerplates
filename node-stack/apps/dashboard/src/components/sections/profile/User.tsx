import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { UserCircle, Mail, Phone, Shield, Edit2, Camera } from "lucide-react";
import { ImageUpload } from "../../forms/ImageUpload.js";
import { Input } from "@/components/ui/form/Input";
import { Button } from "@/components/ui/form/Button";
import { PhoneInput } from "@/components/ui/form/PhoneInput";
import { cn } from "@/utils/classNames";
import { useUserData } from "@/hooks/user/useUserData";

interface ProfileFormData {
  name: string;
  phone?: string;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  statusBadge,
}: {
  icon: any;
  label: string;
  value?: string;
  statusBadge?: React.ReactNode;
}) => (
  <div className="group flex h-full items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-400/50 hover:bg-blue-50/30 dark:border-gray-800 dark:bg-gray-800/20 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10">
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm dark:border-gray-700/50 dark:bg-gray-800/80 dark:group-hover:bg-gray-800">
      <Icon className="size-5 text-gray-400 transition-colors group-hover:text-blue-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      {statusBadge ? (
        statusBadge
      ) : (
        <p className="truncate text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
          {value || "No especificado"}
        </p>
      )}
    </div>
  </div>
);

export const User: React.FC = () => {
  const {
    user,
    isLoading: isFetching,
    isUpdating,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  } = useUserData();

  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      phone: (user as any)?.phone?.toString() || "",
    },
  });

  // Sync form with user data when it loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: (user as any)?.phone?.toString() || "",
      });
    }
  }, [user, reset]);

  const isPending = isFetching || isUpdating;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    setImageLoading(true);
    try {
      await uploadAvatar(file);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    setImageLoading(true);
    try {
      await deleteAvatar();
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Profile Section */}
        <div className="flex flex-col lg:col-span-4">
          <div className="relative flex flex-col items-center overflow-hidden rounded-4xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10" />
            <div className="group/avatar relative z-10 mb-6 mt-2">
              <div className="relative">
                <ImageUpload
                  initialImage={user?.avatar || null}
                  variant="profile"
                  alt={user?.name}
                  placeholder={user?.name.slice(0, 2) || ""}
                  editable={true}
                  onSubmit={handleUploadProfilePicture}
                  onDelete={handleDeleteImage}
                  isLoading={imageLoading}
                />
                <div className="absolute bottom-1 right-1 rounded-full border-4 border-white bg-blue-600 p-2.5 text-white shadow-md dark:border-gray-900">
                  <Camera className="size-4" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mb-8 w-full">
              <h3 className="truncate px-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold tracking-tight text-gray-500 dark:text-gray-400">
                <Mail className="size-4 opacity-70" />
                {user?.email}
              </p>
            </div>

            <div className="relative z-10 mt-2 w-full">
              <Button
                variant={isEditing ? "ghost" : "primary"}
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "w-full rounded-xl h-11 font-bold tracking-wide active:scale-95 transition-all text-[11px]",
                  isEditing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    : "shadow-lg shadow-blue-500/10"
                )}
                icon={!isEditing ? Edit2 : undefined}
                disabled={isPending}
              >
                {isEditing ? "Cancelar edición" : "Editar perfil"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="flex min-h-[400px] flex-col lg:col-span-8">
          <div className="flex flex-1 flex-col overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-sm dark:border-gray-800/50 dark:bg-gray-900">
            <div className="flex flex-col gap-1 border-b border-gray-50 p-8 pb-6 dark:border-white/5">
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {isEditing ? "Ajustes de cuenta" : "Detalles administrativos"}
              </h2>
              <p className="text-[11px] font-medium tracking-wide text-gray-500 opacity-70">
                {isEditing
                  ? "Modifica tu información personal de contacto."
                  : "Consulta la información de seguridad y contacto."}
              </p>
            </div>

            <div className="flex-1 p-8">
              {isEditing ? (
                <form
                  id="user-profile-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex h-full flex-col gap-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Input
                      label="Nombre"
                      placeholder="Ej. Juan"
                      className="h-12 rounded-xl text-sm font-semibold"
                      {...register("name", {
                        required: "El nombre es obligatorio",
                      })}
                      error={errors.name?.message}
                    />
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          label="Teléfono de contacto"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="rounded-xl"
                        />
                      )}
                    />
                    <Input
                      label="Correo electrónico"
                      value={user?.email || ""}
                      disabled
                      helperText="Campo no editable por seguridad."
                      className="h-12 rounded-xl bg-gray-50/50 font-medium opacity-60 dark:bg-black/20"
                    />
                  </div>

                  <div className="mt-auto flex justify-end pt-8">
                    <Button
                      type="submit"
                      className="h-12 rounded-xl px-12 text-sm font-bold shadow-xl shadow-blue-500/10 active:scale-95"
                      loading={isUpdating}
                    >
                      Guardar perfil
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid animate-fade-in-up grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    icon={UserCircle}
                    label="Nombre completo"
                    value={user?.name}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Correo registrado"
                    value={user?.email}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Teléfono móvil"
                    value={(user as any)?.phone || "Sin configurar"}
                  />
                  <InfoItem
                    icon={Shield}
                    label="Estatus de seguridad"
                    statusBadge={
                      <span
                        className={cn(
                          "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide",
                          (user as any)?.isActive ?? true
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                        )}
                      >
                        {(user as any)?.isActive ?? true
                          ? "Cuenta Verificada"
                          : "Pendiente"}
                      </span>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
