import { FC, useEffect } from "react";
import { ModalLayout } from "@/layouts/ModalLayout";
import { Button, Input, Select } from "@node-stack/ui";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const reportSchema = z.object({
  name: z.string().min(1, "El nombre del reporte es obligatorio"),
  type: z.string().min(1, "El formato es obligatorio"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReportFormValues) => void;
  isLoading: boolean;
}

export const CreateReportModal: FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema as any),
    defaultValues: {
      name: "",
      type: "PDF",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: "", type: "PDF" });
    }
  }, [isOpen, reset]);

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Reporte"
      subtitle="Configura los parámetros para tu exportación de datos."
      footer={
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl font-heading"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit(onSave)}
            disabled={isLoading}
            className="rounded-xl font-heading shadow-lg shadow-blue-900/20"
          >
            {isLoading ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        <Input
          label="Nombre del Archivo"
          placeholder="Ej. Resumen_Q1"
          required
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Formato de Exportación"
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
              options={[
                { label: "Documento PDF", value: "PDF" },
                { label: "Hoja de Cálculo CSV", value: "CSV" },
                { label: "Datos JSON", value: "JSON" },
              ]}
            />
          )}
        />
      </div>
    </ModalLayout>
  );
};