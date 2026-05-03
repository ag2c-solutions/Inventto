import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovementDTO } from '../dtos';

import { MovementApi } from './index';

const { mockSupabase, mockOrder, mockEq, mockRpc, mockOverrideTypes } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockRpc = vi.fn();
    const mockOverrideTypes = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      overrideTypes: mockOverrideTypes
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder),
        rpc: mockRpc
      },
      mockSelect,
      mockOrder,
      mockEq,
      mockRpc,
      mockOverrideTypes
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

const mockMovementDTO: MovementDTO = {
  id: 'mov-1',
  organization_id: 'org-1',
  user_id: 'user-1',
  type: 'entry',
  reason: 'Restock',
  document_number: null,
  order_id: null,
  created_at: '2023-01-01T00:00:00Z',
  profiles: { full_name: 'John Doe', avatar_url: null },
  movement_items: []
};

describe('MovementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  // ─── QUERIES ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should query "movements" filtered by organizationId and return mapped domain objects', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [mockMovementDTO],
        error: null
      });

      const result = await MovementApi.getAll({ organizationId: 'org-1' });

      expect(mockSupabase.from).toHaveBeenCalledWith('movements');
      expect(mockEq).toHaveBeenCalledWith('organization_id', 'org-1');
      expect(mockOrder).toHaveBeenCalledWith('created_at', {
        ascending: false
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('mov-1');
      expect(result[0].type).toBe('entry');
    });

    it('should apply productId filter when provided', async () => {
      mockOverrideTypes.mockResolvedValue({ data: [], error: null });

      await MovementApi.getAll({
        organizationId: 'org-1',
        productId: 'prod-123'
      });

      expect(mockEq).toHaveBeenCalledWith(
        'movement_items.product_id',
        'prod-123'
      );
    });

    it('should throw handled error for permission denied (42501)', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Permission denied', details: '' }
      });

      await expect(
        MovementApi.getAll({ organizationId: 'org-1' })
      ).rejects.toThrow(
        'Você não tem permissão para realizar movimentações de estoque.'
      );
    });

    it('should throw generic error for unknown database failures', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'XXXXX', message: 'DB Error', details: '' }
      });

      await expect(
        MovementApi.getAll({ organizationId: 'org-1' })
      ).rejects.toThrow('DB Error');
    });
  });

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call RPC "create_stock_movement" with correctly mapped payload', async () => {
      mockRpc.mockResolvedValue({ data: 'new-movement-id', error: null });

      const result = await MovementApi.create({
        organizationId: 'org-1',
        input: {
          type: 'entry',
          reason: 'Restock',
          items: [
            {
              productId: 'prod-1',
              quantity: 5,
              unitCost: 10,
              unitPrice: 20
            }
          ]
        }
      });

      expect(mockRpc).toHaveBeenCalledWith(
        'create_stock_movement',
        expect.objectContaining({
          movement_data: expect.objectContaining({
            organization_id: 'org-1',
            type: 'entry',
            reason: 'Restock'
          })
        })
      );
      expect(result).toBe('new-movement-id');
    });

    it('should throw "estoque negativo" error for P0001 with insufficient stock message', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: {
          code: 'P0001',
          message: 'insufficient stock available',
          details: ''
        }
      });

      await expect(
        MovementApi.create({
          organizationId: 'org-1',
          input: { type: 'withdrawal', reason: 'Sale', items: [] }
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });

    it('should throw handled error when RPC fails with other codes', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Permission denied', details: '' }
      });

      await expect(
        MovementApi.create({
          organizationId: 'org-1',
          input: { type: 'entry', reason: 'Test', items: [] }
        })
      ).rejects.toThrow(
        'Você não tem permissão para realizar movimentações de estoque.'
      );
    });
  });
});
