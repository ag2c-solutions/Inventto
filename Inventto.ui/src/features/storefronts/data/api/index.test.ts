import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontDTOFactory } from '../../tests/factories/storefront.factory';

import { StorefrontApi } from './index';

const { mockSupabase, mockOverrideTypes, mockEq, mockRpc, queryBuilder } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockRpc = vi.fn();

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
      mockSupabase: { from: vi.fn(() => queryBuilder), rpc: mockRpc },
      mockSelect,
      mockOrder,
      mockEq,
      mockOverrideTypes,
      mockRpc,
      queryBuilder
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('StorefrontApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => queryBuilder);
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getStorefronts', () => {
    it('should query "storefronts" filtered by organization and return mapped storefronts with catalog name', async () => {
      const dto = storefrontDTOFactory.build({
        organization_id: 'org-1',
        catalog: { id: 'cat-1', name: 'Coleção Verão 2026' }
      });
      mockOverrideTypes.mockResolvedValue({ data: [dto], error: null });

      const result = await StorefrontApi.getStorefronts('org-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('storefronts');
      expect(mockEq).toHaveBeenCalledWith('organization_id', 'org-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dto.id);
      expect(result[0].catalogName).toBe('Coleção Verão 2026');
    });

    it('should throw handled error on database failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Erro DB', code: 'PGRST000' }
      });

      await expect(StorefrontApi.getStorefronts('org-1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a vitrine.'
      );
    });
  });

  describe('setPublished', () => {
    it('should call the set_storefront_published RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(
        StorefrontApi.setPublished('s1', false)
      ).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('set_storefront_published', {
        p_id: 's1',
        p_published: false
      });
    });

    it('should throw handled error when the RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(StorefrontApi.setPublished('s1', true)).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a vitrine.'
      );
    });
  });
});
