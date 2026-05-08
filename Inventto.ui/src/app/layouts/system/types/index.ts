import type { ReactElement } from 'react';

import type { PermissionAction } from '@/features/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: ReactElement;
  permission?: PermissionAction;
}
