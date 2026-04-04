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
import { client } from "../../lib/api";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  ForgotPasswordSchema,
  type RegisterInput,
} from "@workspace/validators";
import { Logo } from "../Logo";

// Use a subset of RegisterInput for ForgotPassword
type ForgotPasswordInput = { email: string };

export const ForgotPasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const api = client.api as any;
      const res = await api.auth.recovery.$post({
        json: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Request failed");
      }

      setIsSuccess(true);
      toast.success("Recovery email sent");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-none shadow-none bg-transparent w-full max-w-[400px] mx-auto">
        <CardHeader className="space-y-4 pb-8 text-center pt-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground">
            We've sent a password reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2 pb-12">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-bold"
            onClick={() => (window.location.href = "/login")}
          >
            Return to login
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
          Reset Password
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground">
          Enter your email address and we'll send you a recovery link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <FormField
            label="Email Address"
            error={errors.email?.message}
            htmlFor="email"
          >
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
              error={!!errors.email}
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
                Sending Link...
              </>
            ) : (
              "Send recovery link"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 pt-2 pb-12">
          <div className="text-center w-full">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
