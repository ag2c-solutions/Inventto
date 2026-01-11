import type { UserRole } from "../../users/types";
import type { PermissionAction } from "../types";
import { ROLE_PERMISSIONS } from "../consts";

export function checkPermission(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  
  //if (role === 'owner') return true;

  const allowedActions = ROLE_PERMISSIONS[role] ?? [];
  return allowedActions.includes(action);
}