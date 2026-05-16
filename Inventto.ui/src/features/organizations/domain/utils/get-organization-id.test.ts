import { describe, expect, it } from 'vitest';

import { getOrganizationId } from './get-organization-id';

describe('getOrganizationId (via métodos públicos)', () => {
  it('deve lançar "Organization ID is required" quando organization é null', () => {
    expect(() => getOrganizationId(null)).toThrow(
      'ID da organização é obrigatório.'
    );
  });

  it('deve lançar quando organization.id é string vazia', () => {
    expect(() => getOrganizationId({ id: '', role: 'owner' } as never)).toThrow(
      'ID da organização é obrigatório.'
    );
  });
});
