import type { UserOrganizationContext, UserRole } from '@/features/users';

import { OrganizationApi } from '../../data/api';
import type {
  CreateMember,
  CreateOrganizationInput,
  MemberStatus,
  OrganizationSettings
} from '../entities';

export class OrganizationService {
  private static getOrganizationId = (
    organization: UserOrganizationContext | null
  ): string => {
    if (!organization?.id) {
      throw new Error('Organization ID is required');
    }
    return organization.id;
  };

  static async getById(organization: UserOrganizationContext | null) {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.getById(orgId);
  }

  static async getMembers(organization: UserOrganizationContext | null) {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.getMembers(orgId);
  }

  static async getCandidatesMembers(
    organization: UserOrganizationContext | null
  ) {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.getCandidatesMembers(orgId);
  }

  static async create(payload: CreateOrganizationInput): Promise<string> {
    return OrganizationApi.create(payload);
  }

  static async update(
    organization: UserOrganizationContext | null,
    settings: OrganizationSettings
  ): Promise<void> {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.update(orgId, { settings });
  }

  static async createMember(
    organization: UserOrganizationContext | null,
    data: CreateMember
  ): Promise<void> {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.createMember(orgId, data);
  }

  static async replicateMember(
    organization: UserOrganizationContext | null,
    userId: string,
    role: 'manager' | 'sales'
  ): Promise<void> {
    const orgId = this.getOrganizationId(organization);

    return OrganizationApi.replicateMember(orgId, userId, role);
  }

  static async updateMemberRole(
    memberId: string,
    newRole: UserRole
  ): Promise<void> {
    return OrganizationApi.updateMemberRole(memberId, newRole);
  }

  static async updateMemberStatus(
    memberId: string,
    newStatus: MemberStatus
  ): Promise<void> {
    return OrganizationApi.updateMemberStatus(memberId, newStatus);
  }

  static async forceDeleteMember(memberId: string): Promise<void> {
    return OrganizationApi.forceDeleteMember(memberId);
  }
}
