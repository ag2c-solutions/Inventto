import { MovementApi } from '../../data/api';
import type {
  CancelConfirmedSaleInput,
  CreateMovementPayload
} from '../entities';

export class MovementService {
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
