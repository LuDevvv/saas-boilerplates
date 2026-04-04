import { useState, useEffect } from "react";
import { AppShell } from "./AppShell";
import { useWorkspace } from "../../hooks/useWorkspace";
import { InviteModal } from "./InviteModal";
import { Button, Card, CardContent } from "@workspace/ui";
import { client } from "../../lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Users,
  Mail,
  Clock,
  MoreHorizontal,
  Shield,
  User,
  Globe,
  Zap,
  Fingerprint,
  ShieldAlert,
  Activity,
  Command,
} from "lucide-react";
import { EmptyState } from "./EmptyState";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export function TeamManager() {
  return (
    <AppShell>
      <TeamManagerContent />
    </AppShell>
  );
}

function TeamManagerContent() {
  const { activeWorkspace, isOrg } = useWorkspace();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const membersApi = client.api.workspaces.members as any;
      const invitationsApi = client.api.workspaces.invitations as any;

      const [membersRes, invitesRes] = await Promise.all([
        membersApi.$get(),
        invitationsApi.$get(),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers((data.data || []) as Member[]);
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvitations(data.data || []);
      }
    } catch (error) {
      toast.error("Cluster sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOrg) {
      fetchData();
    }
  }, [isOrg]);

  if (!isOrg) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-6 animate-premium-in">
        <EmptyState
          title="Namespace Isolation"
          description="Team management protocols are restricted to Organization nodes. Elevate your environment to access enterprise-grade collaboration."
          icon={<ShieldAlert className="w-12 h-12" />}
          actionLabel="Initialize Organization Node"
          onAction={() => (window.location.href = "/workspaces")}
        />
      </div>
    );
  }

  const canInvite =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-12 animate-premium-in selection:bg-[hsl(var(--brand-primary))/30]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[#F1F3F6]">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] border border-[#F1F3F6] flex items-center justify-center text-[#1A1D1F] shadow-xl shadow-black/5">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-premium-gradient tracking-tighter italic">
                  Team Helix
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#16C8C7] animate-pulse" />
                  <p className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.2em] italic">
                    Cluster Personnel Protocol v2.5
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[#8E95A2] font-semibold text-sm leading-relaxed max-w-lg italic">
              Assign access levels and manage the neural network of your
              workspace participants. High-integrity authorization required for
              all operations.
            </p>
          </div>
          {canInvite && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-teal))] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <Button
                onClick={() => setIsInviteModalOpen(true)}
                className="relative bg-[#1A1D1F] hover:bg-black text-white rounded-2xl px-10 h-16 font-black italic shadow-xl shadow-black/10 group overflow-hidden border-none text-[10px] uppercase tracking-[0.2em]"
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500"
                    strokeWidth={4}
                  />
                  Provision New Access
                </span>
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(var(--brand-primary))] rounded-full blur-[40px] opacity-20 animate-pulse" />
              <Loader2
                className="w-20 h-20 animate-spin text-[#1A1D1F]"
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#16C8C7]" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-[#1A1D1F] uppercase tracking-[0.4em] italic animate-pulse">
                Syncing Helix Protocols
              </p>
              <p className="text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.2em]">
                Verifying Authorization Codes...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-16">
            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-[1px] w-8 bg-[hsl(var(--brand-blue))/20]" />
                  <h2 className="text-[10px] font-black text-[hsl(var(--brand-blue))] uppercase tracking-[0.4em] italic flex items-center gap-3">
                    <Mail className="w-3.5 h-3.5" />
                    Awaiting Acceptance
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[hsl(var(--brand-blue))/20] to-transparent" />
                </div>

                <Card className="dashboard-card border-none overflow-hidden bg-white shadow-2xl shadow-black/[0.02]">
                  <CardContent className="p-0">
                    <div className="divide-y divide-[#F1F3F6]">
                      {invitations.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-10 hover:bg-[#F8F9FB] transition-all duration-500 group relative"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--brand-blue))] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#F8F9FB] border border-[#F1F3F6] text-[#C1C7D0] flex items-center justify-center group-hover:bg-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                              <Mail className="w-7 h-7" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xl font-black text-[#1A1D1F] tracking-tighter italic group-hover:text-[hsl(var(--brand-blue))] transition-colors leading-none">
                                {invite.email}
                              </p>
                              <div className="flex items-center gap-4">
                                <p className="text-[10px] text-[#C1C7D0] font-black flex items-center gap-2 uppercase tracking-[0.15em] italic">
                                  <Clock className="w-3.5 h-3.5" />
                                  Expiring in{" "}
                                  {Math.round(
                                    (new Date(invite.expiresAt).getTime() -
                                      Date.now()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  Days
                                </p>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#E1E5EB]" />
                                <p className="text-[10px] text-[#C1C7D0] font-black uppercase tracking-[0.15em] italic">
                                  Node ID: {invite.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="px-5 py-2.5 bg-[#F8F9FB] rounded-xl border border-[#F1F3F6] group-hover:bg-[hsl(var(--brand-blue))/5] group-hover:border-[hsl(var(--brand-blue))/10] transition-colors">
                              <span className="text-[10px] font-black text-[#1A1D1F] uppercase tracking-[0.2em] italic">
                                Policy: {invite.role.toUpperCase()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-14 w-14 rounded-2xl text-[#C1C7D0] hover:bg-[#1A1D1F] hover:text-white transition-all duration-300"
                            >
                              <MoreHorizontal className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-5 bg-[#F8F9FB] border-t border-[#F1F3F6] flex items-center justify-between px-10">
                    <p className="text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
                      Broadcast Protocol active for {invitations.length} nodes
                    </p>
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--brand-blue))] animate-ping" />
                  </div>
                </Card>
              </div>
            )}

            {/* Active Members */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-4">
                <div className="h-[1px] w-8 bg-[hsl(var(--brand-primary))/20]" />
                <h2 className="text-[10px] font-black text-[hsl(var(--brand-primary))] uppercase tracking-[0.4em] italic flex items-center gap-3">
                  <Shield className="w-3.5 h-3.5" />
                  Verified Personnel
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[hsl(var(--brand-primary))/20] to-transparent" />
              </div>

              <Card className="dashboard-card border-none overflow-hidden bg-white shadow-2xl shadow-black/[0.02]">
                <CardContent className="p-0">
                  {members.length === 0 ? (
                    <div className="py-32 bg-[#F8F9FB]/30">
                      <EmptyState
                        title="Zero Operators Detected"
                        description="This helix has no active participants. Provision access to begin synchronization."
                        icon={<Users className="w-12 h-12" />}
                        actionLabel={
                          canInvite ? "Initiate Provisioning" : undefined
                        }
                        onAction={
                          canInvite
                            ? () => setIsInviteModalOpen(true)
                            : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1F3F6]">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-10 hover:bg-[#F8F9FB] transition-all duration-500 group relative"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--brand-primary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-8">
                            <div className="relative">
                              <div className="w-18 h-18 rounded-[2rem] bg-[#1A1D1F] text-white flex items-center justify-center font-black text-2xl italic shadow-2xl shadow-black/20 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F8F9FB] border-4 border-white flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#16C8C7]" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <p className="font-black text-[#1A1D1F] tracking-tighter italic text-2xl group-hover:text-[hsl(var(--brand-primary))] transition-colors leading-none">
                                  {member.name}
                                </p>
                                {member.role === "owner" && (
                                  <span className="px-2 py-0.5 bg-[hsl(var(--brand-primary))/10] rounded-md text-[8px] font-black text-[hsl(var(--brand-primary))] tracking-widest uppercase">
                                    Root
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#C1C7D0] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                <Fingerprint className="w-3.5 h-3.5" />
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="px-6 py-3 bg-[#F8F9FB] rounded-2xl border border-[#F1F3F6] flex items-center gap-3 group-hover:bg-[#1A1D1F] group-hover:text-white transition-all duration-500 shadow-sm">
                              {member.role === "owner" ? (
                                <Shield className="w-4 h-4 text-[#16C8C7]" />
                              ) : (
                                <User className="w-4 h-4 text-[#C1C7D0] group-hover:text-white/60" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                                {member.role.toUpperCase()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-16 w-16 rounded-[2rem] text-[#C1C7D0] hover:bg-[#1A1D1F] hover:text-white transition-all duration-300"
                            >
                              <MoreHorizontal className="w-7 h-7" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <div className="p-5 bg-white border-t border-[#F1F3F6] flex items-center justify-between px-10">
                  <div className="flex items-center gap-3 text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
                    <Command className="w-3.5 h-3.5" />
                    Access Matrix: RBAC-EDGESTACK-V1
                  </div>
                  <div className="text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
                    Helix Integrity: 100%
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={() => fetchData()}
      />
    </>
  );
}
