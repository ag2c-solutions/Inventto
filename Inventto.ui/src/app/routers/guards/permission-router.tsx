import { Navigate, Outlet } from 'react-router';

import { usePermission } from '@/features/permissions/hooks/use-permissions';
import type { PermissionAction } from '@/features/permissions/types';

interface PermissionRouteProps {
  required: PermissionAction;
}

export function PermissionRoute({ required }: PermissionRouteProps) {
  const { can, isLoading } = usePermission();

  if (isLoading) return null;

  if (!can(required)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
