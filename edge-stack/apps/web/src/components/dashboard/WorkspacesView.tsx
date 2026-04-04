import { useState } from "react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useUI } from "../../hooks/useUI";
import {
  Button,
  Card,
  CardContent,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui";
import {
  Plus,
  ArrowRight,
  Loader2,
  X,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Shield,
  Server,
  Activity,
  Database,
  Sparkles,
} from "lucide-react";
import { client } from "../../lib/api";
import { toast } from "sonner";
import { EmptyState } from "./EmptyState";
import { cn } from "@workspace/ui";

export function WorkspacesView() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { isLoading } = useUI();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const spacesApi = (client.api as any).workspaces;
      const res = await spacesApi.$post({
        json: { name: newWorkspaceName.trim() },
      });

      if (res.ok) {
        toast.success("Workspace Initialized", {
          description: "Your new EdgeStack node is ready for deployment.",
        });
        setIsCreateModalOpen(false);
        setNewWorkspaceName("");
        // Force reload to pick up new workspace in context
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to provision workspace");
      }
    } catch (error) {
      toast.error("An unexpected network error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse" />
          <div className="relative bg-background/50 backdrop-blur-xl border border-border/50 rounded-3xl p-10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">
            Syncing Shared Nodes
          </p>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest italic">
            Global Infrastructure Protocol
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-premium-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b border-border/50 relative overflow-hidden group">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Server className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-5xl font-black text-foreground tracking-tighter hover:tracking-tight transition-all duration-700">
                Workspaces
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
                  Environment Clusters
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground font-medium text-base leading-relaxed max-w-lg">
            Orchestrate your global team deployment and synchronize
            organizational endpoints with decentralized efficiency.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-foreground hover:bg-foreground/90 text-background rounded-2xl px-10 h-16 font-bold shadow-2xl shadow-foreground/10 group transition-all duration-500 hover:-translate-y-1 active:scale-95 text-base border-t border-white/10"
        >
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
          Provision New Node
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="py-24">
          <EmptyState
            title="No Workspace Nodes Detected"
            description="You are currently isolated. Provision a new EdgeStack workspace to begin global collaboration."
            icon={<Globe className="w-12 h-12 text-primary/40" />}
            actionLabel="Initialize Node"
            onAction={() => setIsCreateModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace?.id;

            return (
              <Card
                key={workspace.id}
                className={cn(
                  "group relative flex flex-col border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-700 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] hover:border-primary/30 rounded-[2.5rem]",
                  isActive &&
                    "border-primary/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ring-1 ring-primary/20",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-full transition-all duration-700",
                    isActive
                      ? "bg-primary animate-pulse"
                      : "bg-transparent group-hover:bg-primary/20",
                  )}
                />

                <CardContent className="p-10 flex flex-col h-full space-y-10">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl transition-all duration-700 group-hover:scale-110 shadow-inner border border-border/50",
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-secondary/50 text-foreground group-hover:border-primary/20 group-hover:bg-primary/5 h-20 w-20",
                      )}
                    >
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </div>
                    {isActive ? (
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-sm animate-in zoom-in-95 duration-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Active Node
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-secondary/50 text-muted-foreground/60 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        Inactive
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 flex-grow">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-all duration-500">
                        {workspace.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-80">
                          {workspace.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-muted-foreground rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-[0.1em] backdrop-blur-sm shadow-sm group-hover:bg-primary/5 transition-colors">
                        <Shield className="w-3.5 h-3.5 text-primary/60" />
                        {workspace.role}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-muted-foreground rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-[0.1em] backdrop-blur-sm shadow-sm group-hover:bg-primary/5 transition-colors">
                        <Activity className="w-3.5 h-3.5 text-emerald-500/60" />
                        Stable
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    {isActive ? (
                      <div className="flex items-center justify-between px-6 h-16 bg-primary/5 border border-primary/10 rounded-3xl text-[11px] font-black text-primary uppercase tracking-[0.3em] shadow-inner">
                        <div className="flex items-center gap-4">
                          <LayoutDashboard className="w-5 h-5 opacity-70" />
                          Current Context
                        </div>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full h-16 rounded-3xl font-black text-sm bg-secondary/80 hover:bg-foreground hover:text-background border border-border/50 hover:border-foreground transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-primary/10 tracking-widest uppercase"
                        onClick={() => switchWorkspace(workspace.id)}
                      >
                        Connect Cluster
                        <ArrowRight
                          className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform duration-500"
                          strokeWidth={3}
                        />
                      </Button>
                    )}
                  </div>
                </CardContent>

                {/* Geometric Accent */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-2 border-border/50 bg-background/95 backdrop-blur-2xl">
          <DialogHeader className="p-10 border-b border-border/50 bg-primary/[0.03] space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner ring-1 ring-primary/20">
                <Plus className="w-8 h-8" strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-4xl font-black text-foreground tracking-tighter">
                  Provision Node
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic opacity-70">
                  Finalizing Global Deployment Cluster
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace}>
            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Workspace Identifier
                </label>
                <div className="space-y-4">
                  <Input
                    placeholder="e.g. Production Infrastructure"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    disabled={isCreating}
                    required
                    className="h-20 px-8 font-black text-xl bg-secondary/30 rounded-3xl border-border/40 focus-visible:ring-primary/20 text-foreground transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground/50 font-bold px-2 uppercase tracking-widest leading-relaxed">
                    This protocol identifier will be synchronized across all
                    edge nodes in your network.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="p-10 bg-secondary/10 border-t border-border/50 flex-row justify-between items-center sm:justify-between">
              <div className="hidden sm:flex items-center gap-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                <Database className="w-5 h-5 opacity-30" />
                System Ready
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="rounded-2xl font-black text-muted-foreground px-8 border border-transparent hover:border-border/50 h-16 transition-all uppercase tracking-widest text-xs"
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newWorkspaceName.trim()}
                  className="flex-1 sm:flex-none h-16 rounded-3xl px-12 font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-base shadow-foreground/10"
                >
                  {isCreating ? (
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  ) : (
                    <Zap className="w-6 h-6 mr-3 text-primary animate-pulse" />
                  )}
                  Spawn Node
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
