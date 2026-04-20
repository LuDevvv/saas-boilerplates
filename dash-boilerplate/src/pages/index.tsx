import { FC, useMemo } from "react";
import {
  Users,
  Activity,
  ArrowUpRight,
  Layout,
  Bell,
  Shield,
  Clock,
} from "lucide-react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";

const Page: FC = () => {
  const metrics = useMemo(
    () => [
      {
        title: "Total Users",
        value: "25,431",
        change: 12,
        icon: Users,
        trend: "up" as const,
      },
      {
        title: "Active Sessions",
        value: "1,204",
        change: -3,
        icon: Activity,
        trend: "down" as const,
      },
      {
        title: "Conversion Rate",
        value: "4.2%",
        change: 0.5,
        icon: ArrowUpRight,
        trend: "up" as const,
      },
    ],
    []
  );

  const QUICK_ACTIONS = [
    { label: "View Team", icon: Users, description: "Manage your organizational members" },
    { label: "Notification Settings", icon: Bell, description: "Configure how you receive alerts" },
    { label: "Security Audit", icon: Shield, description: "Review latest access logs" },
    { label: "Activity History", icon: Clock, description: "Track changes across the workspace" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening in your workspace today.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Analytics Section */}
        <section className="xl:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((card, i) => (
              <AnalyticsCard key={i} {...card} delay={i * 100} />
            ))}
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">User Login Detected</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sidebar Section */}
        <aside className="flex flex-col gap-6">
          <section className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <action.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Build something great</h3>
              <p className="text-sm text-blue-100 mb-4 opacity-90">
                This boilerplate is designed to be fully customizable. Check the documentation to get started.
              </p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-semibold transition-colors">
                View Specs
              </button>
            </div>
            <Layout className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Page;
