import { FC } from "react";
import { 
  TrendingUp, 
  Globe, 
  Clock, 
  MousePointer2 
} from "lucide-react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";

const AnalyticsPage: FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Deep Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Advanced insights and real-time data tracking for your organization.
        </p>
      </header>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard 
          title="Avg. Visit Duration" 
          value="4m 32s" 
          icon={Clock} 
          trend="up"
          change={12}
        />
        <AnalyticsCard 
          title="Bounce Rate" 
          value="24.5%" 
          icon={TrendingUp} 
          trend="down"
          change={2.1}
          isPositive={true}
        />
        <AnalyticsCard 
          title="Global Reach" 
          value="142 Countries" 
          icon={Globe} 
          trend="neutral"
        />
        <AnalyticsCard 
          title="Click-thru Rate" 
          value="8.2%" 
          icon={MousePointer2} 
          trend="up"
          change={0.8}
        />
      </div>

      {/* Main Charts Area (Simulated) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Traffic Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div 
                  className="w-full bg-blue-500/20 dark:bg-blue-500/10 rounded-t-lg transition-all hover:bg-blue-500 group relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {h * 120} visits
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Pages</h2>
          <div className="space-y-4">
            {[
              { path: "/overview", views: "12,430", growth: "+12%" },
              { path: "/workspaces", views: "8,120", growth: "+8%" },
              { path: "/reports", views: "5,400", growth: "-3%" },
              { path: "/settings", views: "2,100", growth: "+5%" }
            ].map((page, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{page.path}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{page.views}</span>
                  <span className={`text-xs font-bold ${page.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {page.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
