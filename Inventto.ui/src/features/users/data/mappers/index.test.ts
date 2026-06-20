import { describe, expect, it } from 'vitest';

import type { User } from '../../domain/entities';
import type { UserWithOrganizationDTO } from '../dtos';

import { UserMapper } from './index';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map user with organizations to domain', () => {
      const dto: UserWithOrganizationDTO = {
        id: 'user-123',
        email: 'rafael@test.com',
        full_name: 'Rafael Conceição',
        avatar_url: 'https://cdn.example.com/avatar.png',
        must_change_password: false,
        created_at: '2026-05-04T10:00:00.000Z',
        updated_at: '2026-05-04T12:00:00.000Z',
        organization_members: [
          {
            role: 'owner',
            organization_id: 'organization-123',
            organizations: {
              id: 'organization-123',
              name: 'Inventto',
              slug: 'inventto'
            }
          },
          {
            role: 'manager',
            organization_id: 'organization-456',
            organizations: {
              id: 'organization-456',
              name: 'Smart Tech',
              slug: 'smart-tech'
            }
          }
        ]
      };

      const expectedUser: User = {
        id: 'user-123',
        email: 'rafael@test.com',
        fullName: 'Rafael Conceição',
        avatarUrl: 'https://cdn.example.com/avatar.png',
        mustChangePassword: false,
        createdAt: new Date('2026-05-04T10:00:00.000Z'),
        updatedAt: new Date('2026-05-04T12:00:00.000Z'),
        availableOrganizations: [
          {
            id: 'organization-123',
            name: 'Inventto',
            role: 'owner'
          },
          {
            id: 'organization-456',
            name: 'Smart Tech',
            role: 'manager'
          }
        ]
      };

      const result = UserMapper.toDomain(dto);

      expect(result).toEqual(expectedUser);
    });

    it('should map user without organization members to domain with empty available organizations', () => {
      const dto: UserWithOrganizationDTO = {
        id: 'user-123',
        email: 'rafael@test.com',
        full_name: 'Rafael Conceição',
        avatar_url: null,
        must_change_password: true,
        created_at: '2026-05-04T10:00:00.000Z',
        updated_at: '2026-05-04T12:00:00.000Z',
        organization_members: []
      };

      const result = UserMapper.toDomain(dto);

      expect(result).toEqual({
        id: 'user-123',
        email: 'rafael@test.com',
        fullName: 'Rafael Conceição',
        avatarUrl: null,
        mustChangePassword: true,
        createdAt: new Date('2026-05-04T10:00:00.000Z'),
        updatedAt: new Date('2026-05-04T12:00:00.000Z'),
        availableOrganizations: []
      });
    });

    it('should map user with undefined organization members to domain with empty available organizations', () => {
      const dto = {
        id: 'user-123',
        email: 'rafael@test.com',
        full_name: 'Rafael Conceição',
        avatar_url: null,
        must_change_password: false,
        created_at: '2026-05-04T10:00:00.000Z',
        updated_at: '2026-05-04T12:00:00.000Z',
        organization_members: undefined
      } as unknown as UserWithOrganizationDTO;

      const result = UserMapper.toDomain(dto);

      expect(result.availableOrganizations).toEqual([]);
    });

    it('should throw when organization member does not have organization data', () => {
      const dto: UserWithOrganizationDTO = {
        id: 'user-123',
        email: 'rafael@test.com',
        full_name: 'Rafael Conceição',
        avatar_url: null,
        must_change_password: false,
        created_at: '2026-05-04T10:00:00.000Z',
        updated_at: '2026-05-04T12:00:00.000Z',
        organization_members: [
          {
            role: 'owner',
            organization_id: 'organization-123',
            organizations: null
          }
        ]
      };

      expect(() => UserMapper.toDomain(dto)).toThrow(
        'Inconsistência de dados: Membro organization-123 sem dados da organização.'
      );
    });
  });
});
