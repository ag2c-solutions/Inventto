import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFirstAccess } from './use-first-access';

const mockNavigate = vi.fn();
const mockSetPassword = vi.fn();
const mockConfirmAccess = vi.fn();
const mockResendOtp = vi.fn();

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
  useSetFirstAccessPasswordMutation: () => ({
    mutateAsync: mockSetPassword,
    isPending: false
  }),
  useConfirmFirstAccessMutation: () => ({
    mutateAsync: mockConfirmAccess,
    isPending: false,
    error: null
  }),
  useResendOtpMutation: () => ({
    mutate: mockResendOtp
  })
}));

import { useUser } from '@/features/users';

import { useAuth } from './use-auth';

const mockSession = {
  user: { id: 'user-123', email: 'user@example.com' }
} as never;

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
      isLoading: false
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

  it('should start on password step', () => {
    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    expect(result.current.step).toBe('password');
  });

  it('should not call mutation when session is null on P1 submit', async () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isLoading: false
    });

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(mockSetPassword).not.toHaveBeenCalled();
  });

  it('should advance to otp step on successful P1 submit', async () => {
    mockSetPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    await waitFor(() => {
      expect(result.current.step).toBe('otp');
    });
  });

  it('should remain on password step when P1 fails', async () => {
    mockSetPassword.mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(result.current.step).toBe('password');
  });

  it('should navigate to "/" on successful P2 OTP submit', async () => {
    mockSetPassword.mockResolvedValue(undefined);
    mockConfirmAccess.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    await act(async () => {
      await result.current.onSubmitOtp('123456');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should not navigate when P2 OTP fails', async () => {
    mockSetPassword.mockResolvedValue(undefined);
    mockConfirmAccess.mockRejectedValue(new Error('Código inválido'));

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    await act(async () => {
      await result.current.onSubmitOtp('000000');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should return to password step when onBackToPassword is called', async () => {
    mockSetPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    await act(async () => {
      await result.current.onSubmitPassword({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    act(() => {
      result.current.onBackToPassword();
    });

    expect(result.current.step).toBe('password');
  });

  it('should call resendOtp with user email', () => {
    const { result } = renderHook(() => useFirstAccess(), { wrapper });

    act(() => {
      result.current.onResendOtp();
    });

    expect(mockResendOtp).toHaveBeenCalledWith({
      email: 'user@example.com'
    });
  });
});
