export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  workspaceId: string;
  subscriptions?: Subscription[];
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "member" | "viewer";

export interface UserProfile extends User {
  phone?: string;
  timezone?: string;
  language?: string;
}

export interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  planId: string;
  planName: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}