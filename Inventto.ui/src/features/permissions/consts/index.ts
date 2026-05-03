import type { UserRole } from '@/features/users/types';

import type { PermissionAction } from '../types';

const SALES_PERMISSIONS: PermissionAction[] = [
  'product:view',
  'product:detail',

  'movement:view',
  'movement:create',
  'movement:entry',

  'customer:view',

  'order:view_own',

  'catalog:view'
];

const MANAGER_PERMISSIONS: PermissionAction[] = [
  ...SALES_PERMISSIONS,

  'customer:view',

  'catalog:view',

  'product:create',
  'product:edit',
  'product:delete',

  'movement:adjust',
  'movement:details',
  'movement:withdrawal',

  'order:view_all',
  'order:manage',

  'catalog:manage',

  'metrics:view_costs'
];

const OWNER_PERMISSIONS: PermissionAction[] = [
  ...MANAGER_PERMISSIONS,

  'customer:manage',

  'team:manage',

  'org:create',
  'org:update',
  'org:manage',

  'financial:view'
];

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  sales: SALES_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  owner: OWNER_PERMISSIONS
};
