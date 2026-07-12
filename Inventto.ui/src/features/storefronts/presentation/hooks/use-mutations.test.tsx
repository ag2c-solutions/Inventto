import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontService } from '../../domain/services';

import {
  usePublishStorefrontMutation,
  useRemoveStorefrontMutation,
  useSaveStorefrontMutation,
  useToggleFeatureMutation,
  useUnpublishStorefrontMutation
} from './use-mutations';

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

vi.mock('../../domain/services', () => ({
  StorefrontService: {
    unpublish: vi.fn(),
    publish: vi.fn(),
    remove: vi.fn(),
    save: vi.fn(),
    setFeature: vi.fn()
  }
}));

describe('storefronts mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  describe('useUnpublishStorefrontMutation', () => {
    it('should call StorefrontService.unpublish and invalidate the storefronts list', async () => {
      vi.mocked(StorefrontService.unpublish).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUnpublishStorefrontMutation(), {
        wrapper
      });

      result.current.mutate('s1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(StorefrontService.unpublish).toHaveBeenCalledWith('s1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts']
      });
    });
  });

  describe('usePublishStorefrontMutation', () => {
    it('should show the success toast and invalidate the list when published', async () => {
      vi.mocked(StorefrontService.publish).mockResolvedValue({
        published: true
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => usePublishStorefrontMutation(), {
        wrapper
      });

      result.current.mutate('s1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockToast.success).toHaveBeenCalledWith(
        'Vitrine no ar.',
        expect.objectContaining({ duration: 4000 })
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts']
      });
    });

    it('should not show a toast or invalidate the list when prereqs are missing', async () => {
      vi.mocked(StorefrontService.publish).mockResolvedValue({
        published: false,
        missingPrereqs: ['whatsapp']
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => usePublishStorefrontMutation(), {
        wrapper
      });

      let mutationResult: unknown;
      result.current.mutate('s1', {
        onSuccess: (data) => {
          mutationResult = data;
        }
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutationResult).toEqual({
        published: false,
        missingPrereqs: ['whatsapp']
      });
      expect(mockToast.success).not.toHaveBeenCalled();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useRemoveStorefrontMutation', () => {
    it('should call StorefrontService.remove, show the success toast and invalidate the list', async () => {
      vi.mocked(StorefrontService.remove).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRemoveStorefrontMutation(), {
        wrapper
      });

      result.current.mutate({
        id: 's1',
        confirmation: 'Vitrine Ateliê',
        expectedName: 'Vitrine Ateliê'
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(StorefrontService.remove).toHaveBeenCalledWith(
        's1',
        'Vitrine Ateliê',
        'Vitrine Ateliê'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts']
      });
    });
  });

  describe('useSaveStorefrontMutation', () => {
    it('should create with the injected organizationId, invalidate the list and navigate on create', async () => {
      vi.mocked(StorefrontService.save).mockResolvedValue('new-id');
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useSaveStorefrontMutation(), {
        wrapper
      });

      result.current.mutate({ values: { name: 'Vitrine Ateliê' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(StorefrontService.save).toHaveBeenCalledWith(
        { name: 'Vitrine Ateliê', organizationId: 'org-1' },
        undefined
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts']
      });
      expect(mockNavigate).toHaveBeenCalledWith('/storefronts/new-id');
    });

    it('should update without navigating when an id is given', async () => {
      vi.mocked(StorefrontService.save).mockResolvedValue('s1');
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useSaveStorefrontMutation(), {
        wrapper
      });

      result.current.mutate({
        id: 's1',
        values: { name: 'Vitrine Ateliê' }
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(StorefrontService.save).toHaveBeenCalledWith(
        { name: 'Vitrine Ateliê', organizationId: 'org-1' },
        's1'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts']
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('useToggleFeatureMutation', () => {
    it('should call StorefrontService.setFeature and invalidate the featured list', async () => {
      vi.mocked(StorefrontService.setFeature).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleFeatureMutation(), {
        wrapper
      });

      result.current.mutate({
        storefrontId: 's1',
        productId: 'p1',
        variantId: undefined,
        on: true,
        catalogProductIds: ['p1', 'p2']
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(StorefrontService.setFeature).toHaveBeenCalledWith(
        's1',
        'p1',
        undefined,
        true,
        ['p1', 'p2']
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['storefronts', 'featured', 's1']
      });
    });
  });
});
