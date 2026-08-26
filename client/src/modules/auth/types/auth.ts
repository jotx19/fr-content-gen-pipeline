export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  plan?: 'free' | 'pro';
  subscriptionStatus?: string;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

export type AuthMeResponse = {
  authRequired: boolean;
  authenticated: boolean;
  user: AuthUser | null;
};
