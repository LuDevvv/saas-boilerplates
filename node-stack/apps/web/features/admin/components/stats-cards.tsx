import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Database } from "lucide-react";

export function StatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-label">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-kpi">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">+20% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-label">Active Sessions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-kpi">{stats?.activeSessions || 0}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-label">DB Pool Total</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-kpi">{stats?.dbPoolStats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">Database connections</p>
        </CardContent>
      </Card>
    </div>
  );
}
