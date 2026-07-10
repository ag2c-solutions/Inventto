import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvApi } from '../../data/api';
import { pdvProductFactory } from '../../tests/factories/pdv-product.factory';

import { usePdvCatalogQuery, usePdvProductsQuery } from './use-queries';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('../../data/api', () => ({
  PdvApi: {
    getPdvCatalog: vi.fn(),
    getPdvProducts: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('PDV Queries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('usePdvCatalogQuery', () => {
    it('should fetch the org PDV catalog using PdvApi.getPdvCatalog', async () => {
      vi.mocked(PdvApi.getPdvCatalog).mockResolvedValue({
        id: 'cat-1',
        name: 'Loja Física'
      });

      const { result } = renderHook(() => usePdvCatalogQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(PdvApi.getPdvCatalog).toHaveBeenCalledWith('org-1');
      expect(result.current.data).toEqual({ id: 'cat-1', name: 'Loja Física' });
    });

    it('should resolve to null (block state) when there is no catalog linked', async () => {
      vi.mocked(PdvApi.getPdvCatalog).mockResolvedValue(null);

      const { result } = renderHook(() => usePdvCatalogQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('should not fetch without a current organization', () => {
      mockUseUser.mockReturnValue({ currentOrganization: null });

      const { result } = renderHook(() => usePdvCatalogQuery(), { wrapper });

      expect(PdvApi.getPdvCatalog).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePdvProductsQuery', () => {
    it('should fetch products for the given catalog id', async () => {
      const products = pdvProductFactory.buildList(3);
      vi.mocked(PdvApi.getPdvProducts).mockResolvedValue(products);

      const { result } = renderHook(() => usePdvProductsQuery('cat-1'), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(PdvApi.getPdvProducts).toHaveBeenCalledWith('cat-1');
      expect(result.current.data).toEqual(products);
    });

    it('should not fetch when catalogId is undefined', () => {
      const { result } = renderHook(() => usePdvProductsQuery(undefined), {
        wrapper
      });

      expect(PdvApi.getPdvProducts).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
