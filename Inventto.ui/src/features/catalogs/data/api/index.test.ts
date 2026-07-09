import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogHasLinkedChannelsError } from '../../domain/entities';
import {
  catalogDTOFactory,
  createCatalogPayloadFactory
} from '../../tests/factories/catalog.factory';
import { catalogItemDTOFactory } from '../../tests/factories/catalog-item.factory';

import { CatalogApi } from './index';

const {
  mockSupabase,
  mockSelect,
  mockOverrideTypes,
  mockEq,
  mockRpc,
  queryBuilder
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockOverrideTypes = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockRpc = vi.fn();

  const queryBuilder = {
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    single: mockSingle,
    overrideTypes: mockOverrideTypes,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete
  };

  mockSelect.mockReturnValue(queryBuilder);
  mockOrder.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder);
  mockSingle.mockReturnValue(queryBuilder);
  mockInsert.mockReturnValue(queryBuilder);
  mockUpdate.mockReturnValue(queryBuilder);
  mockDelete.mockReturnValue(queryBuilder);

  return {
    mockSupabase: { from: vi.fn(() => queryBuilder), rpc: mockRpc },
    mockSelect,
    mockOrder,
    mockEq,
    mockSingle,
    mockOverrideTypes,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockRpc,
    queryBuilder
  };
});

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

const mockCatalogDTO = catalogDTOFactory.build();

