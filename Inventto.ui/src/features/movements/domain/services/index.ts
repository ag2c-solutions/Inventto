import { MovementApi } from '../../data/api';
import type { CreateMovementPayload } from '../entities';

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
}
