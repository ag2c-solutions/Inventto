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
    it('should delegate to MovementApi.create with correct payload', async () => {
      vi.mocked(MovementApi.create).mockResolvedValue('new-movement-id');

      const payload = {
        input: {
          type: 'entry' as const,
          reason: 'Restock',
          items: []
        },
        organizationId: 'org-1'
      };

      const result = await MovementService.create(payload);

      expect(MovementApi.create).toHaveBeenCalledWith(payload);
      expect(result).toBe('new-movement-id');
    });

    it('should propagate errors thrown by MovementApi.create', async () => {
      vi.mocked(MovementApi.create).mockRejectedValue(
        new Error('A operação resultaria em estoque negativo (não permitido).')
      );

      await expect(
        MovementService.create({
          input: { type: 'withdrawal', reason: 'Sale', items: [] },
          organizationId: 'org-1'
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });
  });
});
