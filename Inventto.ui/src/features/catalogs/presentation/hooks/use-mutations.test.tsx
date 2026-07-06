import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpdateCatalogPayload } from '../../domain/entities';
import { CatalogService } from '../../domain/services';
import { catalogFactory } from '../../tests/factories/catalog.factory';

import {
  useCatalogRemoveMutation,
  useCreateCatalogMutation,
  useUpdateCatalogMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  CatalogService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}));

const { mockUseUser, mockNavigate } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockNavigate: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Catalogs Mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-123' } });
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  describe('useCreateCatalogMutation', () => {
    it('should create catalog with injected organizationId, invalidate "catalogs" and navigate to curation', async () => {
      const catalog = catalogFactory.build();
      vi.mocked(CatalogService.create).mockResolvedValue(catalog);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateCatalogMutation(), {
        wrapper
      });

      await result.current.mutateAsync({ name: catalog.name });

      expect(CatalogService.create).toHaveBeenCalledWith({
        name: catalog.name,
        organizationId: 'org-123'
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalogs'] });
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          `/catalogos/${catalog.id}/produtos`
        )
      );
    });

    it('should throw when there is no current organization', async () => {
      mockUseUser.mockReturnValue({ currentOrganization: null });

      const { result } = renderHook(() => useCreateCatalogMutation(), {
        wrapper
      });

      await expect(
        result.current.mutateAsync({ name: 'Catálogo' })
      ).rejects.toThrow('Organização não encontrada.');

      expect(CatalogService.create).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateCatalogMutation', () => {
    it('should update catalog and invalidate both "catalogs" and specific detail queries', async () => {
      const payload: UpdateCatalogPayload = {
        id: '123',
        name: 'Updated Catalog'
      };

      vi.mocked(CatalogService.update).mockResolvedValue(
        catalogFactory.build(payload)
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCatalogMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(CatalogService.update).toHaveBeenCalledWith(payload);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalogs'] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['catalogs', 'detail', '123']
      });
    });
  });

  describe('useCatalogRemoveMutation', () => {
    it('should remove catalog and invalidate "catalogs" query', async () => {
      const catalogId = '123';
      vi.mocked(CatalogService.remove).mockResolvedValue(undefined);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCatalogRemoveMutation(), {
        wrapper
      });

      await result.current.mutateAsync(catalogId);

      expect(CatalogService.remove).toHaveBeenCalledWith(catalogId);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalogs'] });
    });
  });
});
