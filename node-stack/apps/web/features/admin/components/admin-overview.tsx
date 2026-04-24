"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "./stats-cards";
import { RecentUsersTable } from "./recent-users-table";
import { SystemHealth } from "./system-health";
import { fetcher } from "@/lib/fetcher";

export function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetcher<{ 
      totalUsers: number; 
      activeSessions: number; 
      dbPoolStats: { total: number; idle: number; waiting: number };
      recentUsers: any[];
    }>("/api/admin/system/stats"),
  });

  if (isLoading) return <div>Loading statistics...</div>;

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <RecentUsersTable users={stats?.recentUsers || []} className="col-span-4" />
        <SystemHealth poolStats={stats?.dbPoolStats} className="col-span-3" />
      </div>
    </div>
  );
}
