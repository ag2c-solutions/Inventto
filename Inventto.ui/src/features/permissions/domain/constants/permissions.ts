import type { PermissionAction, Role } from '../entities';

const SALES_PERMISSIONS: PermissionAction[] = [
  'product:view',
  'product:detail',
  'movement:view',
  'movement:create',
  'movement:entry',
  'movement:withdrawal',
  'customer:view',
  'order:view_own',
  'catalog:view'
];

const MANAGER_PERMISSIONS: PermissionAction[] = [
  ...SALES_PERMISSIONS,
  'product:create',
  'product:edit',
  'product:delete',
  'movement:adjust',
  'movement:details',
  'movement:withdrawal',
  'order:view_all',
  'order:manage',
  'catalog:manage',
  'category:create'
];

const OWNER_PERMISSIONS: PermissionAction[] = [
  ...MANAGER_PERMISSIONS,
  'customer:manage',
  'team:manage',
  'org:create',
  'org:update',
  'org:manage',
  'financial:view',
  'movement:view_costs'
];

export const ROLE_PERMISSIONS: Record<Role, PermissionAction[]> = {
  sales: SALES_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  owner: OWNER_PERMISSIONS
};
