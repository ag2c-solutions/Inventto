import type { Role } from '@/features/permissions';

import { OrganizationApi } from '../../data/api';
import type {
  CreateMember,
  CreateOrganizationInput,
  MemberStatus,
  Organization,
  OrganizationSettings
} from '../entities';

export class OrganizationService {
  private static getOrganizationId = (
    organization: Organization | null
  ): string => {
    if (!organization?.id) {
      throw new Error('ID da organização é obrigatório.');
    }
    return organization.id;
  };

  static async getById(organization: Organization | null) {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.getById(orgId);
  }

  static async getMembers(
    organization: Organization | null,
    currentUserId: string
  ) {
    const orgId = this.getOrganizationId(organization);

    if (!currentUserId?.trim()) {
      throw new Error('ID do usuário é obrigatório.');
    }

    return OrganizationApi.getMembers(orgId, currentUserId);
  }

  static async getCandidatesMembers(organization: Organization | null) {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.getCandidatesMembers(orgId);
  }

  static async create(payload: CreateOrganizationInput): Promise<string> {
    return OrganizationApi.create(payload);
  }

  static async update(
    organization: Organization | null,
    settings: OrganizationSettings
  ): Promise<void> {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.update(orgId, { settings });
  }

  static async createMember(
    organization: Organization | null,
    data: CreateMember
  ): Promise<void> {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.createMember(orgId, data);
  }

  static async replicateMember(
    organization: Organization | null,
    userId: string,
    role: Role
  ): Promise<void> {
    if (role === 'owner') {
      throw new Error(
        'Usuário não pode ser replicado com cargo de proprietário'
      );
    }

    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.replicateMember(orgId, userId, role);
  }

  static async updateMemberRole(
    memberId: string,
    newRole: Role
  ): Promise<void> {
    if (newRole === 'owner') {
      throw new Error(
        'Usuário não pode ser atualizado com cargo de proprietário'
      );
    }

    return OrganizationApi.updateMemberRole(memberId, newRole);
  }

  static async updateMemberStatus(
    memberId: string,
    newStatus: MemberStatus
  ): Promise<void> {
    return OrganizationApi.updateMemberStatus(memberId, newStatus);
  }
}
