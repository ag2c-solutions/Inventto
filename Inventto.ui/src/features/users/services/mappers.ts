import type {
  OrganizationMemberDTO,
  User,
  UserOrganizationContext,
  UserRole,
  UserWithOrganizationDTO
} from '../types';

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
  ): UserOrganizationContext {
    if (!member.organizations) {
      throw new Error(
        `Inconsistência de dados: Membro ${member.organization_id} sem dados da organização.`
      );
    }

    return {
      id: member.organizations.id,
      name: member.organizations.name,
      slug: member.organizations.slug,
      role: member.role as UserRole
    };
  }
}
