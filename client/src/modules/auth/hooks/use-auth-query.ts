'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthMe, loginWithGoogleCredential, logoutRequest } from '../api/auth';
import { authKeys } from './keys';
import { useAuthStore } from '@/store/authStore';

export function useAuthBootstrapQuery() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchAuthMe,
    retry: false,
    staleTime: 60_000,
    enabled: hasHydrated,
  });

  useEffect(() => {
    if (!hasHydrated || !query.isFetched || !query.data) return;
    if (query.data.authenticated && query.data.user) {
      setSession(query.data.user, query.data.authRequired);
    } else if (query.data.authRequired) {
      clearSession(query.data.authRequired);
    }
  }, [hasHydrated, query.isFetched, query.data, setSession, clearSession]);

  return query;
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: loginWithGoogleCredential,
    onSuccess: (user) => {
      setSession(user, true);
      queryClient.setQueryData(authKeys.me(), {
        authRequired: true,
        authenticated: true,
        user,
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession(true);
      queryClient.setQueryData(authKeys.me(), {
        authRequired: true,
        authenticated: false,
        user: null,
      });
    },
  });
}
