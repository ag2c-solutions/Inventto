import { usePermission } from '@/app/features/permissions/hooks/use-permissions';
import type { PermissionAction } from '@/app/features/permissions/types';
import { Navigate, Outlet } from 'react-router';

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
