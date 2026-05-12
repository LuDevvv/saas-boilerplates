import { Button, CalloutCard, SearchInput, StatRow } from "@node-stack/ui";
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  X,
  Mail,
} from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InviteMemberModal } from "../components/InviteMemberModal";
import { MembersList } from "../components/MembersList";
import {
  useWorkspaceMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useWorkspaceInvitations,
  useCancelInvitation,
} from "../hooks/useWorkspaceMembers";

import { useAuth } from "@/hooks/stores/useAuth";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/utils/classNames";

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const Pagination: FC<{
  page: number;
  total: number;
  filtered: number;
  onChange: (p: number) => void;
}> = ({ page, total, filtered, onChange }) => (
  <div className="flex items-center justify-between gap-3 pt-1">
    <p className="text-[12px] text-fg-muted">
      {filtered} miembro{filtered !== 1 ? "s" : ""}
      {total > 1 && ` · Página ${page} de ${total}`}
    </p>
    {total > 1 && (
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-fg-secondary disabled:opacity-35 hover:bg-surface-hover transition-all disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          disabled={page >= total}
          onClick={() => onChange(page + 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-fg-secondary disabled:opacity-35 hover:bg-surface-hover transition-all disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyMembers: FC<{ hasSearch: boolean; onInvite: () => void }> = ({
  hasSearch,
  onInvite,
}) => (
  <div className="rounded-[20px] border border-border bg-white dark:bg-surface">
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-14 w-14 rounded-full bg-surface-hover flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-[14px] font-semibold text-fg">
        {hasSearch ? "Sin resultados" : "No hay miembros"}
      </p>
      <p className="text-[13px] text-fg-muted mt-1 max-w-xs leading-relaxed">
        {hasSearch
          ? "Prueba con otro nombre o correo electrónico."
          : "Invita a tu primer compañero para empezar a colaborar."}
      </p>
      {!hasSearch && (
        <Button
          onClick={onInvite}
          className="mt-5 h-10 px-6 rounded-xl bg-primary hover:bg-primary-600 text-white text-[12px] font-bold uppercase shadow-lg shadow-primary/20"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar ahora
        </Button>
      )}
    </div>
  </div>
);

// ─── Role definitions for the guide card ─────────────────────────────────────

const ROLE_DEFS = [
  {
    icon: ShieldCheck,
    label: "Administrador",
    hint: "Control total: miembros, configuración y facturación.",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: User,
    label: "Miembro",
    hint: "Puede crear y editar recursos de la compañía.",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Eye,
    label: "Invitado",
    hint: "Solo puede visualizar los recursos compartidos.",
    iconBg: "bg-surface-hover",
    iconColor: "text-fg-secondary",
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  owner: "Propietario", admin: "Administrador", member: "Miembro", guest: "Invitado",
};

const MembersPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: members, isLoading } = useWorkspaceMembers(activeWorkspaceId);
  const { data: pendingInvitations } = useWorkspaceInvitations(activeWorkspaceId);
  const inviteMutation = useInviteMember(activeWorkspaceId);
  const updateRoleMutation = useUpdateMemberRole(activeWorkspaceId);
  const removeMutation = useRemoveMember(activeWorkspaceId);
  const cancelInviteMutation = useCancelInvitation(activeWorkspaceId);

  const canInvite = useMemo(
    () => members?.find(m => m.userId === currentUser?.id)?.role !== "member",
    [members, currentUser?.id]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return members || [];
    const q = search.toLowerCase();
    return (members || []).filter(m => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = m.user as any;
      const name = `${user.firstName || ""} ${user.lastName || ""} ${user.name || ""}`.toLowerCase();
      return name.includes(q) || (user.email || "").toLowerCase().includes(q);
    });
  }, [members, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase  text-fg-muted mb-1">
            Compañía
          </p>
          <h1 className="text-xl sm:text-2xl font-heading text-fg leading-tight">
            Equipo
          </h1>
          <p className="text-[13px] text-fg-muted mt-0.5">
            Gestiona los miembros y permisos de tu compañía.
          </p>
        </div>
        {/* Desktop-only invite button */}
        {canInvite && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="hidden sm:inline-flex shrink-0 self-start h-10 px-5 rounded-xl bg-primary hover:bg-primary-600 text-white text-[12px] font-medium shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar miembro
          </Button>
        )}
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: members list ── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search — scoped to list column on desktop */}
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nombre o correo..."
            size="md"
          />

          {/* Mobile-only invite button — full width, below search */}
          {canInvite && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="sm:hidden w-full h-10 rounded-xl bg-primary hover:bg-primary-600 text-white text-[13px] font-medium shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar miembro
            </Button>
          )}
          {isLoading ? (
            <MembersList
              members={[]}
              isLoading
              onUpdateRole={() => { }}
              onRemove={() => { }}
            />
          ) : filtered.length === 0 ? (
            <EmptyMembers
              hasSearch={search.trim().length > 0}
              onInvite={() => setIsInviteOpen(true)}
            />
          ) : (
            <>
              <MembersList
                members={paginated}
                isLoading={false}
                onUpdateRole={(id, role) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  updateRoleMutation.mutate({ memberId: id, role: role as any })
                }
                onRemove={(id) => removeMutation.mutate(id)}
                currentUserId={currentUser?.id}
              />
              <Pagination
                page={page}
                total={totalPages}
                filtered={filtered.length}
                onChange={setPage}
              />
            </>
          )}

          {/* ── Pending Invitations (inside left col to stay within grid) ── */}
          {canInvite && (pendingInvitations?.length ?? 0) > 0 && (
            <div className="space-y-2 pt-2">
              {/* Section header */}
              <div className="flex items-center gap-2 px-0.5">
                <Clock className="h-3.5 w-3.5 text-fg-muted" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                  Invitaciones pendientes
                </p>
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold tabular-nums">
                  {pendingInvitations?.length}
                </span>
              </div>

              {/* Invitation rows — styled like the member table */}
              <div className="rounded-[14px] border border-border bg-white dark:bg-surface overflow-hidden">
                <div className="divide-y divide-border">
                  {pendingInvitations?.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-3 px-4 py-3 group">
                      {/* Avatar placeholder */}
                      <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-amber-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-fg truncate leading-snug">
                          {inv.email}
                        </p>
                        <p className="text-[11px] text-fg-muted mt-0.5">
                          {ROLE_LABEL[inv.role] ?? inv.role} · Expira{" "}
                          {new Date(inv.expiresAt).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short",
                          })}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className="shrink-0 inline-flex items-center h-[22px] px-2.5 rounded-full border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                        Pendiente
                      </span>

                      {/* Cancel button */}
                      <button
                        onClick={() => cancelInviteMutation.mutate(inv.id)}
                        disabled={cancelInviteMutation.isPending}
                        title="Cancelar invitación"
                        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-[8px] text-fg-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: side panel ── */}
        <div className="space-y-4">

          {/* Role guide */}
          <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="h-9 w-9 rounded-[11px] bg-surface-hover flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-fg-secondary" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-fg leading-snug">
                  Roles
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Niveles de acceso
                </p>
              </div>
            </div>
            <div className="space-y-3.5">
              {ROLE_DEFS.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-start gap-3">
                    <div className={cn(
                      "h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5",
                      r.iconBg
                    )}>
                      <Icon className={cn("h-3.5 w-3.5", r.iconColor)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-fg">
                        {r.label}
                      </p>
                      <p className="text-[11px] text-fg-muted leading-relaxed mt-0.5">
                        {r.hint}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Member count summary — shown only when data loaded */}
          {!isLoading && (members?.length ?? 0) > 0 && (
            <div className="rounded-[20px] border border-border bg-surface p-5">
              <p className="text-[11px] font-bold uppercase  text-fg-muted mb-2">
                Resumen
              </p>
              <div className="divide-y divide-border-subtle">
                <StatRow
                  icon={Users}
                  label="Total miembros"
                  value={members?.length ?? 0}
                />
                {(["owner", "admin", "member", "guest"] as const).map(role => {
                  const count = (members || []).filter(m => m.role === role).length;
                  if (!count) return null;
                  const labelMap = {
                    owner: "Propietario",
                    admin: "Administrador",
                    member: "Miembro",
                    guest: "Invitado",
                  };
                  const iconMap = {
                    owner: ShieldCheck,
                    admin: ShieldCheck,
                    member: User,
                    guest: Eye,
                  };
                  return (
                    <StatRow
                      key={role}
                      icon={iconMap[role]}
                      label={labelMap[role]}
                      value={count}
                      compact
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Upgrade card */}
          <CalloutCard
            icon={Sparkles}
            variant="promo"
            title="Equipos ilimitados"
            description="Desbloquea roles personalizados y colaboración avanzada con el plan Enterprise."
            action={
              <button
                onClick={() => navigate("/payments/pricing")}
                className="w-full h-9 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-bold uppercase transition-all active:scale-[0.98]"
              >
                Ver planes
              </button>
            }
          />
        </div>
      </div>

      {/* ── Invite drawer ── */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        isLoading={inviteMutation.isPending}
        onInvite={(data) => inviteMutation.mutateAsync(data)}
      />
    </div>
  );
};

export default MembersPage;
