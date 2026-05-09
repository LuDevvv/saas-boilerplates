import { zodResolver } from "@hookform/resolvers/zod";
import type { Workspace } from "@node-stack/types";
import { Button, Input } from "@node-stack/ui";
import { Building2, X, Hash } from "lucide-react";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";

import { CompanyFormValues, companySchema } from "../types";


interface CompanyEditFormProps {
  workspace?: Workspace | null;
  onSave: (data: CompanyFormValues) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
}

export const CompanyEditForm: FC<CompanyEditFormProps> = ({ workspace, onSave, isPending, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companySchema as any),
    defaultValues: {
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
    });
  }, [workspace, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="p-6 space-y-6 bg-surface border border-border rounded-[20px] shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-fg uppercase">Editar Compañía</h3>
          <p className="text-[11px] font-medium text-fg-muted uppercase mt-0.5">Modo Edición</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 w-9 rounded-full ml-auto flex items-center justify-center text-fg-muted hover:text-fg hover:bg-surface-hover transition-all active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Razón Social */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-1">
            Razón Social <span className="text-danger">*</span>
          </label>
          <Input
            icon={Building2}
            placeholder="Nombre de la compañía"
            {...register("name")}
            className="rounded-xl h-12 border-border bg-surface-muted text-[14px] font-medium"
          />
          {errors.name && (
            <p className="text-[11px] text-danger font-medium ml-1">{errors.name.message}</p>
          )}
        </div>

        {/* Slug (read-only) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-1">
            Identificador (Slug)
          </label>
          <Input
            icon={Hash}
            disabled
            value={workspace?.slug ?? ""}
            placeholder="auto-generado"
            className="rounded-xl h-12 border-border bg-surface-muted opacity-60 cursor-not-allowed text-[14px] font-medium"
          />
          <p className="text-[10px] text-fg-muted ml-1">El slug no puede modificarse.</p>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-medium uppercase text-fg-muted ml-1">Descripción</label>
          <textarea
            {...register("description")}
            placeholder="Describe brevemente la compañía o el workspace..."
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-[14px] font-medium text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary transition-colors resize-none"
          />
          {errors.description && (
            <p className="text-[11px] text-danger font-medium ml-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="pt-2 flex flex-col-reverse md:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full md:w-auto px-8 h-12 rounded-xl font-medium uppercase text-[10px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isPending}
          className="w-full md:w-auto px-10 h-12 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium uppercase text-[10px]"
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
