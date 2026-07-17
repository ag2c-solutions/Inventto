import { Navigate, Outlet } from 'react-router';

import type { PermissionAction } from '../../../domain/entities';
import { usePermission } from '../../hooks/use-permissions';

interface CanNavigateProps {
  required: PermissionAction;
  fallbackPath?: string;
}

export function CanNavigate({
  required,
  fallbackPath = '/'
}: CanNavigateProps) {
  const { can, isLoading } = usePermission();

  if (isLoading) return null;

  if (!can(required)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
