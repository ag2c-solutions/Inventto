import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Catalog, UpdateCatalogPayload } from '../../domain/entities';
import { CatalogService } from '../../domain/services';
import {
  catalogThemeConfigFactory,
  createCatalogPayloadFactory
} from '../../tests/factories/catalog.factory';

import {
  useCatalogCreateMutation,
  useCatalogRemoveMutation,
  useCatalogUpdateMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  CatalogService: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    checkSlugAvailability: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCatalogCreateMutation', () => {
    it('should create catalog with injected organizationId and invalidate "catalogs" query', async () => {
      const { organizationId: _organizationId, ...payload } =
        createCatalogPayloadFactory.build({
          themeConfig: catalogThemeConfigFactory.build()
        });

      vi.mocked(CatalogService.add).mockResolvedValue({
        id: 'new',
        ...payload
      } as unknown as Catalog);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCatalogCreateMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(CatalogService.add).toHaveBeenCalledWith({
        ...payload,
        organizationId: 'org-123'
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalogs'] });
    });

    it('should throw when there is no current organization', async () => {
      mockUseUser.mockReturnValue({ currentOrganization: null });

      const { result } = renderHook(() => useCatalogCreateMutation(), {
        wrapper
      });

      await expect(
        result.current.mutateAsync(
          createCatalogPayloadFactory.build({
            themeConfig: catalogThemeConfigFactory.build()
          })
        )
      ).rejects.toThrow('Organização não encontrada.');

      expect(CatalogService.add).not.toHaveBeenCalled();
    });
  });

  describe('useCatalogUpdateMutation', () => {
    it('should update catalog and invalidate both "catalogs" and specific detail queries', async () => {
      const payload: UpdateCatalogPayload = {
        id: '123',
        name: 'Updated Catalog'
      };

      vi.mocked(CatalogService.update).mockResolvedValue({
        ...payload,
        slug: 'updated-catalog'
      } as unknown as Catalog);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCatalogUpdateMutation(), {
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
