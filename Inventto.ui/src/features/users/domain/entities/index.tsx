export type UserRole = 'owner' | 'manager' | 'sales';

export interface UserOrganizationContext {
  id: string;
  name: string;
  slug: string;
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  availableOrganizations: UserOrganizationContext[];
}
