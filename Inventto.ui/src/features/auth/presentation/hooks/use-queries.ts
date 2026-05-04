import { useQuery } from '@tanstack/react-query';

import { AuthService } from '../../domain/services';

export function useSessionQuery() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: AuthService.getSession,
    staleTime: 1000 * 60 * 15,
    retry: false
  });
}

export function useIsAuthenticatedQuery() {
  return useQuery({
    queryKey: ['auth', 'is-authenticated'],
    queryFn: AuthService.isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
