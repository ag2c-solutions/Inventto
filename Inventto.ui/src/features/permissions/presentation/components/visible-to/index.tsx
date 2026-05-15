import type { ReactNode } from 'react';

import type { PermissionAction } from '../../../domain/entities';
import { usePermission } from '../../hooks/use-permissions';

interface VisibleToProps {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

export function VisibleTo({
  action,
  children,
  fallback = null
}: VisibleToProps) {
  const { can, isLoading } = usePermission();

  if (isLoading) return null;
  if (!can(action)) return <>{fallback}</>;

  return <>{children}</>;
}
