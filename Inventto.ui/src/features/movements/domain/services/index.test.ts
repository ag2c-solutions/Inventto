import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementApi } from '../../data/api';

import { MovementService } from './index';

vi.mock('../../data/api', () => ({
  MovementApi: {
    create: vi.fn()
  }
}));

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner' as const
    };

    const executedAt = new Date('2023-10-02T08:00:00Z');

    it('should delegate to MovementApi.create with orgId extracted from organization', async () => {
      vi.mocked(MovementApi.create).mockResolvedValue('new-movement-id');

      const result = await MovementService.create({
        input: { type: 'entry', reason: 'Compra', executedAt, items: [] },
        organization: mockOrganization
      });

      expect(MovementApi.create).toHaveBeenCalledWith({
        input: { type: 'entry', reason: 'Compra', executedAt, items: [] },
        organizationId: 'org-1'
      });
      expect(result).toBe('new-movement-id');
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.create({
          input: { type: 'withdrawal', reason: 'Venda', executedAt, items: [] },
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
          input: { type: 'withdrawal', reason: 'Venda', executedAt, items: [] },
          organization: mockOrganization
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });
  });
});
