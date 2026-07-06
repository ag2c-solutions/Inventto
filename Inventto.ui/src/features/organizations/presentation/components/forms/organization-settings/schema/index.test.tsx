import { describe, expect, it } from 'vitest';

import {
  defaultSettingsValues,
  type OrganizationSettingsFormData,
  organizationSettingsSchema
} from './index';
import { organizationSettingsFormDataFactory } from './organization-settings-form-data.factory';

describe('organizationSettingsSchema', () => {
  it('não exige mais whatsapp em operational e descarta a chave legada', () => {
    // Antes, operational.whatsappMain era obrigatório (min 10). Agora, dados
    // sem whatsapp são válidos e a chave legada é removida na saída.
    const data =
      organizationSettingsFormDataFactory.build() as OrganizationSettingsFormData & {
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
    const data = organizationSettingsFormDataFactory.build({
      operational: { timezone: '' }
    });

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
    const result = organizationSettingsSchema.safeParse(
      organizationSettingsFormDataFactory.build()
    );

    expect(result.success).toBe(true);
  });

  it('usa America/Sao_Paulo como fuso horário padrão', () => {
    expect(defaultSettingsValues.operational.timezone).toBe(
      'America/Sao_Paulo'
    );
  });

  describe('dayScheduleSchema (faixa única por dia — RF007)', () => {
    it('exige abertura e fechamento quando o dia está aberto', () => {
      const data = organizationSettingsFormDataFactory.build();
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
      const data = organizationSettingsFormDataFactory.build();
      data.schedule.mon = { isOpen: true, open: '25:00', close: '99:99' };

      const result = organizationSettingsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('não exige horários quando o dia está fechado', () => {
      const data = organizationSettingsFormDataFactory.build();
      data.schedule.sun = { isOpen: false, open: '', close: '' };

      const result = organizationSettingsSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });
});
