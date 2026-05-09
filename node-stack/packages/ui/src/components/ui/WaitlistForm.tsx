"use client";

import * as React from "react";

import { Button } from "./Button.js";
import { cn } from "../../utils.js";

export interface WaitlistFormProps {
  apiEndpoint?: string;
  onSuccess?: () => void;
  className?: string;
}

export function WaitlistForm({
  apiEndpoint = "/api/v1/marketing/waitlist",
  onSuccess,
  className,
}: WaitlistFormProps): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist. Please try again.");
      }

      setStatus("success");
      setMessage("You've been added to the waitlist!");
      setEmail("");
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className={cn("w-full max-w-md", className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="h-12 flex-1 rounded-md border border-gray-300 px-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
        <Button 
          type="submit" 
          size="lg" 
          loading={status === "loading"} 
          disabled={status === "success"}
        >
          {status === "success" ? "Joined" : "Join Waitlist"}
        </Button>
      </form>
      {message && (
        <p className={cn(
          "mt-2 text-sm",
          status === "success" ? "text-green-600" : "text-red-600"
        )}>
          {message}
        </p>
      )}
    </div>
  );
}
