import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpdateCatalogPayload } from '../../domain/entities';
import { CatalogItemService, CatalogService } from '../../domain/services';
import { catalogFactory } from '../../tests/factories/catalog.factory';
import { catalogItemFactory } from '../../tests/factories/catalog-item.factory';

import {
  useAddCatalogItemsMutation,
  useCatalogRemoveMutation,
  useCreateCatalogMutation,
  useRemoveCatalogItemMutation,
  useUpdateCatalogItemPriceMutation,
  useUpdateCatalogMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  CatalogService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  },
  CatalogItemService: {
    addItems: vi.fn(),
    updateItemPrice: vi.fn(),
    removeItem: vi.fn(),
    restoreItem: vi.fn()
  }
}));

const { mockToast, mockUseUser, mockNavigate } = vi.hoisted(() => ({
  mockToast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn()
  }),
  mockUseUser: vi.fn(),
  mockNavigate: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: mockToast
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

  describe('useAddCatalogItemsMutation', () => {
    it('should add items and invalidate the catalog items and list queries', async () => {
      const items = catalogItemFactory.buildList(2);
      vi.mocked(CatalogItemService.addItems).mockResolvedValue(items);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAddCatalogItemsMutation('cat-1'), {
        wrapper
      });

      await result.current.mutateAsync(['p1', 'p2']);

      expect(CatalogItemService.addItems).toHaveBeenCalledWith({
        catalogId: 'cat-1',
        productIds: ['p1', 'p2']
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['catalogs', 'cat-1', 'items']
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalogs'] });
    });
  });

  describe('useUpdateCatalogItemPriceMutation', () => {
    it('should auto-save the price and invalidate the catalog items query without a success toast', async () => {
      const item = catalogItemFactory.build({ price: 50 });
      vi.mocked(CatalogItemService.updateItemPrice).mockResolvedValue(item);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useUpdateCatalogItemPriceMutation('cat-1'),
        { wrapper }
      );

      await result.current.mutateAsync({ id: item.id, price: 50 });

      expect(CatalogItemService.updateItemPrice).toHaveBeenCalledWith({
        id: item.id,
        price: 50
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['catalogs', 'cat-1', 'items']
      });
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });

  describe('useRemoveCatalogItemMutation', () => {
    it('should remove the item, invalidate queries and show a reversible toast', async () => {
      const item = catalogItemFactory.build();
      vi.mocked(CatalogItemService.removeItem).mockResolvedValue(undefined);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRemoveCatalogItemMutation(), {
        wrapper
      });

      await result.current.mutateAsync(item);

      expect(CatalogItemService.removeItem).toHaveBeenCalledWith(item.id);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['catalogs', item.catalogId, 'items']
      });
      expect(mockToast).toHaveBeenCalledWith(
        `${item.product.name} removido.`,
        expect.objectContaining({
          duration: 5000,
          action: expect.objectContaining({ label: 'Desfazer' })
        })
      );
    });

    it('should restore the item when "Desfazer" is triggered', async () => {
      const item = catalogItemFactory.build();
      vi.mocked(CatalogItemService.removeItem).mockResolvedValue(undefined);
      vi.mocked(CatalogItemService.restoreItem).mockResolvedValue(item);

      const { result } = renderHook(() => useRemoveCatalogItemMutation(), {
        wrapper
      });

      await result.current.mutateAsync(item);

      const [, options] = mockToast.mock.calls[0];
      await options.action.onClick();

      expect(CatalogItemService.restoreItem).toHaveBeenCalledWith(item);
    });
  });
});
