import type { UserRole } from '@/features/users';

import { supabase, tempClient } from '@/infra/supabase';

import type {
  IMember,
  IOrganization,
  OrganizationSettings
} from '../../domain/entities';
import type {
  CandidateMemberDTO,
  CreateMemberDTO,
  MemberStatus,
  OrganizationDTO,
  OrganizationMemberDTO
} from '../dtos';
import { handleOrganizationError } from '../handlers/error-handler';
import { OrganizationMapper } from '../mapper';

export class OrganizationApi {
  static async getById(orgId: string): Promise<IOrganization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, owner_id, name, slug, document, settings, created_at')
        .eq('id', orgId)
        .single()
        .overrideTypes<OrganizationDTO, { merge: false }>();

      if (error) throw error;
      return OrganizationMapper.toDomain(data);
    } catch (error) {
      handleOrganizationError(error, 'getById');
    }
  }

  static async create(payload: {
    name: string;
    slug: string;
    document?: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_new_organization', {
        p_name: payload.name,
        p_slug: payload.slug,
        p_document: payload.document || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleOrganizationError(error, 'create');
    }
  }

  static async update(
    orgId: string,
    params: { name?: string; settings?: OrganizationSettings }
  ): Promise<void> {
    try {
      const settingsDTO = params.settings
        ? OrganizationMapper.toSettingsDTO(params.settings)
        : undefined;

      const { error } = await supabase
        .from('organizations')
        .update({
          name: params.name,
          settings: settingsDTO,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)
        .select('id');

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'update');
    }
  }

  static async getMembers(orgId: string): Promise<IMember[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session.session?.user.id || '';

      const { data, error } = await supabase
        .from('organization_members')
        .select(`*, profiles:profile_id (id, full_name, email, avatar_url)`)
        .eq('organization_id', orgId)
        .overrideTypes<OrganizationMemberDTO[], { merge: false }>();

      if (error) throw error;

      return data.map((dto) =>
        OrganizationMapper.toMemberDomain(dto, currentUserId)
      );
    } catch (error) {
      handleOrganizationError(error, 'getMembers');
    }
  }

  static async getCandidatesMembers(orgId: string): Promise<IMember[]> {
    try {
      const { data, error } = await supabase.rpc('get_candidate_members', {
        p_organization_id: orgId
      });

      if (error) throw error;

      return (data as CandidateMemberDTO[]).map(
        OrganizationMapper.toCandidateMemberDomain
      );
    } catch (error) {
      handleOrganizationError(error, 'getCandidatesMembers');
    }
  }

  static async createMember(
    orgId: string,
    data: CreateMemberDTO
  ): Promise<void> {
    try {
      const { error } = await tempClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            organization_id: orgId,
            role: data.role,
            must_change_password: true
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'createMember');
    }
  }

  static async replicateMember(
    orgId: string,
    userId: string,
    role: 'manager' | 'sales'
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('replicate_member', {
        p_organization_id: orgId,
        p_user_id: userId,
        p_role: role
      });

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'replicateMember');
    }
  }

  static async updateMemberRole(
    memberId: string,
    newRole: UserRole
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .select('id');

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'updateMemberRole');
    }
  }

  static async updateMemberStatus(
    memberId: string,
    newStatus: MemberStatus
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ status: newStatus })
        .eq('id', memberId)
        .select('id');

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'updateMemberStatus');
    }
  }

  static async forceDeleteMember(memberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'forceDeleteMember');
    }
  }
}
