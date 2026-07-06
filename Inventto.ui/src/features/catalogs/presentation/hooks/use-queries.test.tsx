import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import { catalogFactory } from '../../tests/factories/catalog.factory';

import { useCatalogByIDQuery, useCatalogsQuery } from './use-queries';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    getAll: vi.fn(),
    getOneById: vi.fn()
  }
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
});
