import type { PermissionAction, Role } from '../entities';

// MOV-08 (espec § recorte do Sales): Sales não registra movimentação manual —
// reduz estoque apenas por venda (balcão/pedido). Sem movement:create/entry/withdrawal.
const SALES_PERMISSIONS: PermissionAction[] = [
  'product:view',
  'product:detail',
  'movement:view',
  'customer:view',
  'order:view_own',
  'order:create',
  'catalog:view'
];

const MANAGER_PERMISSIONS: PermissionAction[] = [
  ...SALES_PERMISSIONS,
  'product:create',
  'product:edit',
  'product:delete',
  'stock:view_costs',
  'movement:details',
  'movement:create',
  'movement:entry',
  'movement:withdrawal',
  'movement:view_costs',
  'movement:cancel_sale',
  'order:view_all',
  'order:manage',
  'catalog:manage',
  'category:create',
  'storefront:manage'
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

export const ROLE_PERMISSIONS: Record<Role, PermissionAction[]> = {
  sales: SALES_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  owner: OWNER_PERMISSIONS
};
