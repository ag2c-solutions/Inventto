import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  StorefrontPrereqsMissingError,
  StorefrontSlugUnavailableError
} from '../../domain/entities';
import { storefrontDTOFactory } from '../../tests/factories/storefront.factory';

import { StorefrontApi } from './index';

const { mockSupabase, mockOverrideTypes, mockEq, mockRpc, queryBuilder } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockMaybeSingle = vi.fn();
    const mockRpc = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      overrideTypes: mockOverrideTypes,
      maybeSingle: mockMaybeSingle
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockMaybeSingle.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn((_table?: string) => queryBuilder),
        rpc: mockRpc
      },
      mockSelect,
      mockOrder,
      mockEq,
      mockOverrideTypes,
      mockMaybeSingle,
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

  describe('publishStorefront', () => {
    it('should call the publish_storefront RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(
        StorefrontApi.publishStorefront('s1')
      ).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('publish_storefront', {
        p_id: 's1'
      });
    });

    it('should map the STOREFRONT_PREREQS_MISSING marker to StorefrontPrereqsMissingError with the missing keys', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'STOREFRONT_PREREQS_MISSING:whatsapp,hours' }
      });

      await expect(StorefrontApi.publishStorefront('s1')).rejects.toSatisfy(
        (error: unknown) => {
          expect(error).toBeInstanceOf(StorefrontPrereqsMissingError);
          expect((error as StorefrontPrereqsMissingError).missing).toEqual([
            'whatsapp',
            'hours'
          ]);
          return true;
        }
      );
    });

    it('should throw handled error when the RPC fails for other reasons', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: {
          code: '42501',
          message: 'Acesso negado: apenas gerentes ou proprietários.',
          details: ''
        }
      });

      await expect(StorefrontApi.publishStorefront('s1')).rejects.toThrow(
        'Você não tem permissão para realizar alterações nas vitrines.'
      );
    });
  });

  describe('removeStorefront', () => {
    it('should call the remove_storefront RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(StorefrontApi.removeStorefront('s1')).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('remove_storefront', {
        p_id: 's1'
      });
    });

    it('should throw handled error when the RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(StorefrontApi.removeStorefront('s1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a vitrine.'
      );
    });
  });

  describe('getStorefront', () => {
    it('should query "storefronts" by id and return the mapped storefront', async () => {
      const dto = storefrontDTOFactory.build({ id: 's1' });
      mockOverrideTypes.mockResolvedValue({ data: dto, error: null });

      const result = await StorefrontApi.getStorefront('s1');

      expect(mockEq).toHaveBeenCalledWith('id', 's1');
      expect(result?.id).toBe('s1');
    });

    it('should return undefined when no row is found', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      const result = await StorefrontApi.getStorefront('missing');

      expect(result).toBeUndefined();
    });

    it('should throw handled error on database failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Erro DB', code: 'PGRST000' }
      });

      await expect(StorefrontApi.getStorefront('s1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a vitrine.'
      );
    });
  });

  describe('checkSlug', () => {
    it('should call the check_slug_available RPC and return its payload', async () => {
      mockRpc.mockResolvedValue({
        data: { available: true, reason: 'ok' },
        error: null
      });

      const result = await StorefrontApi.checkSlug('atelie-joana', 's1');

      expect(mockRpc).toHaveBeenCalledWith('check_slug_available', {
        p_slug: 'atelie-joana',
        p_storefront_id: 's1'
      });
      expect(result).toEqual({ available: true, reason: 'ok' });
    });

    it('should throw handled error when the RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(StorefrontApi.checkSlug('atelie-joana')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a vitrine.'
      );
    });
  });

  describe('createStorefront', () => {
    const payload = {
      organizationId: 'org-1',
      name: 'Vitrine Ateliê Joana',
      slug: 'atelie-joana'
    };

    it('should call the create_storefront RPC and return the new id', async () => {
      mockRpc.mockResolvedValue({ data: 'new-id', error: null });

      const result = await StorefrontApi.createStorefront(payload);

      expect(mockRpc).toHaveBeenCalledWith('create_storefront', {
        payload: {
          organizationId: 'org-1',
          name: 'Vitrine Ateliê Joana',
          catalogId: null,
          slug: 'atelie-joana',
          whatsapp: null,
          instagram: null,
          facebook: null,
          website: null,
          whatsappMessage: null
        }
      });
      expect(result).toBe('new-id');
    });

    it('should map the STOREFRONT_SLUG_UNAVAILABLE marker to StorefrontSlugUnavailableError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'STOREFRONT_SLUG_UNAVAILABLE:taken' }
      });

      await expect(StorefrontApi.createStorefront(payload)).rejects.toSatisfy(
        (error: unknown) => {
          expect(error).toBeInstanceOf(StorefrontSlugUnavailableError);
          expect((error as StorefrontSlugUnavailableError).reason).toBe(
            'taken'
          );
          return true;
        }
      );
    });
  });

  describe('updateStorefront', () => {
    const payload = {
      id: 's1',
      name: 'Vitrine Ateliê Joana',
      slug: 'atelie-joana'
    };

    it('should call the update_storefront RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(
        StorefrontApi.updateStorefront(payload)
      ).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('update_storefront', {
        p_id: 's1',
        payload: {
          name: 'Vitrine Ateliê Joana',
          catalogId: null,
          slug: 'atelie-joana',
          whatsapp: null,
          instagram: null,
          facebook: null,
          website: null,
          whatsappMessage: null
        }
      });
    });

    it('should map the STOREFRONT_SLUG_UNAVAILABLE marker to StorefrontSlugUnavailableError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'STOREFRONT_SLUG_UNAVAILABLE:reserved' }
      });

      await expect(StorefrontApi.updateStorefront(payload)).rejects.toSatisfy(
        (error: unknown) => {
          expect(error).toBeInstanceOf(StorefrontSlugUnavailableError);
          expect((error as StorefrontSlugUnavailableError).reason).toBe(
            'reserved'
          );
          return true;
        }
      );
    });
  });

  describe('getFeaturableProducts', () => {
    it('should merge catalog items with the featured flags from storefront_featured_products', async () => {
      const catalogItemsBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        overrideTypes: vi.fn().mockResolvedValue({
          data: [
            {
              product_id: 'p1',
              variant_id: null,
              product: {
                id: 'p1',
                name: 'Vestido Linho',
                sku: 'VL-01',
                product_images: [
                  { url: 'https://cdn.test/p1.png', is_primary: true }
                ]
              }
            },
            {
              product_id: 'p2',
              variant_id: null,
              product: {
                id: 'p2',
                name: 'Camisa Social',
                sku: 'CS-01',
                product_images: []
              }
            }
          ],
          error: null
        })
      };
      const featuredBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ product_id: 'p1' }],
          error: null
        })
      };
      mockSupabase.from.mockImplementation(((table: string) => {
        if (table === 'catalog_items') return catalogItemsBuilder;
        if (table === 'storefront_featured_products') return featuredBuilder;
        return queryBuilder;
      }) as typeof mockSupabase.from);

      const result = await StorefrontApi.getFeaturableProducts('s1', 'cat-1');

      expect(catalogItemsBuilder.eq).toHaveBeenCalledWith(
        'catalog_id',
        'cat-1'
      );
      expect(featuredBuilder.eq).toHaveBeenCalledWith('storefront_id', 's1');
      expect(result).toEqual([
        {
          productId: 'p1',
          variantId: undefined,
          name: 'Vestido Linho',
          sku: 'VL-01',
          imageUrl: 'https://cdn.test/p1.png',
          isFeatured: true
        },
        {
          productId: 'p2',
          variantId: undefined,
          name: 'Camisa Social',
          sku: 'CS-01',
          imageUrl: undefined,
          isFeatured: false
        }
      ]);
    });

    it('should dedupe products that appear multiple times (one row per variant)', async () => {
      const catalogItemsBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        overrideTypes: vi.fn().mockResolvedValue({
          data: [
            {
              product_id: 'p1',
              variant_id: 'v1',
              product: {
                id: 'p1',
                name: 'Camisa Social',
                sku: 'CS-M',
                product_images: []
              }
            },
            {
              product_id: 'p1',
              variant_id: 'v2',
              product: {
                id: 'p1',
                name: 'Camisa Social',
                sku: 'CS-G',
                product_images: []
              }
            }
          ],
          error: null
        })
      };
      const featuredBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabase.from.mockImplementation(((table: string) => {
        if (table === 'catalog_items') return catalogItemsBuilder;
        if (table === 'storefront_featured_products') return featuredBuilder;
        return queryBuilder;
      }) as typeof mockSupabase.from);

      const result = await StorefrontApi.getFeaturableProducts('s1', 'cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('p1');
    });

    it('should throw handled error when the catalog items query fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      const catalogItemsBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        overrideTypes: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      };
      const featuredBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabase.from.mockImplementation(((table: string) => {
        if (table === 'catalog_items') return catalogItemsBuilder;
        if (table === 'storefront_featured_products') return featuredBuilder;
        return queryBuilder;
      }) as typeof mockSupabase.from);

      await expect(
        StorefrontApi.getFeaturableProducts('s1', 'cat-1')
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar a vitrine.');
    });
  });

  describe('setFeature', () => {
    it('should call the set_storefront_feature RPC to feature a product', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(
        StorefrontApi.setFeature('s1', 'p1', undefined, true)
      ).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('set_storefront_feature', {
        p_storefront_id: 's1',
        p_product_id: 'p1',
        p_variant_id: null,
        p_on: true
      });
    });

    it('should call the set_storefront_feature RPC to unfeature a product', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await StorefrontApi.setFeature('s1', 'p1', 'v1', false);

      expect(mockRpc).toHaveBeenCalledWith('set_storefront_feature', {
        p_storefront_id: 's1',
        p_product_id: 'p1',
        p_variant_id: 'v1',
        p_on: false
      });
    });

    it('should throw handled error when the RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(
        StorefrontApi.setFeature('s1', 'p1', undefined, true)
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar a vitrine.');
    });
  });
});
