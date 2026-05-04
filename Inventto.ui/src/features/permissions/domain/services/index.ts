import type { UserRole } from '@/features/users';

import { ROLE_PERMISSIONS } from '../constants';
import type { PermissionAction } from '../entities';

export class PermissionService {
  static can(role: UserRole | undefined, action: PermissionAction): boolean {
    if (!role) {
      return false;
    }

    return (ROLE_PERMISSIONS[role] ?? []).includes(action);
  }
}
