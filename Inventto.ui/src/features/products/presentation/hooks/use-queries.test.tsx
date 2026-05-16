import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductService } from '../../domain/services';

import { useProductByIDQuery, useProductsQuery } from './use-queries';

const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('../../domain/services', () => ({
  ProductService: {
    getAll: vi.fn(),
    getOneById: vi.fn()
  }
}));

vi.mock('../../data/api', () => ({
  ProductAPI: {
    getGlobalAttributes: vi.fn()
  }
}));

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({
    currentOrganization: { id: 'org-1' },
    role: 'manager'
  });
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
});

describe('useProductsQuery', () => {
  it('deve chamar ProductService.getAll com organization e role', async () => {
    vi.mocked(ProductService.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useProductsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ProductService.getAll).toHaveBeenCalledWith(
      { id: 'org-1' },
      'manager'
    );
  });

  it('deve ter fetchStatus idle quando currentOrganization é null', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: null as unknown as { id: string },
      role: 'manager'
    });
    const { result } = renderHook(() => useProductsQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getAll).not.toHaveBeenCalled();
  });

  it('deve ter fetchStatus idle quando role é undefined', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1' },
      role: undefined as unknown as string
    });
    const { result } = renderHook(() => useProductsQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getAll).not.toHaveBeenCalled();
  });
});

describe('useProductByIDQuery', () => {
  it('deve chamar ProductService.getOneById com o productId fornecido', async () => {
    vi.mocked(ProductService.getOneById).mockResolvedValue({} as never);
    const { result } = renderHook(() => useProductByIDQuery('prod-1'), {
      wrapper
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProductService.getOneById).toHaveBeenCalledWith('prod-1');
  });

  it('deve ter fetchStatus idle quando productId é undefined', () => {
    const { result } = renderHook(() => useProductByIDQuery(undefined), {
      wrapper
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getOneById).not.toHaveBeenCalled();
  });
});
