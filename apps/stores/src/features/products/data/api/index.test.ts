import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  importCandidateDTOFactory,
  sourceVariantDTOFactory
} from '../../tests/factories/import-candidate.factory';
import {
  createProductFactory,
  productAttributeDTOFactory,
  productDTOFactory
} from '../../tests/factories/product.factory';

import { ProductAPI } from './index';

const { mockSupabase, mockEq, mockOrder, mockRpc, mockOverrideTypes } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();
    const mockSingle = vi.fn();
    const mockRpc = vi.fn();
    const mockOverrideTypes = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      overrideTypes: mockOverrideTypes
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder),
        rpc: mockRpc
      },
      mockSelect,
      mockEq,
      mockOrder,
      mockSingle,
      mockRpc,
      mockOverrideTypes
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('ProductAPI', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getAllForInternals', () => {
    it('should query "products" filtered by organizationId and return mapped domain objects', async () => {
      const dto = productDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({ data: [dto], error: null });

      const result = await ProductAPI.getAllForInternals(dto.organization_id);

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith(
        'organization_id',
        dto.organization_id
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dto.id);
    });

    it('should throw generic fallback error for unknown database failures', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'XXXXX', message: 'DB Error', details: '' }
      });

      await expect(ProductAPI.getAllForInternals('org-1')).rejects.toThrow(
        'Erro ao executar getAllForInternals: Ocorreu um erro inesperado.'
      );
    });
  });

  describe('getAllForSales', () => {
    it('should call the sanitized RPC (never the products table) and return mapped domain objects', async () => {
      const dto = productDTOFactory.build();
      mockRpc.mockResolvedValue({ data: [dto], error: null });

      const result = await ProductAPI.getAllForSales(dto.organization_id);

      expect(mockRpc).toHaveBeenCalledWith('get_products_for_sales', {
        p_org_id: dto.organization_id
      });
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dto.id);
    });

    it('should return an empty array when RPC returns no data', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const result = await ProductAPI.getAllForSales('org-1');

      expect(result).toEqual([]);
    });

    it('should throw handled error when RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: 'XXXXX', message: 'DB Error', details: '' }
      });

      await expect(ProductAPI.getAllForSales('org-1')).rejects.toThrow(
        'Erro ao executar getAllForSales: Ocorreu um erro inesperado.'
      );
    });
  });

  describe('getOneById', () => {
    it('should query by id and return the mapped domain object', async () => {
      const dto = productDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({ data: dto, error: null });

      const result = await ProductAPI.getOneById(dto.id);

      expect(mockEq).toHaveBeenCalledWith('id', dto.id);
      expect(result.id).toBe(dto.id);
    });

    it('should throw "não encontrado" for PGRST116', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found', details: '' }
      });

      await expect(ProductAPI.getOneById('missing')).rejects.toThrow(
        'Produto não encontrado.'
      );
    });

    it('should throw handled error for other database failures', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Permission denied', details: '' }
      });

      await expect(ProductAPI.getOneById('p-1')).rejects.toThrow(
        'Você não tem permissão para realizar alterações no catálogo de produtos.'
      );
    });
  });

  describe('getGlobalAttributes', () => {
    it('should query "organization_attributes" ordered by label and return mapped domain attributes', async () => {
      const attribute = productAttributeDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({ data: [attribute], error: null });

      const result = await ProductAPI.getGlobalAttributes();

      expect(mockSupabase.from).toHaveBeenCalledWith('organization_attributes');
      expect(mockOrder).toHaveBeenCalledWith('label', { ascending: true });
      expect(result).toEqual([
        {
          id: attribute.id,
          name: attribute.label,
          slug: attribute.slug,
          type: attribute.type,
          values: attribute.values
        }
      ]);
    });
  });

  describe('checkSkuAvailability', () => {
    it('should call the RPC and return the boolean result', async () => {
      mockRpc.mockResolvedValue({ data: true, error: null });

      const result = await ProductAPI.checkSkuAvailability({
        organizationId: 'org-1',
        sku: 'SKU-1'
      });

      expect(mockRpc).toHaveBeenCalledWith('check_product_sku_available', {
        p_organization_id: 'org-1',
        p_sku: 'SKU-1',
        p_exclude_product_id: null
      });
      expect(result).toBe(true);
    });
  });

  describe('add', () => {
    it('should call RPC "create_product" and resolve the created product via getOneById', async () => {
      const dto = productDTOFactory.build();
      mockRpc.mockResolvedValue({ data: dto.id, error: null });
      mockOverrideTypes.mockResolvedValue({ data: dto, error: null });

      const input = createProductFactory.build();
      const result = await ProductAPI.add(input);

      expect(mockRpc).toHaveBeenCalledWith(
        'create_product',
        expect.objectContaining({
          product_data: expect.objectContaining({
            organization_id: input.organizationId
          })
        })
      );
      expect(result.id).toBe(dto.id);
    });

    it('should throw handled error when RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate', details: '' }
      });

      await expect(
        ProductAPI.add(createProductFactory.build())
      ).rejects.toThrow(
        'Já existe um produto cadastrado com este Nome ou SKU.'
      );
    });
  });

  describe('update', () => {
    it('should call RPC "update_product" and resolve the updated product via getOneById', async () => {
      const dto = productDTOFactory.build();
      mockRpc.mockResolvedValue({ data: dto.id, error: null });
      mockOverrideTypes.mockResolvedValue({ data: dto, error: null });

      const input = { ...createProductFactory.build(), id: dto.id };
      const result = await ProductAPI.update(input);

      expect(mockRpc).toHaveBeenCalledWith(
        'update_product',
        expect.objectContaining({
          product_data: expect.objectContaining({ id: dto.id })
        })
      );
      expect(result.id).toBe(dto.id);
    });
  });

  describe('checkHasMovements', () => {
    it('should call the RPC and return the boolean result', async () => {
      mockRpc.mockResolvedValue({ data: false, error: null });

      const result = await ProductAPI.checkHasMovements('p-1');

      expect(mockRpc).toHaveBeenCalledWith('check_product_has_movements', {
        p_product_id: 'p-1'
      });
      expect(result).toBe(false);
    });
  });

  describe('getImportCandidates', () => {
    it('should call the RPC and map snake_case fields to camelCase', async () => {
      const candidate = importCandidateDTOFactory.build();
      mockRpc.mockResolvedValue({ data: [candidate], error: null });

      const result = await ProductAPI.getImportCandidates('org-2', 'org-1');

      expect(mockRpc).toHaveBeenCalledWith('get_import_candidates', {
        p_source_org_id: 'org-2',
        p_target_org_id: 'org-1'
      });
      expect(result[0]).toEqual({
        id: candidate.id,
        name: candidate.name,
        sku: candidate.sku,
        alreadyImported: candidate.already_imported,
        imageUrl: candidate.image_url ?? undefined,
        imagePublicId: candidate.image_public_id ?? undefined,
        variantCount: candidate.variant_count
      });
    });

    it('should return an empty array when RPC returns no data', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const result = await ProductAPI.getImportCandidates('org-2', 'org-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSourceProductVariants', () => {
    it('should call the RPC and map snake_case fields to camelCase', async () => {
      const variant = sourceVariantDTOFactory.build();
      mockRpc.mockResolvedValue({ data: [variant], error: null });

      const result = await ProductAPI.getSourceProductVariants(
        'org-2',
        'prod-1'
      );

      expect(mockRpc).toHaveBeenCalledWith('get_source_product_variants', {
        p_source_org_id: 'org-2',
        p_product_id: 'prod-1'
      });
      expect(result[0]).toEqual({
        id: variant.id,
        sku: variant.sku,
        options: variant.options,
        imageUrl: variant.image_url ?? undefined,
        imagePublicId: variant.image_public_id ?? undefined
      });
    });
  });

  describe('importProducts', () => {
    it('should call the RPC and return the imported count', async () => {
      mockRpc.mockResolvedValue({ data: 3, error: null });

      const result = await ProductAPI.importProducts({
        sourceOrganizationId: 'org-2',
        targetOrganizationId: 'org-1',
        productIds: ['p-1', 'p-2', 'p-3']
      });

      expect(mockRpc).toHaveBeenCalledWith('import_products', {
        p_source_org_id: 'org-2',
        p_target_org_id: 'org-1',
        p_product_ids: ['p-1', 'p-2', 'p-3']
      });
      expect(result).toBe(3);
    });
  });

  describe('setProductActive', () => {
    it('should call the RPC with the correct parameters', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await ProductAPI.setProductActive('p-1', 'org-1', false);

      expect(mockRpc).toHaveBeenCalledWith('set_product_active', {
        p_product_id: 'p-1',
        p_organization_id: 'org-1',
        p_is_active: false
      });
    });

    it('should throw handled error when RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Permission denied', details: '' }
      });

      await expect(
        ProductAPI.setProductActive('p-1', 'org-1', true)
      ).rejects.toThrow(
        'Você não tem permissão para realizar alterações no catálogo de produtos.'
      );
    });
  });
});
