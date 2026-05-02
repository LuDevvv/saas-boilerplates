import { Download, Activity, User, FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const getActionIcon = (action: string): LucideIcon => {
  if (action.includes("export") || action.includes("download")) return Download;
  if (action.includes("delete")) return Activity;
  if (action.includes("role") || action.includes("user")) return User;
  return FileText;
};

export const getActionColor = (action: string): string => {
  if (action.includes("export") || action.includes("download")) return "text-indigo-400";
  if (action.includes("delete")) return "text-red-400";
  if (action.includes("role") || action.includes("user")) return "text-blue-400";
  return "text-slate-400";
};