import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { OrganizationDTO } from '../../data/dtos';
import type {
  Organization,
  OrganizationWithDetails
} from '../../domain/entities';

export const organizationFactory = Factory.define<Organization>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name()
}));

export const organizationWithDetailsFactory =
  Factory.define<OrganizationWithDetails>(() => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    ownerId: faker.string.uuid(),
    document: undefined,
    legalName: undefined,
    status: 'active',
    createdAt: faker.date.past(),
    settings: {
      identity: {
        displayName: faker.company.name(),
        logoUrl: undefined
      },
      operational: {
        timezone: 'America/Sao_Paulo'
      },
      sales: {
        acceptOrdersOutsideHours: false
      },
      schedule: {
        mon: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        tue: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wed: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thu: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        fri: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        sat: { isOpen: false, openTime: '', closeTime: '' },
        sun: { isOpen: false, openTime: '', closeTime: '' }
      },
      address: undefined
    }
  }));

export const organizationDTOFactory = Factory.define<OrganizationDTO>(() => ({
  id: faker.string.uuid(),
  owner_id: faker.string.uuid(),
  name: faker.company.name(),
  document: null,
  legal_name: null,
  status: 'active',
  settings: {
    identity: {
      display_name: faker.company.name(),
      logo_url: undefined
    },
    operational: {
      timezone: 'America/Sao_Paulo'
    },
    sales: {
      accept_orders_outside_hours: false
    }
  },
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString()
}));
