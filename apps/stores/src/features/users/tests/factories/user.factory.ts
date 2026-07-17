import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { UserWithOrganizationDTO } from '../../data/dtos';
import type { User, UserOrganization } from '../../domain/entities';

export const userOrganizationFactory = Factory.define<UserOrganization>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  role: 'owner'
}));

export const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  fullName: faker.person.fullName(),
  avatarUrl: faker.image.avatar(),
  mustChangePassword: false,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  availableOrganizations: [userOrganizationFactory.build()]
}));

/**
 * Builds a UserWithOrganizationDTO and its corresponding mapped User in
 * lockstep, so tests exercising UserMapper.toDomain (or code that calls it)
 * don't hand-duplicate the DTO→domain field mapping themselves.
 */
export function buildUserFixture(): {
  dto: UserWithOrganizationDTO;
  user: User;
} {
  const id = faker.string.uuid();
  const email = faker.internet.email();
  const fullName = faker.person.fullName();
  const avatarUrl = faker.image.avatar();
  const mustChangePassword = false;
  const createdAt = faker.date.past();
  const updatedAt = faker.date.recent();

  const org1 = { id: faker.string.uuid(), name: faker.company.name() };
  const org2 = { id: faker.string.uuid(), name: faker.company.name() };

  const dto: UserWithOrganizationDTO = {
    id,
    full_name: fullName,
    email,
    avatar_url: avatarUrl,
    must_change_password: mustChangePassword,
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    organization_members: [
      {
        role: 'owner',
        organization_id: org1.id,
        organizations: { ...org1, slug: faker.helpers.slugify(org1.name) }
      },
      {
        role: 'manager',
        organization_id: org2.id,
        organizations: { ...org2, slug: faker.helpers.slugify(org2.name) }
      }
    ]
  };

  const user: User = {
    id,
    email,
    fullName,
    avatarUrl,
    mustChangePassword,
    createdAt,
    updatedAt,
    availableOrganizations: [
      { ...org1, role: 'owner' },
      { ...org2, role: 'manager' }
    ]
  };

  return { dto, user };
}
