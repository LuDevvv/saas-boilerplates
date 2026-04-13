import { FC, useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  ChevronRight,
  Monitor,
  Trash2,
  MoreVertical
} from "lucide-react";
import { workspaceService, WorkspaceItem } from "@/services/workspaces/workspaceService";
import { cn } from "@/utils/classNames";
import { Button } from "@/components/ui/form/Button";
import { ModalLayout } from "@/layouts/ModalLayout";
import { Input } from "@/components/ui/form/Input";
import { appToast } from "@/components/alerts/Toasts";

const WorkspacesPage: FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceItem | null>(null);
  const [formData, setFormData] = useState({ name: "", location: "" });

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const stored = localStorage.getItem('dash_workspaces');
        if (stored) {
          setWorkspaces(JSON.parse(stored));
          setLoading(false);
          return;
        }

        const response = await workspaceService.getWorkspaces();
        const initialWorkspaces = response.workspaces || [];
        setWorkspaces(initialWorkspaces);
        localStorage.setItem('dash_workspaces', JSON.stringify(initialWorkspaces));
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const saveWorkspaces = (newWs: WorkspaceItem[]) => {
    setWorkspaces(newWs);
    localStorage.setItem('dash_workspaces', JSON.stringify(newWs));
  };

  const openCreateModal = () => {
    setEditingWorkspace(null);
    setFormData({ name: "", location: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (ws: WorkspaceItem) => {
    setEditingWorkspace(ws);
    setFormData({ name: ws.name, location: ws.location });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      appToast.error({ title: "Validation Error", description: "Workspace name is required" });
      return;
    }

    if (editingWorkspace) {
      const updated = workspaces.map(ws => 
        ws.id === editingWorkspace.id ? { ...ws, ...formData } : ws
      );
      saveWorkspaces(updated);
      appToast.success({ title: "Workspace Updated", description: `${formData.name} was successfully modified.` });
    } else {
      const newWs: WorkspaceItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        location: formData.location || "Global",
        members: 1,
        status: 'active',
        lastActive: 'Just now'
      };
      saveWorkspaces([newWs, ...workspaces]);
      appToast.success({ title: "Workspace Created", description: `${formData.name} is ready.` });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    saveWorkspaces(workspaces.filter(ws => ws.id !== id));
    appToast.success({ title: "Workspace Deleted", description: "The workspace has been removed." });
  };

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ws.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Workspaces
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your globally distributed work environments.
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          icon={Plus}
          className="rounded-xl h-11 px-6 font-bold tracking-wide active:scale-95 transition-all text-[11px] uppercase shadow-lg shadow-primary-500/10"
        >
          Create New Workspace
        </Button>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search workspaces..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((ws) => (
          <div 
            key={ws.id}
            className="group bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Monitor size={24} />
                </div>
                <Button 
                  onClick={() => openEditModal(ws)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <MoreVertical size={20} />
                </Button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {ws.name}
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin size={16} />
                  {ws.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users size={16} />
                  {ws.members} members
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ws.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'
                  )} />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {ws.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {ws.lastActive}
                </span>
              </div>
            </div>

            <Button 
              variant="secondary"
              fullWidth
              className="rounded-none h-14 hover:bg-primary-500 hover:text-white"
            >
              Launch Workspace
              <ChevronRight size={16} />
            </Button>
          </div>
        ))}

        {/* Empty State / Add New */}
        <button 
          onClick={openCreateModal}
          className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
            <Plus size={32} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">Add New Hub</p>
            <p className="text-sm text-gray-500">Scalable infrastructure</p>
          </div>
        </button>
      </div>

      {/* CRUD Modal */}
      <ModalLayout
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkspace ? "Edit Workspace" : "New Workspace"}
        subtitle={editingWorkspace ? "Update environment details" : "Configure a new global hub"}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSave}>
              {editingWorkspace ? "Save Changes" : "Create Workspace"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 py-2">
          <Input 
            label="Workspace Name"
            placeholder="e.g. San Francisco HQ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input 
            label="Location / Region"
            placeholder="e.g. US-WEST-2"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          
          {editingWorkspace && (
            <div className="mt-4 pt-6 border-t border-gray-100 dark:border-white/5">
              <Button 
                variant="danger" 
                fullWidth 
                icon={Trash2}
                onClick={() => {
                  handleDelete(editingWorkspace.id);
                  setIsModalOpen(false);
                }}
              >
                Permanently Delete Workspace
              </Button>
            </div>
          )}
        </div>
      </ModalLayout>
    </div>
  );
};

export default WorkspacesPage;
