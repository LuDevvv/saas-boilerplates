import { FC } from "react";
import { ModalLayout } from "@/layouts/ModalLayout";
import { Button, Input, Select } from "@node-stack/ui";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: { name: string; type: string };
  onFormChange: (data: { name: string; type: string }) => void;
  isLoading: boolean;
}

export const CreateReportModal: FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formData,
  onFormChange,
  isLoading,
}) => {
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
            onClick={onSave}
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
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
          className="rounded-[16px]"
        />
        <Select
          label="Formato de Exportación"
          value={formData.type}
          onChange={(val) => onFormChange({ ...formData, type: val as string })}
          options={[
            { label: "Documento PDF", value: "PDF" },
            { label: "Hoja de Cálculo CSV", value: "CSV" },
            { label: "Datos JSON", value: "JSON" },
          ]}
        />
      </div>
    </ModalLayout>
  );
};