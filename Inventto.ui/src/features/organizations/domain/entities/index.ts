import type { Role } from '@/features/permissions';

export type MemberStatus = 'active' | 'inactive' | 'invited';

export type ReplicationGroup = 'categories' | 'operational' | 'visual';

export interface Organization {
  id: string;
  name: string;
}

export interface IAddress {
  zip: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface OrganizationWithDetails extends Organization {
  ownerId: string;
  document?: string;
  legalName?: string;
  createdAt: Date;
  settings: OrganizationSettings;
}

export interface IMember {
  id: string;
  profileId: string;
  organizationId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  status: MemberStatus;
  joinedAt: Date;
  isMe: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  document?: string;
  sourceOrgId?: string;
  replicateGroups?: ReplicationGroup[];
}

export interface UpdateOrganizationInput {
  name: string;
  document?: string | null;
  legalName?: string | null;
  settings: OrganizationSettings;
  // Arquivo transitório: enviado ao Cloudinary pelo service no submit
  // e convertido em settings.identity.logoUrl antes de persistir.
  logoFile?: File | null;
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
  };
  sales: {
    acceptOrdersOutsideHours: boolean;
  };
  schedule: Record<DayOfWeek, IBusinessSchedule>;
  address?: IAddress;
}

export interface CreateMember {
  name: string;
  email: string;
  role: 'manager' | 'sales';
  password: string;
}
