import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryApi } from '../../data/api';
import type { Category } from '../../domain/entities';

import { useCategoriesQuery } from './use-queries';

vi.mock('../../data/api', () => ({
  CategoryApi: {
    getAll: vi.fn()
  }
}));

describe('useCategoriesQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch categories using CategoryApi.getAll', async () => {
    const mockCategories: Category[] = [
      { id: '1', name: 'Roupas' },
      { id: '2', name: 'Eletrônicos' }
    ];

    vi.mocked(CategoryApi.getAll).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(CategoryApi.getAll).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockCategories);
  });

  it('should expose error state when fetch fails', async () => {
    vi.mocked(CategoryApi.getAll).mockRejectedValue(
      new Error('Não foi possível realizar a operação.')
    );

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(
      'Não foi possível realizar a operação.'
    );
  });
});
