import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { OrganizationSettingsFormData } from '.';

/**
 * Test-only factory for the settings form's input shape. Lives beside the
 * schema, not in the feature's shared `tests/factories/`, since that folder
 * is reserved for Domain/DTO factories and this type is presentation-layer
 * only (importing it from `tests/` would violate the `boundaries/dependencies`
 * eslint rule: `feature-tests` cannot depend on `feature-presentation`).
 */
export const organizationSettingsFormDataFactory =
  Factory.define<OrganizationSettingsFormData>(() => ({
    name: faker.company.name(),
    document: '',
    legalName: '',
    identity: { logoUrl: '' },
    address: {
      zip: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: ''
    },
    operational: { timezone: 'America/Sao_Paulo' },
    sales: { acceptOrdersOutsideHours: false },
    schedule: {
      mon: { isOpen: true, open: '09:00', close: '18:00' },
      tue: { isOpen: true, open: '09:00', close: '18:00' },
      wed: { isOpen: true, open: '09:00', close: '18:00' },
      thu: { isOpen: true, open: '09:00', close: '18:00' },
      fri: { isOpen: true, open: '09:00', close: '18:00' },
      sat: { isOpen: true, open: '09:00', close: '13:00' },
      sun: { isOpen: false, open: '', close: '' }
    }
  }));
