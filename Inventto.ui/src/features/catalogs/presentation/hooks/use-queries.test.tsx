import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import type { Catalog } from '../../domain/entities';
import { CatalogService } from '../../domain/services';

import {
  useCatalogByIDQuery,
  useCatalogCheckSlugAvailabilityQuery,
  useCatalogsQuery
} from './use-queries';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    getAll: vi.fn(),
    getOneById: vi.fn()
  }
}));

vi.mock('../../domain/services', () => ({
  CatalogService: {
    checkSlugAvailability: vi.fn()
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
      const mockCatalogs = [{ id: '1', name: 'Catalog A' }] as Catalog[];
      vi.mocked(CatalogApi.getAll).mockResolvedValue(mockCatalogs);

      const { result } = renderHook(() => useCatalogsQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogApi.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockCatalogs);
    });
  });

  describe('useCatalogByIDQuery', () => {
    it('should fetch a single catalog using CatalogApi.getOneById', async () => {
      const catalogId = '123';
      const mockCatalog = { id: catalogId, name: 'Catalog B' } as Catalog;
      vi.mocked(CatalogApi.getOneById).mockResolvedValue(mockCatalog);

      const { result } = renderHook(() => useCatalogByIDQuery(catalogId), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogApi.getOneById).toHaveBeenCalledWith(catalogId);
      expect(result.current.data).toEqual(mockCatalog);
    });
  });

  describe('useCatalogCheckSlugAvailabilityQuery', () => {
    it('should return true when slug is available', async () => {
      vi.mocked(CatalogService.checkSlugAvailability).mockResolvedValue(true);

      const { result } = renderHook(
        () => useCatalogCheckSlugAvailabilityQuery('meu-catalogo'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogService.checkSlugAvailability).toHaveBeenCalledWith(
        'meu-catalogo'
      );
      expect(result.current.data).toBe(true);
    });

    it('should return false when slug is unavailable', async () => {
      vi.mocked(CatalogService.checkSlugAvailability).mockResolvedValue(false);

      const { result } = renderHook(
        () => useCatalogCheckSlugAvailabilityQuery('slug-ocupado'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(false);
    });

    it('should not execute query when slug is empty', async () => {
      const { result } = renderHook(
        () => useCatalogCheckSlugAvailabilityQuery(''),
        { wrapper }
      );

      await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

      expect(CatalogService.checkSlugAvailability).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it('should call CatalogService.checkSlugAvailability with the correct slug', async () => {
      vi.mocked(CatalogService.checkSlugAvailability).mockResolvedValue(true);

      const { result } = renderHook(
        () => useCatalogCheckSlugAvailabilityQuery('catalogo-novo'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CatalogService.checkSlugAvailability).toHaveBeenCalledWith(
        'catalogo-novo'
      );
    });
  });
});
