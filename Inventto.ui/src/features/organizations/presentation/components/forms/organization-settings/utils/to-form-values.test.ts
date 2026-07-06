import { describe, expect, it } from 'vitest';

import type {
  DayOfWeek,
  IBusinessSchedule,
  OrganizationWithDetails
} from '../../../../../domain/entities';

import { organizationToFormValues } from './to-form-values';

const fullSchedule = (): Record<DayOfWeek, IBusinessSchedule> => ({
  mon: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  tue: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  wed: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  thu: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  fri: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sat: { isOpen: false, openTime: '', closeTime: '' },
  sun: { isOpen: false, openTime: '', closeTime: '' }
});

const baseOrganization = (): OrganizationWithDetails => ({
  id: 'org-1',
  name: 'Ateliê',
  ownerId: 'owner-1',
  document: '12345678000190',
  legalName: 'Ateliê LTDA',
  status: 'active',
  createdAt: new Date(),
  settings: {
    identity: { displayName: 'Ateliê Display', logoUrl: 'http://cdn/logo.png' },
    operational: {
      timezone: 'America/Recife'
    },
    sales: { acceptOrdersOutsideHours: true },
    schedule: fullSchedule(),
    address: {
      zip: '50000-000',
      street: 'Rua A',
      number: '10',
      complement: 'apto 2',
      district: 'Centro',
      city: 'Recife',
      state: 'PE'
    }
  }
});

describe('organizationToFormValues', () => {
  it('prefere displayName sobre name e formata o documento', () => {
    const result = organizationToFormValues(baseOrganization());

    expect(result.name).toBe('Ateliê Display');
    expect(result.document).toBe('12.345.678/0001-90');
    expect(result.legalName).toBe('Ateliê LTDA');
    expect(result.identity.logoUrl).toBe('http://cdn/logo.png');
  });

  it('usa o name da organização quando displayName está vazio', () => {
    const org = baseOrganization();
    org.settings.identity.displayName = '';

    const result = organizationToFormValues(org);

    expect(result.name).toBe('Ateliê');
  });

  it('mapeia o endereço e converte openTime/closeTime em open/close', () => {
    const result = organizationToFormValues(baseOrganization());

    expect(result.address).toEqual({
      zip: '50000-000',
      street: 'Rua A',
      number: '10',
      complement: 'apto 2',
      district: 'Centro',
      city: 'Recife',
      state: 'PE'
    });
    expect(result.schedule.mon).toEqual({
      isOpen: true,
      open: '09:00',
      close: '18:00'
    });
  });

  it('preenche o endereço com strings vazias quando ausente', () => {
    const org = baseOrganization();
    org.settings.address = undefined;

    const result = organizationToFormValues(org);

    expect(result.address).toEqual({
      zip: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: ''
    });
  });

  it('mantém document vazio quando a organização não tem documento', () => {
    const org = baseOrganization();
    org.document = undefined;

    const result = organizationToFormValues(org);

    expect(result.document).toBe('');
  });
});
