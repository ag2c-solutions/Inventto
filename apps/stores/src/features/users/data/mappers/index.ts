import type { User, UserOrganization } from '../../domain/entities';
import type { OrganizationMemberDTO, UserWithOrganizationDTO } from '../dtos';

export class UserMapper {
  static toDomain(dto: UserWithOrganizationDTO): User {
    const availableOrganizations = dto.organization_members
      ? dto.organization_members.map(UserMapper.mapOrganizationMember)
      : [];

    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.full_name,
      avatarUrl: dto.avatar_url,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      mustChangePassword: dto.must_change_password,
      availableOrganizations
    };
  }

  private static mapOrganizationMember(
    member: OrganizationMemberDTO
  ): UserOrganization {
    if (!member.organizations) {
      throw new Error(
        `Inconsistência de dados: Membro ${member.organization_id} sem dados da organização.`
      );
    }

    return {
      id: member.organizations.id,
      name: member.organizations.name,
      role: member.role
    };
  }
}
