import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementService } from '../../domain/services';
import { createMovementInputFactory } from '../../tests/factories/movement.factory';

const mockUseUser = vi.fn();

vi.mock('../../domain/services', () => ({
  MovementService: {
    create: vi.fn(),
    cancelConfirmedSale: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import {
  useCancelConfirmedSaleMutation,
  useMovementCreateMutation
} from './use-mutations';

describe('useMovementCreateMutation', () => {
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

  it('should call MovementService.create with input + organization', async () => {
    vi.mocked(MovementService.create).mockResolvedValue('new-mov-id');

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    const input = createMovementInputFactory.build({
      type: 'entry',
      reason: 'Compra'
    });

    await result.current.mutateAsync(input);

    expect(MovementService.create).toHaveBeenCalledWith({
      input,
      organization: { id: 'org-1' }
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });

  it('should throw when no organization is selected', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    vi.mocked(MovementService.create).mockRejectedValue(
      new Error('Nenhuma organização selecionada.')
    );

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    const input = createMovementInputFactory.build({
      type: 'entry',
      reason: 'Outro'
    });

    await expect(result.current.mutateAsync(input)).rejects.toThrow(
      'Nenhuma organização selecionada.'
    );

    expect(MovementService.create).toHaveBeenCalledWith({
      input,
      organization: null
    });
  });
});

describe('useCancelConfirmedSaleMutation', () => {
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

  it('should call MovementService.cancelConfirmedSale and invalidate movements, products and orders', async () => {
    vi.mocked(MovementService.cancelConfirmedSale).mockResolvedValue(
      'new-mov-id'
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelConfirmedSaleMutation(), {
      wrapper
    });

    await result.current.mutateAsync({
      orderId: 'order-1',
      reason: 'Cliente desistiu'
    });

    expect(MovementService.cancelConfirmedSale).toHaveBeenCalledWith({
      orderId: 'order-1',
      reason: 'Cliente desistiu'
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
  });

  it('should not invalidate any query when the mutation fails', async () => {
    vi.mocked(MovementService.cancelConfirmedSale).mockRejectedValue(
      new Error('Esta venda já foi estornada ou não está mais confirmada.')
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelConfirmedSaleMutation(), {
      wrapper
    });

    await expect(
      result.current.mutateAsync({ orderId: 'order-1', reason: 'motivo' })
    ).rejects.toThrow(
      'Esta venda já foi estornada ou não está mais confirmada.'
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
