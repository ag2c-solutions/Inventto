import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type {
  CandidateMemberDTO,
  OrganizationMemberDTO
} from '../../data/dtos';
import type { IMember } from '../../domain/entities';

export const memberFactory = Factory.define<IMember>(() => ({
  id: faker.string.uuid(),
  profileId: faker.string.uuid(),
  organizationId: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatarUrl: undefined,
  role: 'sales',
  status: 'active',
  joinedAt: faker.date.past(),
  isMe: false
}));

export const organizationMemberDTOFactory =
  Factory.define<OrganizationMemberDTO>(() => ({
    id: faker.string.uuid(),
    organization_id: faker.string.uuid(),
    profile_id: faker.string.uuid(),
    role: 'sales',
    status: 'active',
    created_at: faker.date.past().toISOString(),
    profiles: {
      id: faker.string.uuid(),
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar_url: null
    }
  }));

export const candidateMemberDTOFactory = Factory.define<CandidateMemberDTO>(
  () => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar_url: null
  })
);
