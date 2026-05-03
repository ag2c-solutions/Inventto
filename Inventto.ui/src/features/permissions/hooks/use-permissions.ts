import { useCallback } from 'react';

import { useUser } from '@/features/users/hooks/use-user';

import type { PermissionAction } from '../types';
import { checkPermission } from '../utils';

export function usePermission() {
  const { role } = useUser();

  const can = useCallback(
    (action: PermissionAction) => {
      return checkPermission(role, action);
    },
    [role]
  );

  return {
    can,
    role,
    isLoading: !role
  };
}
