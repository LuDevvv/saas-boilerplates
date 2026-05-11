export const queryKeys = {
  all: ["general"] as const,

  workspaces: {
    all: ["workspaces"] as const,
    list: () => [...queryKeys.workspaces.all, "list"] as const,
    detail: (workspaceId: string) => [...queryKeys.workspaces.all, "detail", workspaceId] as const,
    usage: (workspaceId: string) => [...queryKeys.workspaces.all, "usage", workspaceId] as const,
    members: (workspaceId: string) => [...queryKeys.workspaces.all, "members", workspaceId] as const,
    settings: (workspaceId: string) => [...queryKeys.workspaces.all, "settings", workspaceId] as const,
  },

  tasks: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "tasks"] as const,
    list: (workspaceId: string) => [...queryKeys.tasks.all(workspaceId), "list"] as const,
    detail: (workspaceId: string, taskId: string) =>
      [...queryKeys.tasks.all(workspaceId), "detail", taskId] as const,
    byStatus: (workspaceId: string, status: string) =>
      [...queryKeys.tasks.all(workspaceId), "status", status] as const,
  },

  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    avatar: () => [...queryKeys.user.all, "avatar"] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unreadCount"] as const,
  },

  analytics: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "analytics"] as const,
    dashboard: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "dashboard"] as const,
    reports: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "reports"] as const,
    overview: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "overview"] as const,
    traffic: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "traffic"] as const,
    pages: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "pages"] as const,
    usage: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "usage"] as const,
  },

  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: () => [...queryKeys.admin.all, "users"] as const,
    featureFlags: () => [...queryKeys.admin.all, "featureFlags"] as const,
    auditLogs: () => [...queryKeys.admin.all, "auditLogs"] as const,
    globalStats: () => [...queryKeys.admin.all, "globalStats"] as const,
  },

  billing: {
    all: ["billing"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
    invoices: () => [...queryKeys.billing.all, "invoices"] as const,
    paymentMethods: () => [...queryKeys.billing.all, "paymentMethods"] as const,
    usage: () => [...queryKeys.billing.all, "usage"] as const,
    plans: () => [...queryKeys.billing.all, "plans"] as const,
  },

  settings: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "settings"] as const,
    general: (workspaceId: string) => [...queryKeys.settings.all(workspaceId), "general"] as const,
    security: (workspaceId: string) => [...queryKeys.settings.all(workspaceId), "security"] as const,
    members: (workspaceId: string) => [...queryKeys.settings.all(workspaceId), "members"] as const,
    api: (workspaceId: string) => [...queryKeys.settings.all(workspaceId), "api"] as const,
    webhooks: (workspaceId: string) => [...queryKeys.settings.all(workspaceId), "webhooks"] as const,
  },

  uploads: {
    all: ["uploads"] as const,
    presignedUrl: (uploadId: string) => [...queryKeys.uploads.all, "presigned", uploadId] as const,
  },

  tickets: {
    all: ["tickets"] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters?: any) => [...queryKeys.tickets.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.tickets.all, "detail", id] as const,
  },
};

export type QueryKeys = typeof queryKeys;
