export const tefKeys = {
  all: ['tef'] as const,
  profile: () => [...tefKeys.all, 'profile'] as const,
  evaluations: (limit: number) => [...tefKeys.all, 'evaluations', limit] as const,
  practice: () => [...tefKeys.all, 'practice'] as const,
};
