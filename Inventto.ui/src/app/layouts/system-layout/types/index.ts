import type { LucideIcon } from 'lucide-react';

import type { PermissionAction } from '@/features/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionAction;
  /** Desativado enquanto a rota do módulo não existir no router. */
  enabled?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}
