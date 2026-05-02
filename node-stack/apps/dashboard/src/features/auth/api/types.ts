export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: string;
    avatarUrl?: string;
    subscriptions?: Array<{
      id: string;
      planId: string;
      status: string;
      currentPeriodEnd: string;
    }>;
  };
}