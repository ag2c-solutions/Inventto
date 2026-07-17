import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryService } from '../../domain/services';
import { categoryFactory } from '../../tests/factories/category.factory';

import { useCategoryAddMutation } from './use-mutations';

vi.mock('../../domain/services', () => ({
  CategoryService: {
    add: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: vi.fn(() => ({
    currentOrganization: { id: 'org-1' }
  }))
}));

describe('useCategoryAddMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call CategoryService.add with name and organizationId', async () => {
    const createdCategory = categoryFactory.build();
    vi.mocked(CategoryService.add).mockResolvedValue(createdCategory);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCategoryAddMutation(), { wrapper });

    await result.current.mutateAsync(createdCategory.name);

    expect(CategoryService.add).toHaveBeenCalledWith({
      name: createdCategory.name,
      organizationId: 'org-1'
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['categories']
    });
  });

  it('should call CategoryService.add with empty organizationId when no organization, and service throws', async () => {
    const { useUser } = await import('@/features/users');
    vi.mocked(useUser).mockReturnValue({
      currentOrganization: null
    } as unknown as ReturnType<typeof useUser>);

    vi.mocked(CategoryService.add).mockRejectedValue(
      new Error('Nenhuma organização selecionada.')
    );

    const { result } = renderHook(() => useCategoryAddMutation(), { wrapper });

    await expect(result.current.mutateAsync('Erro')).rejects.toThrow(
      'Nenhuma organização selecionada.'
    );

    expect(CategoryService.add).toHaveBeenCalledWith({
      name: 'Erro',
      organizationId: ''
    });
  });
});
