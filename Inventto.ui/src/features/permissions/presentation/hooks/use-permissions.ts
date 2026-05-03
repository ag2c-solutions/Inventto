import { useCallback } from 'react';

import { useUser } from '@/features/users/hooks/use-user';

import { PermissionService } from '../../domain/services/permission-service';
import type { PermissionAction } from '../../domain/entities/permission-action';

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