describe('CatalogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => queryBuilder);
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getAll', () => {
    it('should query "catalogs" and return mapped domain objects', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [mockCatalogDTO],
        error: null
      });

      const result = await CatalogApi.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockCatalogDTO.id);
      expect(result[0].name).toBe(mockCatalogDTO.name);
    });

    it('should throw handled error on database failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Erro DB', code: 'PGRST000' }
      });

      await expect(CatalogApi.getAll()).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o catálogo.'
      );
    });
  });

  describe('getOneById', () => {
    it('should filter by id and return the mapped catalog', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCatalogDTO,
        error: null
      });

      const result = await CatalogApi.getOneById(mockCatalogDTO.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockEq).toHaveBeenCalledWith('id', mockCatalogDTO.id);
      expect(result.id).toBe(mockCatalogDTO.id);
    });

    it('should throw "Catálogo não encontrado" for PGRST116', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' }
      });

      await expect(CatalogApi.getOneById('inexistente')).rejects.toThrow(
        'Catálogo não encontrado.'
      );
    });

    it('should throw handled error for generic database errors', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database crash' }
      });

      await expect(CatalogApi.getOneById('cat-1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o catálogo.'
      );
    });
  });

  describe('add', () => {
    it('should insert only the channel-agnostic fields and return the created catalog', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCatalogDTO,
        error: null
      });

      const payload = createCatalogPayloadFactory.build();

      const result = await CatalogApi.add(payload);
      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toEqual({
        organization_id: payload.organizationId,
        name: payload.name
      });
      expect(result.id).toBe(mockCatalogDTO.id);
    });

    it('should throw handled error on duplicate key violation (23505)', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value', details: '' }
      });

      await expect(
        CatalogApi.add(createCatalogPayloadFactory.build())
      ).rejects.toThrow('Já existe um catálogo com estes dados.');
    });

    it('should throw handled error on generic insertion failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Insert failed' }
      });

      await expect(
        CatalogApi.add(createCatalogPayloadFactory.build())
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar o catálogo.');
    });
  });

  describe('update', () => {
    it('should patch only the provided fields', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: { ...mockCatalogDTO, name: 'Editado' },
        error: null
      });

      const result = await CatalogApi.update({
        id: mockCatalogDTO.id,
        name: 'Editado'
      });
      const updateCall = vi.mocked(mockSupabase.from().update).mock.calls[0][0];

      expect(updateCall).toEqual({ name: 'Editado' });
      expect(result.name).toBe('Editado');
    });

    it('should throw handled error on update failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Update failed' }
      });

      await expect(
        CatalogApi.update({ id: mockCatalogDTO.id, name: 'Fail' })
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar o catálogo.');
    });
  });

  describe('remove', () => {
    it('should remove the catalog through the delete_catalog RPC (RN061 server guard)', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(CatalogApi.remove('cat-1')).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('delete_catalog', {
        p_catalog_id: 'cat-1'
      });
    });

    it('should map the linked-channels marker to CatalogHasLinkedChannelsError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'CATALOG_HAS_LINKED_CHANNELS' }
      });

      await expect(CatalogApi.remove('cat-1')).rejects.toBeInstanceOf(
        CatalogHasLinkedChannelsError
      );
    });

    it('should throw handled error when the RPC fails for other reasons', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(CatalogApi.remove('cat-1')).rejects.toThrow(
        'Ocorreu um erro inesperado'
      );
    });
  });

  describe('getItems', () => {
    it('should query "catalog_items" filtered by catalog_id and return mapped items', async () => {
      const mockItemDTO = catalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: [mockItemDTO],
        error: null
      });

      const result = await CatalogApi.getItems(mockItemDTO.catalog_id);

      expect(mockSupabase.from).toHaveBeenCalledWith('catalog_items');
      expect(mockEq).toHaveBeenCalledWith('catalog_id', mockItemDTO.catalog_id);
      expect(result[0].id).toBe(mockItemDTO.id);
    });
  });

  describe('addItems', () => {
    it('should insert items converting prices from cents (domain) to reais (DB) and preserving variant ids', async () => {
      const mockItemDTO = catalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: [mockItemDTO],
        error: null
      });

      await CatalogApi.addItems({
        catalogId: 'cat-1',
        items: [
          { productId: 'p1', price: 8990 },
          { productId: 'p2', price: 9990, variantId: 'v1' }
        ]
      });
      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toEqual([
        {
          catalog_id: 'cat-1',
          product_id: 'p1',
          variant_id: null,
          price: 89.9,
          original_price: null
        },
        {
          catalog_id: 'cat-1',
          product_id: 'p2',
          variant_id: 'v1',
          price: 99.9,
          original_price: null
        }
      ]);
    });
  });

  describe('updateItemPrice', () => {
    it('should update price and original_price converting cents (domain) to reais (DB)', async () => {
      const mockItemDTO = catalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: mockItemDTO,
        error: null
      });

      await CatalogApi.updateItemPrice({
        id: mockItemDTO.id,
        price: 9990,
        originalPrice: 12990
      });
      const updateCall = vi.mocked(mockSupabase.from().update).mock.calls[0][0];

      expect(updateCall).toEqual({ price: 99.9, original_price: 129.9 });
    });

    it('should send null for original_price when not provided', async () => {
      const mockItemDTO = catalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: mockItemDTO,
        error: null
      });

      await CatalogApi.updateItemPrice({ id: mockItemDTO.id, price: 5000 });
      const updateCall = vi.mocked(mockSupabase.from().update).mock.calls[0][0];

      expect(updateCall).toEqual({ price: 50, original_price: null });
    });
  });

  describe('removeItem', () => {
    it('should delete the catalog item by id', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as unknown as ReturnType<typeof mockSupabase.from>);

      await expect(CatalogApi.removeItem('item-1')).resolves.not.toThrow();
    });
  });

  describe('restoreItem', () => {
    it('should re-insert the item converting price/original_price from cents (domain) to reais (DB)', async () => {
      const mockItemDTO = catalogItemDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: mockItemDTO,
        error: null
      });

      await CatalogApi.restoreItem({
        id: 'old-id',
        catalogId: 'cat-1',
        productId: 'p1',
        price: 5000,
        originalPrice: 7000,
        product: { id: 'p1', name: 'Produto', sku: 'SKU-1' }
      });
      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toEqual({
        catalog_id: 'cat-1',
        product_id: 'p1',
        variant_id: null,
        price: 50,
        original_price: 70
      });
    });
  });
});
