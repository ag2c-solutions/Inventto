import type { PermissionAction } from "@/app/features/permissions/types";
import type { ReactElement } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactElement  
  permission?: PermissionAction; 
}