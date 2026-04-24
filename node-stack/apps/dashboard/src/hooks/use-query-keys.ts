export const queryKeys = {
  all: ["general"] as const,

  workspaces: {
    all: ["workspaces"] as const,
    list: () => [...queryKeys.workspaces.all, "list"] as const,
    detail: (workspaceId: string) => [...queryKeys.workspaces.all, "detail", workspaceId] as const,
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

  analytics: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "analytics"] as const,
    dashboard: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "dashboard"] as const,
    reports: (workspaceId: string) => [...queryKeys.analytics.all(workspaceId), "reports"] as const,
  },

  billing: {
    all: ["billing"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
    invoices: () => [...queryKeys.billing.all, "invoices"] as const,
    usage: () => [...queryKeys.billing.all, "usage"] as const,
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
};

export type QueryKeys = typeof queryKeys;