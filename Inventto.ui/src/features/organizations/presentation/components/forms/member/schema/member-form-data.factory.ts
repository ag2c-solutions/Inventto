import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { MemberFormData } from '.';

/**
 * Test-only factory for the member form's input shape. Lives beside the
 * schema, not in the feature's shared `tests/factories/`, since that folder
 * is reserved for Domain/DTO factories and this type is presentation-layer
 * only (importing it from `tests/` would violate the `boundaries/dependencies`
 * eslint rule: `feature-tests` cannot depend on `feature-presentation`).
 */
export const memberFormDataFactory = Factory.define<MemberFormData>(() => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'sales',
  password: 'StrongPass123!',
  isReplication: false
}));
