import { describe, expect, it } from 'vitest';

import {
  defaultSettingsValues,
  type OrganizationSettingsFormData,
  organizationSettingsSchema
} from './index';

const baseData = (): OrganizationSettingsFormData => ({
  name: 'Ateliê Joana',
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
});

describe('organizationSettingsSchema', () => {
  it('não exige mais whatsapp em operational e descarta a chave legada', () => {
    // Antes, operational.whatsappMain era obrigatório (min 10). Agora, dados
    // sem whatsapp são válidos e a chave legada é removida na saída.
    const data = baseData() as OrganizationSettingsFormData & {
      operational: { timezone: string; whatsappMain?: string };
    };
    data.operational.whatsappMain = '11999999999';

    const result = organizationSettingsSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operational).not.toHaveProperty('whatsappMain');
      expect(result.data.operational.timezone).toBe('America/Sao_Paulo');
    }
  });

  it('exige o fuso horário', () => {
    const data = baseData();
    data.operational.timezone = '';

    const result = organizationSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.join('.').includes('operational.timezone')
      );
      expect(issue).toBeDefined();
    }
  });

  it('aceita dados válidos com o fuso horário preenchido', () => {
    const result = organizationSettingsSchema.safeParse(baseData());

    expect(result.success).toBe(true);
  });

  it('usa America/Sao_Paulo como fuso horário padrão', () => {
    expect(defaultSettingsValues.operational.timezone).toBe(
      'America/Sao_Paulo'
    );
  });

  describe('dayScheduleSchema (faixa única por dia — RF007)', () => {
    it('exige abertura e fechamento quando o dia está aberto', () => {
      const data = baseData();
      data.schedule.mon = { isOpen: true, open: '', close: '' };

      const result = organizationSettingsSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Horário de abertura obrigatório');
        expect(messages).toContain('Horário de fechamento obrigatório');
      }
    });

    it('rejeita horários com formato inválido em dia aberto', () => {
      const data = baseData();
      data.schedule.mon = { isOpen: true, open: '25:00', close: '99:99' };

      const result = organizationSettingsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('não exige horários quando o dia está fechado', () => {
      const data = baseData();
      data.schedule.sun = { isOpen: false, open: '', close: '' };

      const result = organizationSettingsSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });
});
