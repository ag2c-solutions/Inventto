import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser, mockUseDeleteOrganizationMutation } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockUseDeleteOrganizationMutation: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('@/features/organizations/presentation/hooks/use-mutations', () => ({
  useDeleteOrganizationMutation: () => mockUseDeleteOrganizationMutation()
}));

import { useDeleteOrganizationDialog } from './use-delete-organization-dialog';

describe('useDeleteOrganizationDialog', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' }
    });
    mockUseDeleteOrganizationMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });
  });

  it('expõe o nome da organização atual e isExactMatch false por padrão', () => {
    const { result } = renderHook(() => useDeleteOrganizationDialog());

    expect(result.current.organizationName).toBe('Ateliê Joana');
    expect(result.current.isExactMatch).toBe(false);
  });

  it('isExactMatch vira true quando o nome digitado bate exatamente', () => {
    const { result } = renderHook(() => useDeleteOrganizationDialog());

    act(() => result.current.setTypedName('Ateliê Joana'));

    expect(result.current.isExactMatch).toBe(true);
  });

  it('handleConfirm dispara a mutation com o valor de purge atual', () => {
    const { result } = renderHook(() => useDeleteOrganizationDialog());

    act(() => result.current.setPurge(true));
    act(() => result.current.handleConfirm());

    expect(mockMutate).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('onSuccess da mutation reseta typedName/purge e chama onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useDeleteOrganizationDialog(onOpenChange)
    );

    act(() => {
      result.current.setTypedName('Ateliê Joana');
      result.current.setPurge(true);
    });
    act(() => result.current.handleConfirm());

    const onSuccess = mockMutate.mock.calls[0][1].onSuccess;
    act(() => onSuccess());

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(result.current.typedName).toBe('');
    expect(result.current.purge).toBe(false);
  });

  it('handleOpenChange(false) reseta typedName/purge e propaga para onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useDeleteOrganizationDialog(onOpenChange)
    );

    act(() => {
      result.current.setTypedName('algo');
      result.current.setPurge(true);
    });
    act(() => result.current.handleOpenChange(false));

    expect(result.current.typedName).toBe('');
    expect(result.current.purge).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handleOpenChange(true) não reseta o estado', () => {
    const { result } = renderHook(() => useDeleteOrganizationDialog());

    act(() => result.current.setTypedName('algo'));
    act(() => result.current.handleOpenChange(true));

    expect(result.current.typedName).toBe('algo');
  });

  it('organizationName é string vazia quando não há organização atual', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    const { result } = renderHook(() => useDeleteOrganizationDialog());

    expect(result.current.organizationName).toBe('');
  });
});
