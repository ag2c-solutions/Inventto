import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementApi } from '../../data/api';
import { createMovementInputFactory } from '../../tests/factories/movement.factory';

import { MovementService } from './index';

vi.mock('../../data/api', () => ({
  MovementApi: {
    create: vi.fn()
  }
}));

function buildOrganization(overrides: { id?: string } = {}) {
  return {
    id: overrides.id ?? faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    role: 'owner' as const
  };
}

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to MovementApi.create with orgId extracted from organization', async () => {
      vi.mocked(MovementApi.create).mockResolvedValue('new-movement-id');

      const input = createMovementInputFactory.build();
      const organization = buildOrganization();

      const result = await MovementService.create({ input, organization });

      expect(MovementApi.create).toHaveBeenCalledWith({
        input,
        organizationId: organization.id
      });
      expect(result).toBe('new-movement-id');
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.create({
          input: createMovementInputFactory.build(),
          organization: null
        })
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(MovementApi.create).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by MovementApi.create', async () => {
      vi.mocked(MovementApi.create).mockRejectedValue(
        new Error('A operação resultaria em estoque negativo (não permitido).')
      );

      await expect(
        MovementService.create({
          input: createMovementInputFactory.build(),
          organization: buildOrganization()
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });
  });
});
