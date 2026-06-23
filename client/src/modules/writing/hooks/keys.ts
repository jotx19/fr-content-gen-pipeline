export const writingKeys = {
  all: ['writing'] as const,
  profile: () => [...writingKeys.all, 'profile'] as const,
  prompt: (topic?: string) => [...writingKeys.all, 'prompt', topic ?? 'default'] as const,
};
