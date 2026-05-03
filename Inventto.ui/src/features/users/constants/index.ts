export const USERS_KEYS = {
  all: ['users'] as const,
  profile: (userId: string | undefined) =>
    [...USERS_KEYS.all, 'profile', userId] as const
};
