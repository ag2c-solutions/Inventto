import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFirstAccess } from './use-first-access';

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('./use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: vi.fn()
}));

vi.mock('./use-mutations', () => ({
  useCompleteFirstAccessMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

import { useUser } from '@/features/users';

import { useAuth } from './use-auth';

const mockSession = { user: { id: 'user-123' } } as never;

describe('useFirstAccess', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    vi.mocked(useAuth).mockReturnValue({
      session: mockSession,
      isAuthenticated: true,
      isLoading: false,
      isRecoverySession: false
    });
    vi.mocked(useUser).mockReturnValue({
      currentOrganization: {
        id: 'org-1',
        name: 'Org',
        slug: 'org',
        role: 'owner'
      },
      user: null,
      isLoading: false
    } as never);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children)
    );

  it('should return isReady=false when currentOrganization is null', () => {
    vi.mocked(useUser).mockReturnValue({
      currentOrganization: null,
      user: null,
      isLoading: false
    } as never);

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    expect(result.current.isReady).toBe(false);
  });

  it('should return isReady=true when currentOrganization has id', () => {
    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    expect(result.current.isReady).toBe(true);
  });

  it('should not call mutation when session is null', async () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isRecoverySession: false
    });

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to "/" on successful submit', async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should not navigate on submit error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
