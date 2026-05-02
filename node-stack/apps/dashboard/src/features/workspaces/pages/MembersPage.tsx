import { FC, useState } from "react";
import { Users, UserPlus, ShieldCheck } from "lucide-react";
import { Button, Card, EmptyState } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuth } from "@/hooks/stores/useAuth";
import { useWorkspaceMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from "../hooks/useWorkspaceMembers";
import { MembersTable } from "../components/MembersTable";
import { InviteMemberModal } from "../components/InviteMemberModal";

const MembersPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user: currentUser } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: members, isLoading } = useWorkspaceMembers(activeWorkspaceId);
  const inviteMutation = useInviteMember(activeWorkspaceId);
  const updateRoleMutation = useUpdateMemberRole(activeWorkspaceId);
  const removeMutation = useRemoveMember(activeWorkspaceId);

  const canInvite = members?.find(m => m.userId === currentUser?.id)?.role !== "member";

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Miembros del Equipo"
        subtitle="Gestiona quién tiene acceso a este espacio de trabajo y sus permisos."
        action={
          canInvite && (
            <Button 
              onClick={() => setIsInviteModalOpen(true)}
              className="rounded-2xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-[10px] h-11 px-6 shadow-lg shadow-primary/20"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar Miembro
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isLoading && members?.length === 0 ? (
            <EmptyState
              title="No hay miembros"
              description="Invita a tu primer compañero de equipo para empezar a colaborar."
              icon={Users}
              action={<Button onClick={() => setIsInviteModalOpen(true)}>Invitar ahora</Button>}
            />
          ) : (
            <MembersTable
              members={members || []}
              isLoading={isLoading}
              onUpdateRole={(id, role) => updateRoleMutation.mutate({ memberId: id, role })}
              onRemove={(id) => removeMutation.mutate(id)}
              currentUserId={currentUser?.id}
            />
          )}
        </div>

        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/5 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Gestión de Roles</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-heading text-slate-900 dark:text-white uppercase mb-1">Administrador</p>
                <p className="text-[12px] text-slate-500 font-label leading-relaxed">Control total sobre el espacio, incluyendo facturación y miembros.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-heading text-slate-900 dark:text-white uppercase mb-1">Miembro</p>
                <p className="text-[12px] text-slate-500 font-label leading-relaxed">Acceso completo a las herramientas y recursos del espacio.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-heading text-slate-900 dark:text-white uppercase mb-1">Invitado</p>
                <p className="text-[12px] text-slate-500 font-label leading-relaxed">Acceso limitado solo para visualizar recursos específicos.</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 rounded-[32px] border-none bg-primary dark:bg-primary/20 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-sm font-heading uppercase mb-2 relative z-10">Colaboración Pro</h4>
            <p className="text-[11px] text-white/70 leading-relaxed mb-6 relative z-10">
              Desbloquea equipos ilimitados y roles personalizados con nuestro plan Enterprise.
            </p>
            <Button
              variant="ghost"
              className="w-full rounded-xl bg-white/10 text-white hover:bg-white/20 text-[10px] font-heading uppercase relative z-10"
              onClick={() => window.location.href = "/payments/pricing"}
            >
              Saber más
            </Button>
          </Card>
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        isLoading={inviteMutation.isPending}
        onInvite={async (data) => {
          await inviteMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};

export default MembersPage;
