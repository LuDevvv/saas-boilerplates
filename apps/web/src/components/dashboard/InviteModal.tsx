import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@workspace/ui";
import { client } from "../../lib/api";
import {
  Loader2,
  X,
  MailPlus,
  Shield,
  ChevronDown,
  Send,
  Command,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

const InviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

type InviteInput = z.infer<typeof InviteSchema>;

export function InviteModal({
  isOpen,
  onClose,
  onInviteSuccess,
}: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteInput>({
    resolver: zodResolver(InviteSchema),
    defaultValues: { role: "member" },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteInput) => {
    setIsLoading(true);

    try {
      const payloadRole = data.role === "viewer" ? "member" : data.role;
      const invitationsApi = client.api.workspaces.invitations as any;
      const res = await invitationsApi.$post({
        json: {
          email: data.email,
          role: payloadRole as any,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error?.message || "Failed to send invitation",
        );
      }

      toast.success(`Invitation dispatched to ${data.email}`);
      reset();
      onInviteSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1D1F]/40 backdrop-blur-2xl flex items-center justify-center p-6 selection:bg-[hsl(var(--brand-primary))/30] animate-in fade-in duration-500">
      <div className="w-full max-w-md animate-premium-in">
        <Card className="dashboard-card border-none overflow-hidden shadow-2xl bg-white/90 backdrop-blur-md">
          <div className="h-1.5 w-full bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[#16C8C7] to-[hsl(var(--brand-primary))]" />
          <div className="p-10 border-b border-[#F1F3F6] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1D1F] text-white flex items-center justify-center shadow-xl">
                <MailPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1A1D1F] tracking-tighter italic leading-none">
                  Provision Access
                </h3>
                <p className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.2em] mt-1 italic">
                  Team Expansion Protocol
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-2xl text-[#C1C7D0] hover:text-[#1A1D1F] hover:bg-[#F8F9FB] w-12 h-12"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-[#1A1D1F] uppercase tracking-[0.3em] italic">
                    Email Destination
                  </label>
                  <Activity className="w-3 h-3 text-[#16C8C7] animate-pulse" />
                </div>
                <div className="relative group">
                  <Input
                    placeholder="colleague@edgestack.v8"
                    type="email"
                    {...register("email")}
                    disabled={isLoading}
                    className="bg-[#F8F9FB] border border-[#F1F3F6] rounded-2xl h-16 px-6 font-black italic text-[#1A1D1F] placeholder:text-[#C1C7D0] focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] transition-all shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Command className="w-4 h-4 text-[#C1C7D0]" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1 italic">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#1A1D1F] uppercase tracking-[0.3em] pl-1 italic">
                  Authorized Policy
                </label>
                <div className="relative group/select">
                  <select
                    {...register("role")}
                    disabled={isLoading}
                    className="appearance-none flex h-16 w-full items-center justify-between rounded-2xl border border-[#F1F3F6] bg-[#F8F9FB] px-6 font-black italic text-[#1A1D1F] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))] disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="admin">Administrator Protocol</option>
                    <option value="member">Standard Editor Policy</option>
                    <option value="viewer">Read-Only Observation</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#C1C7D0] group-hover/select:text-[hsl(var(--brand-primary))] transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[hsl(var(--brand-primary))] rounded-r-full opacity-0 group-hover/select:opacity-100 transition-opacity" />
                </div>
                {errors.role && (
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1 italic">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </CardContent>

            <div className="p-10 pt-4 flex items-center justify-between bg-[#F8F9FB]/50 border-t border-[#F1F3F6]">
              <div className="flex items-center gap-3 text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
                <Shield className="w-4 h-4" />
                Secure Dispatch
              </div>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#C1C7D0] hover:text-[#1A1D1F] px-8 italic"
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#1A1D1F] hover:bg-black text-white rounded-2xl px-10 h-14 font-black italic shadow-2xl shadow-black/10 group/send relative overflow-hidden border-none text-[10px] uppercase tracking-[0.2em]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-teal))] opacity-0 group-hover/send:opacity-10 transition-opacity" />
                  <span className="relative z-10 flex items-center">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-3 group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform duration-300" />
                    )}
                    Initialize Invite
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
