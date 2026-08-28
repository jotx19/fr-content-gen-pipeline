'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translateText } from '../api/translate';

export function useTranslateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: translateText,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}
