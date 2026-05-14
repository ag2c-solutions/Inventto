import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '../../domain/entities';
import { CategoryService } from '../../domain/services';

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
    const createdCategory: Category = { id: 'c1', name: 'Acessórios' };
    vi.mocked(CategoryService.add).mockResolvedValue(createdCategory);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCategoryAddMutation(), { wrapper });

    await result.current.mutateAsync('Acessórios');

    expect(CategoryService.add).toHaveBeenCalledWith({
      name: 'Acessórios',
      organizationId: 'org-1'
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['categories']
    });
  });

  it('should throw when no organization is selected', async () => {
    const { useUser } = await import('@/features/users');
    vi.mocked(useUser).mockReturnValue({
      currentOrganization: null
    } as unknown as ReturnType<typeof useUser>);

    const { result } = renderHook(() => useCategoryAddMutation(), { wrapper });

    await expect(result.current.mutateAsync('Erro')).rejects.toThrow(
      'Nenhuma organização selecionada.'
    );
  });
});
