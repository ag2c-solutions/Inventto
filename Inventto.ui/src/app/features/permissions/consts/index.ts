import type { UserRole } from '@/app/features/users/types';
import type { PermissionAction } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  sales: [
    'product:view',
    'stock:view',
    'sale:create',
    'stock:move_details',
    'product:detail'
  ],
  manager: [
    'product:view',
    'product:detail',
    'product:create',
    'product:edit',
    'stock:view',
    'stock:adjust',
    'sale:create',
    'stock:move_details'
  ],
  owner: [
    'product:view', 'product:detail', 'product:create', 'product:edit', 'product:delete',
    'category:create',
    'stock:view', 'stock:adjust', 'stock:move','stock:move_details',
    'sale:create',
    'team:manage',
    'metrics:view_costs'
  ]
};