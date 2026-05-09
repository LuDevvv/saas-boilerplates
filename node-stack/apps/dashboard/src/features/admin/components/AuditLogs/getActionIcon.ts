import { Download, Activity, User, FileText , LucideIcon } from "lucide-react";


export const getActionIcon = (action: string): LucideIcon => {
  if (action.includes("export") || action.includes("download")) return Download;
  if (action.includes("delete")) return Activity;
  if (action.includes("role") || action.includes("user")) return User;
  return FileText;
};

export const getActionColor = (action: string): string => {
  if (action.includes("export") || action.includes("download"))
    return "text-blue-500 dark:text-blue-400";
  if (action.includes("delete")) return "text-red-500 dark:text-red-400";
  if (action.includes("role") || action.includes("user"))
    return "text-primary";
  return "text-fg-muted";
};
