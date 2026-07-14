import type { Organization } from '@/features/organizations';
import type { Role } from '@/features/permissions';

import { MovementApi } from '../../data/api';
import type {
  CancelConfirmedSaleInput,
  CreateMovementPayload,
  Movement
} from '../entities';

export class MovementService {
  // MOV-08: fork por papel (mesmo padrão de ProductService.getAll) — Sales lê o
  // histórico pela RPC sanitizada (só as próprias movimentações, sem custo).
  static async getAll(params: {
    organization: Organization | null;
    role?: Role;
    productId?: string;
  }): Promise<Movement[]> {
    if (!params.organization?.id) {
      throw new Error('Nenhuma organização selecionada.');
    }

    if (!params.role?.trim()) {
      throw new Error('Usuário sem cargo.');
    }

    const filters = {
      organizationId: params.organization.id,
      productId: params.productId
    };

    if (params.role === 'sales') {
      return MovementApi.getAllForSales(filters);
    }

    return MovementApi.getAll(filters);
  }

  static async create(payload: CreateMovementPayload): Promise<string> {
    if (!payload.organization?.id) {
      throw new Error('Nenhuma organização selecionada.');
    }

    return MovementApi.create({
      input: payload.input,
      organizationId: payload.organization.id
    });
  }

  // MOV-06: validação de domínio antes da chamada — o RPC também valida
  // (motivo obrigatório, RN056, status), mas falhar cedo evita um round-trip
  // óbvio quando o motivo veio vazio do form.
  static async cancelConfirmedSale(
    input: CancelConfirmedSaleInput
  ): Promise<string> {
    if (!input.orderId) {
      throw new Error('Nenhuma venda selecionada para estornar.');
    }

    if (!input.reason.trim()) {
      throw new Error('Informe o motivo do estorno.');
    }

    return MovementApi.cancelConfirmedSale({
      orderId: input.orderId,
      reason: input.reason.trim()
    });
  }
}
