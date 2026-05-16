import type { Organization } from '@/features/organizations';

import { MovementApi } from '../../data/api';
import type { CreateMovementPayload, Movement } from '../entities';

export class MovementService {
  static async getAll({
    organization,
    productId
  }: {
    organization: Organization | null;
    productId?: string;
  }): Promise<Movement[]> {
    if (!organization?.id) {
      throw new Error('Nenhuma organização selecionada.');
    }

    return MovementApi.getAll({ productId, organizationId: organization.id });
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
}
