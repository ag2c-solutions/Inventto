import type { UserRole } from '@/features/users';

import { OrganizationApi } from '../../data/api';
import type { CreateMemberDTO } from '../../data/dtos';
import type {
  CreateOrganizationInput,
  MemberStatus,
  OrganizationSettings
} from '../entities';

export class OrganizationService {
  static async create(payload: CreateOrganizationInput): Promise<string> {
    return OrganizationApi.create(payload);
  }

  static async update(
    orgId: string,
    settings: OrganizationSettings
  ): Promise<void> {
    return OrganizationApi.update(orgId, { settings });
  }

  static async createMember(
    orgId: string,
    data: CreateMemberDTO
  ): Promise<void> {
    return OrganizationApi.createMember(orgId, data);
  }

  static async replicateMember(
    orgId: string,
    userId: string,
    role: 'manager' | 'sales'
  ): Promise<void> {
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
