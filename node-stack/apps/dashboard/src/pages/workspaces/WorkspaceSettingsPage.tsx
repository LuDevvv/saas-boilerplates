import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Settings, Globe, Shield, Bell, ArrowLeft } from "lucide-react";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { workspaceService, WorkspaceItem } from "@/services/workspaces/workspaceService";
import GeneralSettings from "./tabs/GeneralSettings";
import WebhooksSettings from "./tabs/WebhooksSettings";
import PortabilitySettings from "./tabs/PortabilitySettings";

type Tab = "general" | "webhooks" | "portability" | "access" | "notifications";

const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;
      try {
        const data = await workspaceService.getWorkspaceById(workspaceId);
        if (data) {
          setWorkspace(data);
        } else {
          navigate("/workspaces");
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [workspaceId, navigate]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Cargando configuración...</div>;
  }

  if (!workspace) return null;

  const tabs = [
    { id: "general", label: "General", icon: <Globe size={18} /> },
    { id: "webhooks", label: "Webhooks", icon: <Globe size={18} /> },
    { id: "portability", label: "Portabilidad", icon: <Settings size={18} /> },
    { id: "access", label: "Acceso", icon: <Shield size={18} />, disabled: true },
    { id: "notifications", label: "Notificaciones", icon: <Bell size={18} />, disabled: true },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate("/workspaces")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Volver a Workspaces
        </button>
      </div>

      <HeroBanner
        icon={<Settings />}
        label="Configuración"
        title={`Ajustes de ${workspace.name}`}
        titleHighlight="del Workspace"
        description="Administra los detalles de tu espacio de trabajo, configura webhooks e invitaciones."
        colorScheme="indigo"
      />

      <div className="flex flex-col gap-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as Tab)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-all relative ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              } ${tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.disabled && (
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded leading-none">Soon</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-2 min-h-[400px]">
          {activeTab === "general" && (
            <GeneralSettings 
              workspace={workspace} 
              onUpdate={(updated) => setWorkspace(updated)} 
            />
          )}
          {activeTab === "webhooks" && (
            <WebhooksSettings workspaceId={workspace.id} />
          )}
          {activeTab === "portability" && (
            <PortabilitySettings workspaceId={workspace.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
