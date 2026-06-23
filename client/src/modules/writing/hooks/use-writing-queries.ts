'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchWritingExample,
  fetchWritingProfile,
  fetchWritingPrompt,
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
    mutationFn: (topic?: string) => fetchWritingPrompt({ topic, refresh: true }),
    onSuccess: (_data, topic) => {
      queryClient.invalidateQueries({ queryKey: writingKeys.prompt(topic) });
      queryClient.invalidateQueries({ queryKey: writingKeys.profile() });
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
