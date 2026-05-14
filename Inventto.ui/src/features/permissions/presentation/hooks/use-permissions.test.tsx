import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseUser = vi.fn(() => ({ role: 'sales' as const }));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { usePermission } from './use-permissions';

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ role: 'sales' as const });
  });

  it('deve retornar isLoading true quando role é undefined', () => {
    mockUseUser.mockReturnValue({ role: undefined as never } as never);
    const { result } = renderHook(() => usePermission());
    expect(result.current.isLoading).toBe(true);
  });

  it('deve retornar isLoading false quando role está definido', () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.isLoading).toBe(false);
  });

  it('deve retornar true para ações permitidas pelo role atual', () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.can('product:view')).toBe(true);
  });

  it('deve retornar false para ações não permitidas pelo role atual', () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.can('team:manage')).toBe(false);
  });

  it('a referência da função can não deve mudar entre renders quando role não muda', () => {
    const { result, rerender } = renderHook(() => usePermission());
    const can1 = result.current.can;
    rerender();
    const can2 = result.current.can;
    expect(can1).toBe(can2);
  });
});
