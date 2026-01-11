import { useCallback } from 'react';
import { useUser } from '@/app/features/users/hooks/use-user';
import type { UserRole } from '../../users/types';
import type { PermissionAction } from '../types';
import { checkPermission } from '../utils';

export function usePermission() {
  const { role } = useUser();

  const can = useCallback((action: PermissionAction) => {
    return checkPermission(role, action);
  }, [role]);

  const roleIs = useCallback((role: UserRole) => {
    return role === role;
  }, [role]);

  return {
    can,
    roleIs,
    role,
    isLoading: !role
  };
}