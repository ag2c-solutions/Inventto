export type AppRoleDTO = 'owner' | 'manager' | 'sales';

export interface ProfileDTO {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationMemberDTO {
  role: AppRoleDTO;
  organization_id: string;
  organizations: OrganizationDTO | null;
}

export interface UserWithOrganizationDTO extends ProfileDTO {
  organization_members: OrganizationMemberDTO[];
}
