import { FC } from "react";
import { 
  Users, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  UserPlus
} from "lucide-react";
import { cn } from "@/utils/classNames";

const AdminOverview: FC = () => {
  // Mock data - will be replaced with real API data
  const stats = [
    {
      label: "Total Users",
      value: "14,292",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "New Registrations",
      value: "1,204",
      change: "+18.2%",
      trend: "up",
      icon: UserPlus,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: "Active Subscriptions",
      value: "842",
      change: "-2.4%",
      trend: "down",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "System Load",
      value: "24%",
      change: "Stable",
      trend: "neutral",
      icon: Activity,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
          Admin Overview
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Monitor your platform and manage system resources.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div className={cn("rounded-2xl p-3", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-bold",
                stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-gray-500"
              )}>
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : stat.trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <h3 className="text-3xl font-black text-gray-950 dark:text-white">
                {stat.value}
              </h3>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110">
              <stat.icon className="h-32 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-950 dark:text-white">Recent Users</h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="pb-4 text-sm font-bold text-gray-400">User</th>
                  <th className="pb-4 text-sm font-bold text-gray-400">Status</th>
                  <th className="pb-4 text-sm font-bold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                          {String.fromCharCode(64 + i)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-950 dark:text-white">User {i}</div>
                          <div className="text-xs text-gray-500">user{i}@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        Active
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-950 hover:bg-gray-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors">
                        Impersonate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900">
          <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-500">CPU Usage</span>
                <span className="font-black text-gray-950 dark:text-white">32%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[32%] rounded-full bg-blue-600"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-500">Memory Usage</span>
                <span className="font-black text-gray-950 dark:text-white">64%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[64%] rounded-full bg-indigo-600"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-500">Disk Space</span>
                <span className="font-black text-gray-950 dark:text-white">12%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[12%] rounded-full bg-amber-600"></div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <div className="text-xs font-bold text-gray-400 mb-1">Database</div>
                  <div className="text-sm font-black text-emerald-600">Healthy</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <div className="text-xs font-bold text-gray-400 mb-1">CDN</div>
                  <div className="text-sm font-black text-emerald-600">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
