import { useQuery } from '@tanstack/react-query';

import { UserAPI } from '../../data/api';
import type { User } from '../../domain/entities';
import { USERS_KEYS } from '../constants';

export function useUserProfileQuery(userId: string | undefined) {
  return useQuery<User | null, Error>({
    queryKey: USERS_KEYS.profile(userId),
    queryFn: async () => {
      if (!userId) return null;
      return UserAPI.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 60 minutos
    retry: false
  });
}
