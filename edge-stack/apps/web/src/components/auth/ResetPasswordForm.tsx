import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormField,
} from "@workspace/ui";
import { client } from "../../lib/api";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ResetPasswordSchema } from "@workspace/validators";
import { Logo } from "../Logo";
import { z } from "zod";

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  });

  // Manually set token in form since useEffect might run after useForm init
  useEffect(() => {
    if (token) {
      register("token").onChange({ target: { value: token, name: "token" } });
    }
  }, [token, register]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    try {
      const api = client.api as any;
      const res = await api.auth["reset-password"].$post({
        json: {
          ...data,
          token,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Reset failed");
      }

      toast.success("Password successfully updated");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="border-none shadow-none bg-transparent w-full max-w-[400px] mx-auto">
        <CardHeader className="space-y-4 pb-8 text-center pt-12">
          <CardTitle className="text-2xl font-bold">
            Invalid Reset Link
          </CardTitle>
          <CardDescription>
            This link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full h-12 rounded-xl font-bold"
            onClick={() => (window.location.href = "/forgot-password")}
          >
            Request new link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent w-full max-w-[400px] mx-auto">
      <CardHeader className="space-y-1 pb-8 text-center sm:text-left pt-12">
        <div className="flex justify-center sm:justify-start mb-6">
          <Logo size="lg" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          New Password
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground">
          Set a secure password to protect your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <input type="hidden" {...register("token")} value={token} />

          <FormField
            label="New Password"
            error={errors.password?.message}
            htmlFor="password"
          >
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...register("password")}
              disabled={isLoading}
              error={!!errors.password}
              className="h-12 px-4 rounded-xl"
            />
          </FormField>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </CardContent>
        <CardFooter className="pt-2 pb-12">
          <p className="text-xs text-center w-full text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure password encryption enabled
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
