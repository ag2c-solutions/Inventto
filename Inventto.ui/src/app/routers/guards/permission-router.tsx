import { Navigate, Outlet } from 'react-router';

import { type PermissionAction, usePermission } from '@/features/permissions';

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
