import type { Organization } from '@/features/organizations';
import type { Role } from '@/features/permissions';

export interface UserOrganization extends Organization {
  role: Role;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  availableOrganizations: UserOrganization[];
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UpdateAvatarVariables {
  userId: string;
  file: File;
}

export interface UpdatePasswordVariables {
  currentPassword: string;
  newPassword: string;
}
