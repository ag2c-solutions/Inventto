import type { LucideIcon } from 'lucide-react';

import type { PermissionAction } from '@/features/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionAction;
}
