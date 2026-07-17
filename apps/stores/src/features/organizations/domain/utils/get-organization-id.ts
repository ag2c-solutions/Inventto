import type { Organization } from '../entities';

export function getOrganizationId(organization: Organization | null): string {
  if (!organization?.id) {
    throw new Error('ID da organização é obrigatório.');
  }
  return organization.id;
}
