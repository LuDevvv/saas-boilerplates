import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { client } from "../../../lib/api";
import { toast } from "sonner";
import { useUser } from "../../../hooks/useUser";
import { Button, Input } from "@workspace/ui";
import { FileUpload } from "../../shared/FileUpload";
import { Loader2, Mail, User as UserIcon } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, updateUser } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const usersApi = client.api.users.me as any;
      const res = await usersApi.$patch({
        json: {
          name: data.name,
          avatarUrl: data.avatarUrl || undefined,
        },
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        updateUser({ name: data.name, avatarUrl: data.avatarUrl });
        reset(data);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("[ProfileForm] Error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleUploadComplete = async (url: string) => {
    setValue("avatarUrl", url, { shouldDirty: true });

    const currentName = getValues("name");
    await onSubmit({ name: currentName, avatarUrl: url });
    toast.info("Profile picture updated!");
  };

  if (!user) {
    return (
      <div className="dashboard-card border-none p-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--brand-primary))]" />
        <p className="text-[#8E95A2] font-bold text-sm uppercase tracking-widest">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="dashboard-card border-none overflow-hidden">
        <div className="p-8 border-b border-[#F8F9FB]">
          <h3 className="text-xl font-bold text-[#1A1D1F]">
            Personal Information
          </h3>
          <p className="text-sm font-medium text-[#8E95A2] mt-0.5">
            Update your profile details and public avatar.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <div className="relative group">
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="rounded-xl border-[#F1F3F6] bg-[#F8F9FB] h-12 cursor-not-allowed font-medium text-[#1A1D1F]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8E95A2] uppercase bg-white border border-[#F1F3F6] px-2 py-0.5 rounded-md">
                  Fixed
                </div>
              </div>
              <p className="text-[10px] text-[#8E95A2] font-bold px-1">
                Emails are managed by authentication providers.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                Full Name
              </label>
              <Input
                {...register("name")}
                placeholder="Alex Doe"
                className={`rounded-xl border-[#F1F3F6] h-12 focus:bg-white transition-all font-bold text-[#1A1D1F] ${
                  errors.name
                    ? "border-red-400 ring-2 ring-red-400/10"
                    : "bg-[#F8F9FB]"
                }`}
              />
              {errors.name && (
                <p className="text-xs font-bold text-red-400 px-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] px-1">
              Profile Picture
            </label>
            <div className="p-6 bg-[#F8F9FB] rounded-2xl border-2 border-dashed border-[#F1F3F6] hover:border-[hsl(var(--brand-primary))/30] transition-colors">
              <FileUpload
                currentValue={user.avatarUrl}
                onUploadComplete={handleUploadComplete}
              />
            </div>
            {errors.avatarUrl && (
              <p className="text-xs font-bold text-red-400 px-1">
                {errors.avatarUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#F8F9FB] border-t border-[#F1F3F6] p-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))/90] rounded-xl px-10 py-6 font-bold shadow-lg shadow-[hsl(var(--brand-primary))/20] h-12"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
