import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/modules/auth/types/auth';

type AuthState = {
  user: AuthUser | null;
  authRequired: boolean;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, authRequired: boolean) => void;
  clearSession: (authRequired?: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authRequired: true,
      isAuthenticated: false,
      setSession: (user, authRequired) =>
        set({ user, authRequired, isAuthenticated: true }),
      clearSession: (authRequired = true) =>
        set({ user: null, authRequired, isAuthenticated: false }),
    }),
    {
      name: 'tef-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
