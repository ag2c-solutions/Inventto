import { supabase, tempClient } from '@/app/config/supabase';
import { OrganizationMapper } from './mappers';
import { handleOrganizationError } from './error-handler';
import type { IMember, CreateMemberDTO, IOrganization, MemberStatus, OrganizationDTO, OrganizationMemberDTO, OrganizationSettings, CreateOrganizationInput } from '../types';
import type { UserRole } from '../../users/types';

export const OrganizationService = {
  getById: async (orgId: string): Promise<IOrganization> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select("id, owner_id, name, slug, document, settings, created_at")
        .eq('id', orgId)
        .single()
        .overrideTypes<OrganizationDTO, { merge: false }>();

      if (error) throw error;

      return OrganizationMapper.toDomain(data);
    } catch (error) {
      handleOrganizationError(error, 'getById');
    }
  },

  create: async (payload: CreateOrganizationInput): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('create_new_organization', {
        p_name: payload.name,
        p_slug: payload.slug,
        p_document: payload.document || null,
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      handleOrganizationError(error, 'createOrganization');
      throw error;
    }
  },

  update: async (orgId: string, params: { name?: string; settings?: OrganizationSettings }): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: params.name,
          settings: params.settings as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)
        .select('id');

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'update');
    }
  },

  getMembers: async (orgId: string): Promise<IMember[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session.session?.user.id || '';

      const { data, error } = await supabase
        .from('organization_members')
        .select(`*, profiles:profile_id (id, full_name, email, avatar_url)`)
        .eq('organization_id', orgId)
        .overrideTypes<OrganizationMemberDTO[], { merge: false }>();

      if (error) throw error;

      return data.map((dto) => OrganizationMapper.toMemberDomain(dto, currentUserId));
    } catch (error) {
      handleOrganizationError(error, 'getMembers');
    }
  },

  getCandidatesMembers: async (orgId: string): Promise<IMember[]> => {
    const { data, error } = await supabase.rpc('get_candidate_members', {
      p_organization_id: orgId
    });

    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      name: d.full_name, 
      email: d.email,
      avatarUrl: d.avatar_url,
      role: 'sales',
      status: 'active'
    }));
  },

  createMember: async (orgId: string, data: CreateMemberDTO & { name: string, password: string }): Promise<void> => {
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
      handleOrganizationError(error, 'createMemberManually');
    }
  },

  replicateMember: async (orgId: string, userId: string, role: 'manager' | 'sales'): Promise<void> => {
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
  },

  updateMemberRole: async (memberId: string, newRole: UserRole): Promise<void> => {
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
  },

  updateMemberStatus: async (memberId: string, newStatus: MemberStatus): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ status: newStatus })
        .eq('id', memberId)
        .select('id')

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'updateMemberStatus');
    }
  },

  forceDeleteMember: async (memberId: string): Promise<void> => {
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
};