import { useState } from "react";
import { Save } from "lucide-react";
import { workspaceService, WorkspaceItem } from "@/services/workspaces/workspaceService";
import { Input } from "@/components/ui/form/Input";
import { Button } from "@/components/ui/form/Button";
import { appToast } from "@/components/alerts/Toasts";

interface GeneralSettingsProps {
  workspace: WorkspaceItem;
  onUpdate: (workspace: WorkspaceItem) => void;
}

const GeneralSettings = ({ workspace, onUpdate }: GeneralSettingsProps) => {
  const [formData, setFormData] = useState({
    name: workspace.name,
    location: workspace.location,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await workspaceService.updateWorkspace(workspace.id, formData);
      onUpdate(updated);
      appToast.success({
        title: "Workspace actualizado",
        description: "Los cambios se han guardado correctamente."
      });
    } catch (error) {
      appToast.error({
        title: "Error",
        description: "No se pudieron guardar los cambios."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Información Básica
        </h3>
        
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <Input
            label="Nombre del Workspace"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej. Mi Proyecto Increíble"
            required
          />

          <Input
            label="Ubicación / Región"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ej. US-East"
            required
          />

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              loading={loading}
              icon={<Save size={18} />}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
          Zona de Peligro
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Acciones irreversibles como la eliminación permanente del workspace.
        </p>
        
        <Button
          variant="secondary"
          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
          onClick={() => alert("Próximamente: Eliminación de workspace")}
        >
          Eliminar este Workspace
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
