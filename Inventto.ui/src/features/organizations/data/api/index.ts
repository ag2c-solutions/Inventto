import { CloudinaryService } from '@/infra/cloudinary';
import { supabase, tempClient } from '@/infra/supabase';
import { ViaCEPService } from '@/infra/viacep';

import type {
  IAddress,
  IMember,
  MemberStatus,
  OrganizationWithDetails,
  UpdateOrganizationInput
} from '../../domain/entities';
import type {
  CandidateMemberDTO,
  CreateMemberDTO,
  OrganizationDTO,
  OrganizationMemberDTO
} from '../dtos';
import { handleOrganizationError } from '../handlers/error-handler';
import { OrganizationMapper } from '../mapper';

export class OrganizationApi {
  static async getById(orgId: string): Promise<OrganizationWithDetails> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(
          'id, owner_id, name, document, legal_name, status, settings, created_at'
        )
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
    document?: string;
    sourceOrgId?: string;
    replicateGroups?: string[];
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_new_organization', {
        p_name: payload.name,
        p_document: payload.document || null,
        p_source_org_id: payload.sourceOrgId || null,
        p_replicate_groups: payload.replicateGroups || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleOrganizationError(error, 'create');
    }
  }

  static async update(
    orgId: string,
    params: UpdateOrganizationInput
  ): Promise<void> {
    try {
      const settingsDTO = OrganizationMapper.toSettingsDTO(params.settings);

      const { error } = await supabase
        .from('organizations')
        .update({
          name: params.name,
          document: params.document,
          legal_name: params.legalName,
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

  static async deactivate(orgId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('deactivate_organization', {
        p_org_id: orgId
      });

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'deactivate');
    }
  }

  static async remove(orgId: string, purge: boolean = false): Promise<void> {
    try {
      const { error } = await supabase.rpc('delete_organization', {
        p_org_id: orgId,
        p_purge: purge
      });

      if (error) throw error;
    } catch (error) {
      handleOrganizationError(error, 'remove');
    }
  }

  static async uploadLogo(file: File): Promise<string> {
    try {
      const { url } = await CloudinaryService.uploadImage(file);

      return url;
    } catch (error) {
      handleOrganizationError(error, 'uploadLogo');
    }
  }

  static async lookupCep(cep: string): Promise<IAddress | null> {
    try {
      const data = await ViaCEPService.lookup(cep);

      return data ? OrganizationMapper.viaCepToAddress(data) : null;
    } catch (error) {
      handleOrganizationError(error, 'lookupCep');
    }
  }

  static async getMembers(
    orgId: string,
    currentUserId: string
  ): Promise<IMember[]> {
    try {
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
      // tempClient é usado intencionalmente aqui para evitar que o OWNER
      // seja deslogado durante a criação do novo usuário. Não substituir
      // por supabase.auth.signUp — isso encerraria a sessão atual.
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
    newRole: 'manager' | 'sales'
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
