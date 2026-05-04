import { MovementApi } from '../../data/api';
import type { CreateMovementInput } from '../entities';

export interface CreateMovementPayload {
  input: CreateMovementInput;
  organizationId: string;
}

export class MovementService {
  static async create(payload: CreateMovementPayload): Promise<string> {
    return MovementApi.create(payload);
  }
}
