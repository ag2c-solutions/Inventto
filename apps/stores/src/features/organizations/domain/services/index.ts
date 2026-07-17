import type { Role } from '@/features/permissions';

import { OrganizationApi } from '../../data/api';
import type {
  CreateMember,
  CreateOrganizationInput,
  IAddress,
  MemberStatus,
  Organization,
  UpdateOrganizationInput
} from '../entities';
import { getOrganizationId } from '../utils/get-organization-id';

// Discriminador de controle de fluxo (RN034/RN007): o e-mail informado já
// pertence a um usuário de OUTRO negócio. O valor precisa ficar em sincronia
// com a constante de mesmo nome em `data/handlers/error-handler.ts` — o
// handler é quem efetivamente lança o erro, mas presentation não pode
// importar de `data/` diretamente (boundary), então o domínio expõe o mesmo
// identificador para o form comparar.
export const EMAIL_OTHER_TENANT_ERROR = 'EMAIL_OTHER_TENANT';

export class OrganizationService {
  static async getById(organization: Organization | null) {
    const orgId = getOrganizationId(organization);

    return OrganizationApi.getById(orgId);
  }

  static async getMembers(
    organization: Organization | null,
    currentUserId: string
  ) {
    const orgId = getOrganizationId(organization);

    if (!currentUserId?.trim()) {
      throw new Error('ID do usuário é obrigatório.');
    }

    return OrganizationApi.getMembers(orgId, currentUserId);
  }

  static async getCandidatesMembers(organization: Organization | null) {
    const orgId = getOrganizationId(organization);

    return OrganizationApi.getCandidatesMembers(orgId);
  }

  static async create(payload: CreateOrganizationInput): Promise<string> {
    if (!payload.name?.trim()) {
      throw new Error('Nome da organização é obrigatório.');
    }

    return OrganizationApi.create(payload);
  }

  static async update(
    organization: Organization | null,
    input: UpdateOrganizationInput
  ): Promise<void> {
    const orgId = getOrganizationId(organization);

    if (!input.logoFile) {
      return OrganizationApi.update(orgId, input);
    }

    const logoUrl = await OrganizationApi.uploadLogo(input.logoFile);

    const { logoFile: _logoFile, ...rest } = input;

    return OrganizationApi.update(orgId, {
      ...rest,
      settings: {
        ...input.settings,
        identity: {
          ...input.settings.identity,
          logoUrl
        }
      }
    });
  }

  static async deactivate(organization: Organization | null): Promise<void> {
    const orgId = getOrganizationId(organization);

    return OrganizationApi.deactivate(orgId);
  }

  static async remove(
    organization: Organization | null,
    purge: boolean = false
  ): Promise<void> {
    const orgId = getOrganizationId(organization);

    return OrganizationApi.remove(orgId, purge);
  }

  static async createMember(
    organization: Organization | null,
    data: CreateMember
  ): Promise<void> {
    const orgId = getOrganizationId(organization);

    return OrganizationApi.createMember(orgId, data);
  }

  static async replicateMember(
    organization: Organization | null,
    userId: string,
    role: Role
  ): Promise<void> {
    if (role === 'owner') {
      throw new Error(
        'Usuário não pode ser replicado com cargo de proprietário'
      );
    }

    const orgId = getOrganizationId(organization);

    return OrganizationApi.replicateMember(orgId, userId, role);
  }

  static async updateMemberRole(
    memberId: string,
    newRole: Role
  ): Promise<void> {
    if (newRole === 'owner') {
      throw new Error(
        'Usuário não pode ser atualizado com cargo de proprietário'
      );
    }

    return OrganizationApi.updateMemberRole(memberId, newRole);
  }

  static async updateMemberStatus(
    memberId: string,
    newStatus: MemberStatus
  ): Promise<void> {
    return OrganizationApi.updateMemberStatus(memberId, newStatus);
  }

  static async lookupCep(cep: string): Promise<IAddress> {
    const address = await OrganizationApi.lookupCep(cep);

    if (!address) {
      throw new Error('CEP não encontrado');
    }

    return address;
  }
}
