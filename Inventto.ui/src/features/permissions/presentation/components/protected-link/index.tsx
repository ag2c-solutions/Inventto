import { NavLink, type NavLinkProps } from 'react-router';

import type { PermissionAction } from '../../../domain/entities';
import { usePermission } from '../../hooks/use-permissions';

type ProtectedLinkProps = NavLinkProps & {
  required?: PermissionAction;
};

export function ProtectedLink({
  required,
  children,
  ...props
}: ProtectedLinkProps) {
  const { can, isLoading } = usePermission();

  if (isLoading) return null;

  if (required && !can(required)) {
    return null;
  }

  return <NavLink {...props}>{children}</NavLink>;
}
