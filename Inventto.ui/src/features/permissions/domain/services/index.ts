import { ROLE_PERMISSIONS } from '../constants/permissions';
import type { PermissionAction, Role } from '../entities';

export class PermissionService {
  static can(role: Role | undefined, action: PermissionAction): boolean {
    if (!role) {
      return false;
    }

    return (ROLE_PERMISSIONS[role] ?? []).includes(action);
  }
}
