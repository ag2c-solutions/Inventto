import { useCallback } from 'react';

import { useUser } from '@/features/users';

import type { PermissionAction } from '../../domain/entities';
import { PermissionService } from '../../domain/services';

export function usePermission() {
  const { role } = useUser();

  const can = useCallback(
    (action: PermissionAction) => PermissionService.can(role, action),
    [role]
  );

  return {
    can,
    role,
    isLoading: !role
  };
}
