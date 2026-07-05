import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseUser = vi.fn();

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useOrganizationSwitcher } from './use-organization-switcher';

const mockSetCurrentOrganization = vi.fn();

describe('useOrganizationSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      availableOrganizations: [
        { id: 'org-1', name: 'Ateliê Joana' },
        { id: 'org-2', name: 'Filial Sul' }
      ],
      role: 'owner',
      isSwitching: false,
      setCurrentOrganization: mockSetCurrentOrganization
    });
  });

  it('inicia com o popover fechado', () => {
    const { result } = renderHook(() => useOrganizationSwitcher());

    expect(result.current.open).toBe(false);
  });

  it('isStaticTrigger é false quando há múltiplas organizações', () => {
    const { result } = renderHook(() => useOrganizationSwitcher());

    expect(result.current.isStaticTrigger).toBe(false);
  });

  it('isStaticTrigger é true quando há uma única organização e o papel não é owner (RN011)', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      availableOrganizations: [{ id: 'org-1', name: 'Ateliê Joana' }],
      role: 'manager',
      isSwitching: false,
      setCurrentOrganization: mockSetCurrentOrganization
    });

    const { result } = renderHook(() => useOrganizationSwitcher());

    expect(result.current.isStaticTrigger).toBe(true);
  });

  it('isStaticTrigger é false quando há uma única organização mas o papel é owner', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      availableOrganizations: [{ id: 'org-1', name: 'Ateliê Joana' }],
      role: 'owner',
      isSwitching: false,
      setCurrentOrganization: mockSetCurrentOrganization
    });

    const { result } = renderHook(() => useOrganizationSwitcher());

    expect(result.current.isStaticTrigger).toBe(false);
  });

  it('handleSelect troca a organização atual e fecha o popover', () => {
    const { result } = renderHook(() => useOrganizationSwitcher());

    act(() => result.current.setOpen(true));
    act(() => result.current.handleSelect('org-2'));

    expect(mockSetCurrentOrganization).toHaveBeenCalledWith('org-2');
    expect(result.current.open).toBe(false);
  });
});
