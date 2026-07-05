import { describe, expect, it } from 'vitest';

import { organizationFactory } from '../../tests/factories/organization.factory';

import { getOrganizationId } from './get-organization-id';

describe('getOrganizationId (via métodos públicos)', () => {
  it('deve lançar "Organization ID is required" quando organization é null', () => {
    expect(() => getOrganizationId(null)).toThrow(
      'ID da organização é obrigatório.'
    );
  });

  it('deve lançar quando organization.id é string vazia', () => {
    const organization = organizationFactory.build({ id: '' });

    expect(() => getOrganizationId(organization)).toThrow(
      'ID da organização é obrigatório.'
    );
  });

  it('deve retornar o id quando organization é válida', () => {
    const organization = organizationFactory.build({ id: 'org-42' });

    expect(getOrganizationId(organization)).toBe('org-42');
  });
});
