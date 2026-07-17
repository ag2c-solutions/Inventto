import { describe, expect, it } from 'vitest';

import {
  organizationSchema,
  passwordSchema,
  resetPasswordSchema,
  userSchema
} from './index';

describe('passwordSchema', () => {
  it('deve aceitar senha válida com todos os requisitos', () => {
    const result = passwordSchema.safeParse('StrongPass123!');
    expect(result.success).toBe(true);
  });

  it('deve rejeitar senha sem letra minúscula', () => {
    const result = passwordSchema.safeParse('STRONGPASS123!');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('minúscula');
  });

  it('deve rejeitar senha com mais de 32 caracteres', () => {
    const result = passwordSchema.safeParse('A'.repeat(33) + '!1a');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('máximo 32');
  });

  it('deve rejeitar senha sem letra maiúscula', () => {
    const result = passwordSchema.safeParse('weakpass123!');
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senha sem número', () => {
    const result = passwordSchema.safeParse('StrongPass!');
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senha sem caractere especial', () => {
    const result = passwordSchema.safeParse('StrongPass123');
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    const result = passwordSchema.safeParse('Aa1!');
    expect(result.success).toBe(false);
  });
});

describe('organizationSchema', () => {
  const validBase = {
    companyName: 'Inventto Tech',
    document: '123.456.789-09',
    businessAreaCode: 'clothing'
  };

  it('deve aceitar schema válido', () => {
    const result = organizationSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar quando businessAreaCode está ausente', () => {
    const result = organizationSchema.safeParse({
      companyName: 'Inventto',
      document: '123.456.789-09'
    });
    expect(result.success).toBe(false);

    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('businessAreaCode');
  });

  it('deve rejeitar quando businessAreaCode é string vazia', () => {
    const result = organizationSchema.safeParse({
      ...validBase,
      businessAreaCode: ''
    });
    expect(result.success).toBe(false);

    const messages = result.error?.issues.map((i) => i.message);
    expect(messages?.some((m) => m.includes('Selecione uma área'))).toBe(true);
  });

  it('deve rejeitar documento inválido', () => {
    const result = organizationSchema.safeParse({
      ...validBase,
      document: '123.456'
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar CNPJ sem razão social', () => {
    const result = organizationSchema.safeParse({
      companyName: 'Inventto',
      document: '33.400.689/0001-09',
      businessAreaCode: 'clothing'
    });
    expect(result.success).toBe(false);

    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('corporateName');
  });
});

describe('userSchema', () => {
  const validBase = {
    fullName: 'Joana Ribeiro',
    email: 'joana@email.com',
    password: 'StrongPass123!',
    passwordConfirmation: 'StrongPass123!',
    acceptedTerms: true as const
  };

  it('deve aceitar quando acceptedTerms é true', () => {
    const result = userSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar quando acceptedTerms é false', () => {
    const result = userSchema.safeParse({
      ...validBase,
      acceptedTerms: false
    });
    expect(result.success).toBe(false);

    const messages = result.error?.issues.map((i) => i.message);
    expect(messages?.some((m) => m.includes('aceitar os Termos'))).toBe(true);
  });

  it('deve rejeitar quando acceptedTerms está ausente', () => {
    const { acceptedTerms: _, ...withoutTerms } = validBase;
    const result = userSchema.safeParse(withoutTerms);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar quando as senhas não coincidem', () => {
    const result = userSchema.safeParse({
      ...validBase,
      passwordConfirmation: 'OutraSenha123!'
    });
    expect(result.success).toBe(false);

    const messages = result.error?.issues.map((i) => i.message);
    expect(messages?.some((m) => m.includes('não coincidem'))).toBe(true);
  });

  it('deve rejeitar e-mail inválido', () => {
    const result = userSchema.safeParse({
      ...validBase,
      email: 'not-an-email'
    });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const validBase = {
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!'
  };

  it('deve aceitar senha forte com confirmação idêntica', () => {
    const result = resetPasswordSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar senha fraca (RN001)', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'fraca',
      confirmPassword: 'fraca'
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar quando as senhas não coincidem', () => {
    const result = resetPasswordSchema.safeParse({
      ...validBase,
      confirmPassword: 'OutraSenha123!'
    });
    expect(result.success).toBe(false);

    const issue = result.error?.issues.find(
      (i) => i.path[0] === 'confirmPassword'
    );
    expect(issue?.message).toBe('As senhas não coincidem.');
  });
});
