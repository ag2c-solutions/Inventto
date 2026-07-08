import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import { catalogFactory } from '../../tests/factories/catalog.factory';
import { catalogItemFactory } from '../../tests/factories/catalog-item.factory';

import {
  useAvailableProductsQuery,
  useCatalogByIDQuery,
  useCatalogItemsQuery,
  useCatalogsQuery
} from './use-queries';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    getAll: vi.fn(),
    getOneById: vi.fn(),
    getItems: vi.fn()
  }
}));

const { mockUseProductsQuery } = vi.hoisted(() => ({
  mockUseProductsQuery: vi.fn()
}));

vi.mock('@/features/products', () => ({
  useProductsQuery: mockUseProductsQuery
}));

describe('Catalogs Queries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCatalogsQuery', () => {
    it('should fetch catalogs using CatalogApi.getAll', async () => {
      const mockCatalogs = catalogFactory.buildList(2);
      vi.mocked(CatalogApi.getAll).mockResolvedValue(mockCatalogs);

      const { result } = renderHook(() => useCatalogsQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogApi.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockCatalogs);
    });
  });

  describe('useCatalogByIDQuery', () => {
    it('should fetch a single catalog using CatalogApi.getOneById', async () => {
      const mockCatalog = catalogFactory.build();
      vi.mocked(CatalogApi.getOneById).mockResolvedValue(mockCatalog);

      const { result } = renderHook(() => useCatalogByIDQuery(mockCatalog.id), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogApi.getOneById).toHaveBeenCalledWith(mockCatalog.id);
      expect(result.current.data).toEqual(mockCatalog);
    });

    it('should not execute the query when id is empty', async () => {
      const { result } = renderHook(() => useCatalogByIDQuery(''), {
        wrapper
      });

      await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

      expect(CatalogApi.getOneById).not.toHaveBeenCalled();
    });
  });

  describe('useCatalogItemsQuery', () => {
    it('should fetch catalog items using CatalogApi.getItems', async () => {
      const items = catalogItemFactory.buildList(2);
      vi.mocked(CatalogApi.getItems).mockResolvedValue(items);

      const { result } = renderHook(() => useCatalogItemsQuery('cat-1'), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogApi.getItems).toHaveBeenCalledWith('cat-1');
      expect(result.current.data).toEqual(items);
    });

    it('should not execute the query when catalogId is empty', async () => {
      const { result } = renderHook(() => useCatalogItemsQuery(''), {
        wrapper
      });

      await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

      expect(CatalogApi.getItems).not.toHaveBeenCalled();
    });
  });

  describe('useAvailableProductsQuery', () => {
    const products = [
      {
        id: 'p1',
        name: 'Cadeira',
        sku: 'CAD-1',
        allImages: [{ url: 'cadeira.jpg', isPrimary: true }],
        hasVariants: false,
        variants: [],
        costPrice: 45.5
      },
      {
        id: 'p2',
        name: 'Mesa',
        sku: 'MES-1',
        allImages: [],
        hasVariants: false,
        variants: [],
        costPrice: undefined
      }
    ];

    beforeEach(() => {
      mockUseProductsQuery.mockReturnValue({
        data: products,
        isLoading: false
      });
    });

    it('should flag products already present in the catalog as alreadyAdded', async () => {
      const items = catalogItemFactory.buildList(1, { productId: 'p1' });
      vi.mocked(CatalogApi.getItems).mockResolvedValue(items);

      const { result } = renderHook(() => useAvailableProductsQuery('cat-1'), {
        wrapper
      });

      await waitFor(() =>
        expect(result.current.data?.[0]?.alreadyAdded).toBe(true)
      );

      expect(result.current.data).toEqual([
        {
          id: 'p1',
          name: 'Cadeira',
          sku: 'CAD-1',
          imageUrl: 'cadeira.jpg',
          alreadyAdded: true,
          hasVariants: false,
          variants: [],
          costPrice: 4550
        },
        {
          id: 'p2',
          name: 'Mesa',
          sku: 'MES-1',
          imageUrl: undefined,
          alreadyAdded: false,
          hasVariants: false,
          variants: [],
          costPrice: undefined
        }
      ]);
    });

    it('should convert costPrice from reais (Products) to cents (Smart Default)', async () => {
      vi.mocked(CatalogApi.getItems).mockResolvedValue([]);

      const { result } = renderHook(() => useAvailableProductsQuery('cat-1'), {
        wrapper
      });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.[0]?.costPrice).toBe(4550);
      expect(result.current.data?.[1]?.costPrice).toBeUndefined();
    });

    it('should be loading while either products or items are loading', () => {
      mockUseProductsQuery.mockReturnValue({
        data: undefined,
        isLoading: true
      });
      vi.mocked(CatalogApi.getItems).mockResolvedValue([]);

      const { result } = renderHook(() => useAvailableProductsQuery('cat-1'), {
        wrapper
      });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
