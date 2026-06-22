import { describe, expect, it } from 'vitest';

import type { OrganizationSettingsFormData } from '../schema';

import { formValuesToUpdateInput } from './to-update-input';

const baseFormData = (): OrganizationSettingsFormData => ({
  name: 'Loja',
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
  operational: {
    timezone: 'America/Sao_Paulo',
    whatsappMain: '(81) 99999-9999',
    whatsappSupport: ''
  },
  sales: { acceptOrdersOutsideHours: false },
  schedule: {
    mon: { isOpen: true, open: '09:00', close: '18:00' },
    tue: { isOpen: true, open: '09:00', close: '18:00' },
    wed: { isOpen: true, open: '09:00', close: '18:00' },
    thu: { isOpen: true, open: '09:00', close: '18:00' },
    fri: { isOpen: true, open: '09:00', close: '18:00' },
    sat: { isOpen: false, open: '', close: '' },
    sun: { isOpen: false, open: '', close: '' }
  }
});

describe('formValuesToUpdateInput', () => {
  it('converte document e legalName vazios em null', () => {
    const result = formValuesToUpdateInput(baseFormData());

    expect(result.document).toBeNull();
    expect(result.legalName).toBeNull();
  });

  it('sanitiza o whatsapp e omite o suporte quando vazio', () => {
    const result = formValuesToUpdateInput(baseFormData());

    expect(result.settings.operational.whatsappMain).toBe('81999999999');
    expect(result.settings.operational.whatsappSupport).toBeUndefined();
  });

  it('deixa address indefinido quando todos os campos estão vazios', () => {
    const result = formValuesToUpdateInput(baseFormData());

    expect(result.settings.address).toBeUndefined();
  });

  it('converte open/close em openTime/closeTime no schedule', () => {
    const result = formValuesToUpdateInput(baseFormData());

    expect(result.settings.schedule.mon).toEqual({
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00'
    });
  });

  it('repassa o logoFile selecionado para o input', () => {
    const data = baseFormData();
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    data.identity.logoFile = file;

    const result = formValuesToUpdateInput(data);

    expect(result.logoFile).toBe(file);
  });

  it('monta o address e converte complemento vazio em undefined', () => {
    const data = baseFormData();
    data.address = {
      zip: '50000-000',
      street: 'Rua A',
      number: '10',
      complement: '',
      district: 'Centro',
      city: 'Recife',
      state: 'PE'
    };

    const result = formValuesToUpdateInput(data);

    expect(result.settings.address).toEqual({
      zip: '50000-000',
      street: 'Rua A',
      number: '10',
      complement: undefined,
      district: 'Centro',
      city: 'Recife',
      state: 'PE'
    });
  });

  it('usa name como displayName e omite logoUrl vazio', () => {
    const result = formValuesToUpdateInput(baseFormData());

    expect(result.settings.identity.displayName).toBe('Loja');
    expect(result.settings.identity.logoUrl).toBeUndefined();
  });
});
