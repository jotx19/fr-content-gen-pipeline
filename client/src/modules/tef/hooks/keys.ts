export const tefKeys = {
  all: ['tef'] as const,
  profile: () => [...tefKeys.all, 'profile'] as const,
  practice: () => [...tefKeys.all, 'practice'] as const,
};
