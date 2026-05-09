import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@node-stack/ui";
import { Loader2, Key } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SecretDisplay } from "./SecretDisplay";

import { ModalLayout } from "@/layouts/ModalLayout";

const keySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre es demasiado largo"),
});

type KeyFormValues = z.infer<typeof keySchema>;

interface CreateKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<{ secret?: string } | unknown>;
  isLoading: boolean;
}

export const CreateKeyDialog: FC<CreateKeyDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<KeyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(keySchema as any),
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: KeyFormValues) => {
    try {
      const result = await onCreate(data.name);
      const secretResult = result as { secret?: string } | null;
      if (secretResult?.secret) setGeneratedSecret(secretResult.secret);
    } catch {
      // handled by hook
    }
  };

  const handleClose = () => {
    reset();
    setGeneratedSecret(null);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
            <Key className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </span>
          Nueva Clave API
        </span>
      }
      description={
        generatedSecret
          ? "Tu clave ha sido generada. Guárdala ahora, no se mostrará de nuevo."
          : "Asigna un nombre a tu clave para identificarla fácilmente."
      }
      variant="modal"
      size="sm"
    >
      <div className="px-6 py-5">
        {generatedSecret ? (
          <div className="space-y-5">
            <SecretDisplay secret={generatedSecret} />
            <Button
              className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold uppercase text-[12px]"
              onClick={handleClose}
            >
              He guardado mi clave — Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-0.5">
                Nombre de la Clave
              </label>
              <Input
                placeholder="Ej: Producción - App Móvil"
                className="h-11 rounded-xl border-[var(--border)] text-[14px]"
                error={errors.name?.message}
                {...register("name")}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase text-[12px] shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
              ) : "Generar Clave API"}
            </Button>
          </form>
        )}
      </div>
    </ModalLayout>
  );
};
