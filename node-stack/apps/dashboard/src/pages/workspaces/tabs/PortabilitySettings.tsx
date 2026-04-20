import { useState, useEffect } from "react";
import { Download, History, Database, CheckCircle, Clock } from "lucide-react";
import { portabilityService, PortabilityRequest } from "@/services/workspaces/portabilityService";
import { Button } from "@/components/ui/form/Button";
import { appToast } from "@/components/alerts/Toasts";

interface PortabilitySettingsProps {
  workspaceId: string;
}

const PortabilitySettings = ({ workspaceId }: PortabilitySettingsProps) => {
  const [requests, setRequests] = useState<PortabilityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await portabilityService.getRequests(workspaceId);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching portability requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [workspaceId]);

  const handleRequestExport = async () => {
    setRequesting(true);
    try {
      const created = await portabilityService.createRequest(workspaceId);
      setRequests([created, ...requests]);
      appToast.success({
        title: "Exportación solicitada",
        description: "Estamos procesando todos tus datos. Recibirás un correo cuando esté listo."
      });
    } catch (error) {
      appToast.error({ 
        title: "Error", 
        description: "No se pudo solicitar la exportación." 
      });
    } finally {
      setRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={10} /> Completado</span>;
      case 'processing':
        return <span className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"><Clock size={10} /> Procesando</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Fallido</span>;
      default:
        return <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Pendiente</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Portabilidad de Datos</h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Descarga una copia completa de todos los datos de tu espacio de trabajo. 
            Esto incluye usuarios, configuraciones, registros de auditoría y cualquier contenido generado.
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={handleRequestExport}
          loading={requesting}
          icon={<Download size={18} />}
        >
          Solicitar Exportación (HIPAA)
        </Button>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Database size={24} />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Sobre tus datos</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cumplimos con las normativas GDPR y HIPAA. Tus datos se exportan en un archivo ZIP 
              conteniendo archivos JSON estructurados. Por seguridad, el link de descarga expirará 
              automáticamente después de 24 horas.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <History size={18} />
          <h4 className="font-semibold uppercase text-xs tracking-widest">Historial de Solicitudes</h4>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando historial...</div>
        ) : requests.length === 0 ? (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500 italic text-sm">No has solicitado ninguna exportación todavía.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {requests.map((req) => (
              <div 
                key={req.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center transition-all hover:bg-slate-900"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">Exportación #{req.id.substring(0, 8)}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <span className="text-slate-500 text-xs">
                    Solicitado el {new Date(req.requestedAt).toLocaleDateString()} a las {new Date(req.requestedAt).toLocaleTimeString()}
                  </span>
                </div>
                
                {req.status === 'completed' && req.downloadUrl && (
                  <Button 
                    onClick={() => window.open(req.downloadUrl!, "_blank")}
                    size="sm"
                    variant="ghost"
                    className="text-indigo-400 hover:text-indigo-300"
                    icon={<Download size={14} />}
                  >
                    Descargar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortabilitySettings;
