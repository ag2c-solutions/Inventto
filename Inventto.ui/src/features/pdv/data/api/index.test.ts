import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pdvCatalogItemDTOFactory } from '../../tests/factories/pdv-product.factory';

import { PdvApi } from './index';

const { mockSupabase, mockEq, mockOverrideTypes, mockRpc, queryBuilder } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockSingle = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockRpc = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      overrideTypes: mockOverrideTypes
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);

    return {
      mockSupabase: { from: vi.fn(() => queryBuilder), rpc: mockRpc },
      mockSelect,
      mockEq,
      mockSingle,
      mockOverrideTypes,
      mockRpc,
      queryBuilder
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('PdvApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => queryBuilder);
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getPdvCatalog', () => {
    it('should return null when the organization has no catalog linked', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: { pdv_catalog_id: null, catalog: null },
        error: null
      });

      const result = await PdvApi.getPdvCatalog('org-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
      expect(mockEq).toHaveBeenCalledWith('id', 'org-1');
      expect(result).toBeNull();
    });

    it('should return the mapped catalog when linked', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: {
          pdv_catalog_id: 'cat-1',
          catalog: { id: 'cat-1', name: 'Loja Física' }
        },
        error: null
      });

      const result = await PdvApi.getPdvCatalog('org-1');

      expect(result).toEqual({ id: 'cat-1', name: 'Loja Física' });
    });

    it('should throw a normalized error via handlePdvError', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'boom', code: 'XXXXX', details: '', hint: '' }
      });

      await expect(PdvApi.getPdvCatalog('org-1')).rejects.toThrow();
    });
  });

  describe('getPdvProducts', () => {
    it('should query catalog_items and return mapped PdvProducts', async () => {
      const dto = pdvCatalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({ data: [dto], error: null });

      const result = await PdvApi.getPdvProducts('cat-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('catalog_items');
      expect(mockEq).toHaveBeenCalledWith('catalog_id', 'cat-1');
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(dto.product_id);
    });

    it('should throw a normalized error via handlePdvError', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'boom', code: 'XXXXX', details: '', hint: '' }
      });

      await expect(PdvApi.getPdvProducts('cat-1')).rejects.toThrow();
    });
  });

  describe('setPdvCatalog', () => {
    it('should call the set_pdv_catalog RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await PdvApi.setPdvCatalog('cat-1');

      expect(mockRpc).toHaveBeenCalledWith('set_pdv_catalog', {
        p_catalog_id: 'cat-1'
      });
    });

    it('should throw a normalized error via handlePdvError', async () => {
      mockRpc.mockResolvedValue({
        error: {
          message: 'Acesso negado',
          code: '42501',
          details: '',
          hint: ''
        }
      });

      await expect(PdvApi.setPdvCatalog('cat-1')).rejects.toThrow(
        'Você não tem permissão para realizar esta ação.'
      );
    });
  });
});
