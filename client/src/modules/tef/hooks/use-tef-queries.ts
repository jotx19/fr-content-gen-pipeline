'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPractice,
  fetchTefProfile,
  prefetchPractice,
  startOnboard,
  submitOnboard,
  selfSelectLevel,
  submitPractice,
  checkAnswer,
} from '../api/tef';
import { tefKeys } from './keys';

export function useTefProfileQuery(
  enabled = true,
  options?: { pollWhilePreparing?: boolean }
) {
  return useQuery({
    queryKey: tefKeys.profile(),
    queryFn: fetchTefProfile,
    enabled,
    retry: false,
    refetchInterval: (query) => {
      if (!options?.pollWhilePreparing) return false;
      const profile = query.state.data;
      return profile?.level && !profile.practiceReady ? 4000 : false;
    },
  });
}

export function usePracticeQuery(enabled = false) {
  return useQuery({
    queryKey: tefKeys.practice(),
    queryFn: fetchPractice,
    enabled,
    staleTime: 0,
  });
}

export function useStartOnboardMutation() {
  return useMutation({ mutationFn: startOnboard });
}

export function useSelfSelectLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: selfSelectLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tefKeys.profile() });
      prefetchPractice();
    },
  });
}

export function useSubmitOnboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitOnboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tefKeys.profile() });
      prefetchPractice();
    },
  });
}

export function useSubmitPracticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tefKeys.profile() });
      queryClient.removeQueries({ queryKey: tefKeys.practice() });
      prefetchPractice();
    },
  });
}

export function usePrefetchPractice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: prefetchPractice,
    onSuccess: (result) => {
      if (result.status === 'already_ready') {
        queryClient.invalidateQueries({ queryKey: tefKeys.profile() });
      }
    },
  });
}

export function useCheckAnswerMutation() {
  return useMutation({ mutationFn: checkAnswer });
}
