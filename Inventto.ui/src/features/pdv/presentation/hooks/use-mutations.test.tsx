import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvSaleService } from '../../domain/services';
import { useCartStore } from '../stores/cart-store';

import { useConfirmPosSaleMutation } from './use-mutations';

vi.mock('../../domain/services', () => ({
  PdvSaleService: {
    confirm: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('useConfirmPosSaleMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    useCartStore.setState({ items: [] });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const input = {
    catalogId: 'cat-1',
    customer: null,
    items: [
      {
        productId: 'p1',
        quantity: 1,
        referencePrice: 5000,
        discountAmount: 0,
        availableStock: 5
      }
    ]
  };

  it('should call PdvSaleService.confirm with the injected organizationId', async () => {
    vi.mocked(PdvSaleService.confirm).mockResolvedValue('order-1');

    const { result } = renderHook(() => useConfirmPosSaleMutation(), {
      wrapper
    });

    await result.current.mutateAsync(input);

    expect(PdvSaleService.confirm).toHaveBeenCalledWith({
      organizationId: 'org-1',
      catalogId: 'cat-1',
      customer: undefined,
      items: input.items
    });
  });

  it('should clear the cart and invalidate product/movement queries on success', async () => {
    useCartStore.setState({
      items: [
        {
          productId: 'p1',
          name: 'Cadeira',
          unitPrice: 5000,
          discount: 0,
          quantity: 1
        }
      ]
    });
    vi.mocked(PdvSaleService.confirm).mockResolvedValue('order-1');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useConfirmPosSaleMutation(), {
      wrapper
    });

    await result.current.mutateAsync(input);

    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(0));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['pdv', 'products']
    });
  });

  it('should preserve the cart when the mutation fails (no local onError)', async () => {
    useCartStore.setState({
      items: [
        {
          productId: 'p1',
          name: 'Cadeira',
          unitPrice: 5000,
          discount: 0,
          quantity: 1
        }
      ]
    });
    vi.mocked(PdvSaleService.confirm).mockRejectedValue(
      new Error('Estoque insuficiente — há 0 disponível.')
    );

    const { result } = renderHook(() => useConfirmPosSaleMutation(), {
      wrapper
    });

    await expect(result.current.mutateAsync(input)).rejects.toThrow();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('should reject without calling the service when there is no current organization', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    const { result } = renderHook(() => useConfirmPosSaleMutation(), {
      wrapper
    });

    await expect(result.current.mutateAsync(input)).rejects.toThrow(
      'Organização não encontrada.'
    );
    expect(PdvSaleService.confirm).not.toHaveBeenCalled();
  });
});
