import type { UserRole } from '@/features/users';

export type MemberStatus = 'active' | 'inactive' | 'invited';

export interface IOrganization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  document?: string;
  settings: OrganizationSettings;
  createdAt: Date;
}

export interface IMember {
  id: string;
  profileId: string;
  organizationId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: MemberStatus;
  joinedAt: Date;
  isMe: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  document?: string;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface IBusinessSchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface OrganizationSettings {
  identity: {
    displayName: string;
    logoUrl?: string;
  };
  operational: {
    timezone: string;
    whatsappMain: string;
    whatsappSupport?: string;
  };
  sales: {
    acceptOrdersOutsideHours: boolean;
  };
  schedule: Record<DayOfWeek, IBusinessSchedule>;
}

export interface CreateMember {
  name: string;
  email: string;
  role: 'manager' | 'sales';
  password: string;
}
