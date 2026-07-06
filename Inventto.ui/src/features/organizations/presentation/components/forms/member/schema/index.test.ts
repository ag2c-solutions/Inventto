import { describe, expect, it } from 'vitest';

import { memberFormSchema } from './index';
import { memberFormDataFactory } from './member-form-data.factory';

describe('memberFormSchema', () => {
  describe('novo membro (isReplication = false)', () => {
    it('aceita uma senha provisória forte (RN001)', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({ password: 'StrongPass123!' })
      );

      expect(result.success).toBe(true);
    });

    it('rejeita senha com menos de 8 caracteres (RN001)', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({ password: 'Aa1!' })
      );

      expect(result.success).toBe(false);
      expect(result.error?.issues.some((i) => i.path[0] === 'password')).toBe(
        true
      );
    });

    it('rejeita senha sem complexidade exigida (RN001)', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({ password: 'somentenumeros123' })
      );

      expect(result.success).toBe(false);
      expect(result.error?.issues.some((i) => i.path[0] === 'password')).toBe(
        true
      );
    });

    it('rejeita nome com menos de 3 caracteres', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({
          name: 'Al',
          password: 'StrongPass123!'
        })
      );

      expect(result.success).toBe(false);
    });

    it('rejeita e-mail inválido', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({
          email: 'invalido',
          password: 'StrongPass123!'
        })
      );

      expect(result.success).toBe(false);
    });

    it('rejeita função fora de manager/sales (RN037)', () => {
      const result = memberFormSchema.safeParse({
        ...memberFormDataFactory.build({ password: 'StrongPass123!' }),
        role: 'owner'
      });

      expect(result.success).toBe(false);
    });
  });

  describe('replicação (isReplication = true)', () => {
    it('dispensa a validação de senha (RN035)', () => {
      const result = memberFormSchema.safeParse(
        memberFormDataFactory.build({ password: '', isReplication: true })
      );

      expect(result.success).toBe(true);
    });
  });
});
