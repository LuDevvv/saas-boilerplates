import { FC, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  UserX, 
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { cn } from "@/utils/classNames";

const ManageUsers: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "Alex Rivera", email: "alex@example.com", role: "Admin", status: "Active", joined: "2 mins ago" },
    { id: 2, name: "Sarah Chen", email: "sarah.c@company.io", role: "User", status: "Active", joined: "1 hour ago" },
    { id: 3, name: "Marcus Miller", email: "marcus@design.com", role: "User", status: "Pending", joined: "3 hours ago" },
    { id: 4, name: "Elena Rodriguez", email: "elena@tech.es", role: "Manager", status: "Active", joined: "Yesterday" },
    { id: 5, name: "Jordan Smith", email: "j.smith@web.com", role: "User", status: "Suspended", joined: "2 days ago" },
    { id: 6, name: "Taylor Wong", email: "taylor@cloud.com", role: "User", status: "Active", joined: "3 days ago" },
    { id: 7, name: "Chris Evans", email: "chris@marvel.com", role: "Manager", status: "Active", joined: "1 week ago" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
            Manage Users
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            View, filter, and manage permissions for all platform users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-bold text-gray-950 hover:bg-gray-50 dark:border-white/5 dark:bg-gray-900 dark:text-white dark:hover:bg-white/10 transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-md active:scale-95">
            Add New User
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name, email, or ID..."
              className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">User Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-950 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 lowercase">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className={cn(
                        "h-3.5 w-3.5",
                        user.role === "Admin" ? "text-amber-500" : "text-gray-400"
                      )} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-black",
                      user.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                      user.status === "Pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                      "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                        <UserX className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="text-gray-950 dark:text-white font-bold">1 to 7</span> of 1,248 users
          </p>
          <div className="flex items-center gap-2">
             <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 dark:border-white/5 disabled:opacity-50 transition-colors" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => (
                <button 
                  key={n}
                  className={cn(
                    "h-8 w-8 rounded-xl text-sm font-bold transition-all",
                    n === 1 ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                >
                  {n}
                </button>
              ))}
              <span className="px-2 text-gray-400">...</span>
              <button className="h-8 w-8 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
                48
              </button>
            </div>
            <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 dark:border-white/5 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
