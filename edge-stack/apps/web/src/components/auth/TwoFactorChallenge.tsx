import { useState, useEffect } from "react";
import { Button } from "@workspace/ui";
import { Input } from "@workspace/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui";
import { setAuthToken } from "../../lib/api";
import { Loader2, Command } from "lucide-react";
import { toast } from "sonner";

export const TwoFactorChallenge = () => {
  const [code, setCode] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPendingToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingToken) {
      toast.error("Missing authentication token. Please log in again.");
      return (window.location.href = "/login");
    }

    if (code.length < 6) return toast.error("Please enter a valid code.");

    setIsLoading(true);

    try {
      const payload = recoveryMode ? { recoveryCode: code } : { token: code };

      const res = await fetch(
        `${import.meta.env.PUBLIC_API_URL || "http://localhost:8787"}/api/auth/2fa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pendingToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = (await res.json()) as any;
        throw new Error(errorData.error?.message || "Invalid code");
      }

      const successData = (await res.json()) as any;
      setAuthToken(successData.data.token);
      toast.success("Authentication successful!");

      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pendingToken) {
    return (
      <div className="min-h-[400px] flex items-center justify-center animate-pulse text-muted-foreground font-medium">
        Synchronizing Secure Session...
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent w-full max-w-[400px] mx-auto">
      <CardHeader className="space-y-1 pb-8 text-center sm:text-left pt-12">
        <div className="flex justify-center sm:justify-start mb-6">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
            <Command className="w-6 h-6 text-white dark:text-black" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Two-Factor Auth
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground">
          {recoveryMode
            ? "Enter one of your emergency recovery codes."
            : "Enter the 6-digit code from your authenticator app."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Input
              autoFocus
              type="text"
              placeholder={recoveryMode ? "XXXX-XXXX-XX" : "000000"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
              className="text-center tracking-[0.5em] font-bold text-2xl h-16 rounded-xl border-input bg-background transition-all"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-sm"
            disabled={isLoading || code.length < 6}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Verify Identity"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 pt-2 pb-12">
          <div className="text-center space-y-4 w-full">
            <button
              type="button"
              onClick={() => {
                setRecoveryMode(!recoveryMode);
                setCode("");
              }}
              className="text-sm font-bold text-foreground hover:underline block w-full"
            >
              {recoveryMode
                ? "Use authenticator app instead"
                : "Use a recovery code"}
            </button>
            <a
              href="/login"
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hover:underline block w-full"
            >
              Back to sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
