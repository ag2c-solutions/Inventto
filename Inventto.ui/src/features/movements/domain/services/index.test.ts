import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementApi } from '../../data/api';

import { MovementService } from './index';

vi.mock('../../data/api', () => ({
  MovementApi: {
    getAll: vi.fn(),
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

    it('should delegate to MovementApi.create with orgId extracted from organization', async () => {
      vi.mocked(MovementApi.create).mockResolvedValue('new-movement-id');

      const result = await MovementService.create({
        input: { type: 'entry', reason: 'Restock', items: [] },
        organization: mockOrganization
      });

      expect(MovementApi.create).toHaveBeenCalledWith({
        input: { type: 'entry', reason: 'Restock', items: [] },
        organizationId: 'org-1'
      });
      expect(result).toBe('new-movement-id');
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.create({
          input: { type: 'withdrawal', reason: 'Sale', items: [] },
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
          input: { type: 'withdrawal', reason: 'Sale', items: [] },
          organization: mockOrganization
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });
  });

  describe('getAll', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner' as const
    };

    it('should delegate to MovementApi.getAll with orgId extracted from organization', async () => {
      vi.mocked(MovementApi.getAll).mockResolvedValue([]);

      await MovementService.getAll({ organization: mockOrganization });

      expect(MovementApi.getAll).toHaveBeenCalledWith({
        organizationId: 'org-1',
        productId: undefined
      });
    });

    it('should pass productId filter when provided', async () => {
      vi.mocked(MovementApi.getAll).mockResolvedValue([]);

      await MovementService.getAll({
        organization: mockOrganization,
        productId: 'prod-123'
      });

      expect(MovementApi.getAll).toHaveBeenCalledWith({
        organizationId: 'org-1',
        productId: 'prod-123'
      });
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.getAll({ organization: null })
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(MovementApi.getAll).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by MovementApi.getAll', async () => {
      vi.mocked(MovementApi.getAll).mockRejectedValue(
        new Error('Erro de conexão. Verifique sua internet.')
      );

      await expect(
        MovementService.getAll({ organization: mockOrganization })
      ).rejects.toThrow('Erro de conexão. Verifique sua internet.');
    });
  });
});
