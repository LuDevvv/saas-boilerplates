import React from "react";
import { Card, CardContent, Button } from "@workspace/ui";
import { Ghost, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/50 bg-background/50 backdrop-blur-sm rounded-[2.5rem] shadow-sm hover:border-primary/30 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-3xl bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-inner">
          {icon || <Ghost className="w-10 h-10" />}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border-4 border-secondary/50 flex items-center justify-center text-muted-foreground/50">
          <Ghost className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-4 max-w-sm mb-10">
        <h3 className="text-3xl font-bold text-foreground tracking-tight underline decoration-primary/10 underline-offset-4">
          {title}
        </h3>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-foreground hover:bg-foreground/90 text-background rounded-2xl px-12 h-14 font-bold shadow-xl shadow-foreground/5 group/btn transition-all active:scale-95"
        >
          {actionLabel}
          <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Button>
      )}

      <div className="mt-8 flex items-center gap-2 opacity-50">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          Zero Data Found
        </span>
      </div>
    </Card>
  );
}
