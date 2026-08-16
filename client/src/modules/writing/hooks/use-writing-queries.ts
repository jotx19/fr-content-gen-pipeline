'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchWritingExample,
  fetchWritingProfile,
  fetchWritingPrompt,
  selfSelectWritingLevel,
  submitWriting,
} from '../api/writing';
import { writingKeys } from './keys';

export function useWritingProfileQuery(enabled = true) {
  return useQuery({
    queryKey: writingKeys.profile(),
    queryFn: fetchWritingProfile,
    enabled,
    retry: false,
  });
}

export function useWritingPromptQuery(topic?: string, enabled = true) {
  return useQuery({
    queryKey: writingKeys.prompt(topic),
    queryFn: () => fetchWritingPrompt({ topic }),
    enabled,
    staleTime: 0,
  });
}

export function useRefreshWritingPromptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params?: { topic?: string; section?: 'A' | 'B' }) =>
      fetchWritingPrompt({ ...params, refresh: true }),
    onSuccess: (data, params) => {
      queryClient.setQueryData(writingKeys.prompt(params?.topic), data);
      queryClient.invalidateQueries({ queryKey: writingKeys.profile() });
    },
  });
}

export function useSelfSelectWritingLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: selfSelectWritingLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: writingKeys.profile() });
      queryClient.removeQueries({ queryKey: [...writingKeys.all, 'prompt'] });
    },
  });
}

export function useSubmitWritingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitWriting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: writingKeys.profile() });
      queryClient.removeQueries({ queryKey: writingKeys.all });
    },
  });
}

export function useWritingExampleMutation() {
  return useMutation({ mutationFn: fetchWritingExample });
}
