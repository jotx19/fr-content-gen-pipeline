'use client';

import { useMutation } from '@tanstack/react-query';
import { translateText } from '../api/translate';

export function useTranslateMutation() {
  return useMutation({
    mutationFn: translateText,
  });
}
