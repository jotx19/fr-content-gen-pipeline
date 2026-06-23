'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPractice,
  fetchTefProfile,
  prefetchPractice,
  startOnboard,
  submitOnboard,
  submitPractice,
  checkAnswer,
} from '../api/tef';
import { tefKeys } from './keys';

export function useTefProfileQuery(enabled = true) {
  return useQuery({
    queryKey: tefKeys.profile(),
    queryFn: fetchTefProfile,
    enabled,
    retry: false,
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
  return useMutation({ mutationFn: prefetchPractice });
}

export function useCheckAnswerMutation() {
  return useMutation({ mutationFn: checkAnswer });
}
