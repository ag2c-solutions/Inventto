import { describe, expect, it } from 'vitest';

import { buildUserFixture } from '../../tests/factories/user.factory';
import type { UserWithOrganizationDTO } from '../dtos';

import { UserMapper } from './index';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map user with organizations to domain', () => {
      const { dto, user: expectedUser } = buildUserFixture();

      const result = UserMapper.toDomain(dto);

      expect(result).toEqual(expectedUser);
    });

    it('should map user without organization members to domain with empty available organizations', () => {
      const { dto, user } = buildUserFixture();
      const dtoWithoutMembers: UserWithOrganizationDTO = {
        ...dto,
        organization_members: []
      };

      const result = UserMapper.toDomain(dtoWithoutMembers);

      expect(result).toEqual({ ...user, availableOrganizations: [] });
    });

    it('should map user with undefined organization members to domain with empty available organizations', () => {
      const { dto } = buildUserFixture();
      const dtoWithUndefinedMembers = {
        ...dto,
        organization_members: undefined
      } as unknown as UserWithOrganizationDTO;

      const result = UserMapper.toDomain(dtoWithUndefinedMembers);

      expect(result.availableOrganizations).toEqual([]);
    });

    it('should throw when organization member does not have organization data', () => {
      const { dto } = buildUserFixture();
      const dtoWithMissingOrgData: UserWithOrganizationDTO = {
        ...dto,
        organization_members: [
          {
            role: 'owner',
            organization_id: 'organization-123',
            organizations: null
          }
        ]
      };

      expect(() => UserMapper.toDomain(dtoWithMissingOrgData)).toThrow(
        'Inconsistência de dados: Membro organization-123 sem dados da organização.'
      );
    });
  });
});
