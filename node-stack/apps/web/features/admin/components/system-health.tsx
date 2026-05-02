import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SystemHealth({ poolStats, className }: { poolStats: any; className?: string }) {
  const total = poolStats?.total || 1;
  const idle = poolStats?.idle || 0;
  const waiting = poolStats?.waiting || 0;
  const active = total - idle;
  const usagePercent = Math.round((active / total) * 100);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Database and infrastructure metrics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>DB Pool Usage</span>
            <span className="font-kpi">{usagePercent}%</span>          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Idle: {idle}</span>
            <span>Active: {active}</span>
            <span>Waiting: {waiting}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">API Latency</div>
            <div className="text-lg font-kpi">42ms</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">Uptime</div>
            <div className="text-lg font-kpi">99.9%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
