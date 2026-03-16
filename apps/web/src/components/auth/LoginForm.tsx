import { useState } from "react";
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
import { client, setAuthToken } from "../../lib/api";
import { Loader2, Activity } from "lucide-react";
import { toast } from "sonner";
import { SocialButtons } from "./SocialButtons";
import { identifyUser } from "../../providers/PostHogProvider";
import { Logo } from "../Logo";
import { LoginSchema, type LoginInput } from "@workspace/validators";

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const api = client.api as any;
      const res = await api.auth.login.$post({
        json: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Login failed");
      }

      const successData = await res.json();

      if (successData.data.pending2fa) {
        window.location.href = `/auth/2fa-challenge?token=${successData.data.token}`;
        return;
      }

      setAuthToken(successData.data.token);

      // Analytics: Identify User
      identifyUser(successData.data.user.id, successData.data.user.email, {
        name: successData.data.user.name,
        login_method: "credentials",
      });

      toast.success("Authentication Successful");

      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");

      window.location.href = returnTo ? returnTo : "/dashboard";
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent w-full max-w-[400px] mx-auto">
      <CardHeader className="space-y-1 pb-8 text-center sm:text-left pt-12">
        <div className="flex justify-center sm:justify-start mb-6">
          <Logo size="lg" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Login to EdgeStack
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground">
          Grab high-class graphics and boost your design workflow
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium p-3 rounded-lg flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {error}
            </div>
          )}

          <FormField
            label="Email Address"
            error={errors.email?.message}
            htmlFor="email"
          >
            <Input
              id="email"
              type="email"
              placeholder="Email or username"
              {...register("email")}
              disabled={isLoading}
              error={!!errors.email}
              className="h-12 px-4 rounded-xl"
            />
          </FormField>

          <FormField
            label="Password"
            error={errors.password?.message}
            htmlFor="password"
          >
            <Input
              id="password"
              type="password"
              placeholder="Password"
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
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 pt-2 pb-12">
          <div className="w-full space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs font-medium text-muted-foreground">
                <span className="bg-background px-4">Or authorize with</span>
              </div>
            </div>

            <SocialButtons />

            <div className="text-center space-y-2 pt-4">
              <p>
                <a
                  href="/forgot-password"
                  className="text-sm font-bold hover:underline"
                >
                  Forgot password?
                </a>
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-foreground font-bold hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
