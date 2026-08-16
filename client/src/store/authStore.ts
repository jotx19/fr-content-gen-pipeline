import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/modules/auth/types/auth';

type AuthState = {
  user: AuthUser | null;
  authRequired: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (user: AuthUser, authRequired: boolean) => void;
  clearSession: (authRequired?: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authRequired: true,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: (user, authRequired) =>
        set({ user, authRequired, isAuthenticated: true }),
      clearSession: (authRequired = true) =>
        set({ user: null, authRequired, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'fringo-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: Boolean(state.user),
        authRequired: state.authRequired,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.user) {
          state.isAuthenticated = true;
        }
        state.setHasHydrated(true);
      },
    }
  )
);
