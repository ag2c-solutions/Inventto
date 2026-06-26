import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseUser = vi.fn(() => ({
  currentOrganization: { id: 'org-1' }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('../../domain/services', () => ({
  ProductService: {
    add: vi.fn(),
    update: vi.fn(),
    import: vi.fn()
  }
}));

vi.mock('../../data/api', () => ({
  ProductAPI: {
    getGlobalAttributes: vi.fn()
  }
}));

import { ProductService } from '../../domain/services';

import {
  useCreateProductMutation,
  useImportProductsMutation,
  useUpdateProductMutation
} from './use-mutations';

describe('useCreateProductMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar ProductService.add com o produto e o currentOrganization', async () => {
    const mockProduct = { id: 'p-1', name: 'Produto A' } as never;
    vi.mocked(ProductService.add).mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useCreateProductMutation(), {
      wrapper
    });

    const payload = { name: 'Produto A' } as never;

    await result.current.mutateAsync(payload);

    expect(ProductService.add).toHaveBeenCalledWith(payload, { id: 'org-1' });
  });

  it('deve invalidar PRODUCTS_KEYS.all no onSuccess', async () => {
    vi.mocked(ProductService.add).mockResolvedValue({ id: 'p-1' } as never);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateProductMutation(), {
      wrapper
    });
    await result.current.mutateAsync({ name: 'Produto A' } as never);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });
});

describe('useUpdateProductMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar ProductService.update com o produto e o currentOrganization', async () => {
    const mockProduct = { id: 'p-1', name: 'Produto Atualizado' } as never;
    vi.mocked(ProductService.update).mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useUpdateProductMutation(), {
      wrapper
    });

    const payload = { id: 'p-1', name: 'Produto Atualizado' } as never;

    await result.current.mutateAsync(payload);

    expect(ProductService.update).toHaveBeenCalledWith(payload, {
      id: 'org-1'
    });
  });

  it('deve invalidar PRODUCTS_KEYS.all e PRODUCTS_KEYS.detail(product.id) no onSuccess', async () => {
    vi.mocked(ProductService.update).mockResolvedValue({ id: 'p-1' } as never);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateProductMutation(), {
      wrapper
    });
    await result.current.mutateAsync({
      id: 'p-1',
      name: 'Produto Atualizado'
    } as never);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['products', 'detail', 'p-1']
    });
  });
});

describe('useImportProductsMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar ProductService.import com origem, ids e currentOrganization', async () => {
    vi.mocked(ProductService.import).mockResolvedValue(2);

    const { result } = renderHook(() => useImportProductsMutation(), {
      wrapper
    });

    await result.current.mutateAsync({
      sourceOrganizationId: 'org-2',
      productIds: ['p-1', 'p-2']
    });

    expect(ProductService.import).toHaveBeenCalledWith(
      'org-2',
      ['p-1', 'p-2'],
      {
        id: 'org-1'
      }
    );
  });

  it('deve invalidar PRODUCTS_KEYS.all no onSuccess', async () => {
    vi.mocked(ProductService.import).mockResolvedValue(1);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useImportProductsMutation(), {
      wrapper
    });
    await result.current.mutateAsync({
      sourceOrganizationId: 'org-2',
      productIds: ['p-1']
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });
});
