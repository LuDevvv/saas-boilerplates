import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, AlignLeft } from "lucide-react";
import { Button, Input } from "@node-stack/ui";
import { ModalLayout } from "@/layouts/ModalLayout";
import { useCreateWorkspace } from "../hooks/useWorkspaces";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useShallow } from "zustand/react/shallow";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();
  const setActiveWorkspace = useWorkspaceStore(useShallow((s) => s.setActiveWorkspace));

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const created = await createWorkspace({
        name: data.name,
        description: data.description || undefined,
      });
      if (created?.id) setActiveWorkspace(created.id);
      handleClose();
    } catch {
      // handled by hook
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Compañía"
      description="Crea una compañía para tu equipo o proyecto."
      variant="modal"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-0.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <Input
            icon={Building2}
            placeholder="Ej: Mi Empresa S.L."
            autoFocus
            {...register("name")}
            className="h-11 rounded-xl border-[var(--border)] text-[14px]"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 ml-0.5">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-0.5">
            Descripción <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(opcional)</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <textarea
              {...register("description")}
              placeholder="Describe el propósito de esta compañía..."
              rows={3}
              className="w-full rounded-xl border border-border bg-white dark:bg-transparent pl-10 pr-4 pt-2.5 pb-3 text-[14px] text-fg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1 pb-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 rounded-xl text-[12px] font-bold uppercase"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isPending}
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-600 text-white text-[12px] font-bold uppercase shadow-md shadow-primary/20"
          >
            Crear Compañía
          </Button>
        </div>
      </form>
    </ModalLayout>
  );
};
