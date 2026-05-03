import type { UserRole } from '@/features/users';

import type { MemberStatus } from '../../domain/entities';

export type { MemberStatus } from '../../domain/entities';

export interface CandidateMemberDTO {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface OrganizationDTO {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  document: string | null;
  settings: OrganizationSettingsDTO;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberDTO {
  id: string;
  organization_id: string;
  profile_id: string;
  role: UserRole;
  status: MemberStatus;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

export type CreateMemberDTO = {
  name: string;
  email: string;
  role: 'manager' | 'sales';
  password: string;
};

export interface CreateOrganizationDTO {
  p_name: string;
  p_slug: string;
  p_document?: string;
}

export type DayOfWeekDTO =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface BusinessScheduleDTO {
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
}

export interface OrganizationSettingsDTO {
  identity?: {
    display_name?: string;
    logo_url?: string;
  };
  operational?: {
    timezone?: string;
    whatsapp_main?: string;
    whatsapp_support?: string | null;
  };
  sales?: {
    accept_orders_outside_hours?: boolean;
  };
  schedule?: Record<DayOfWeekDTO, BusinessScheduleDTO>;
}
