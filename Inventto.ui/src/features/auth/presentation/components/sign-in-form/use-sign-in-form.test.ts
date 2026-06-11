import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EMAIL_NOT_CONFIRMED_ERROR } from '../../../data/handlers/error-handler';

import { useSignInForm } from './use-sign-in-form';

const mockMutateAsync = vi.fn();
const mockVerifyOtp = vi.fn();
const mockResendOtp = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/use-mutations', () => ({
  useSignInMutation: () => ({ mutateAsync: mockMutateAsync }),
  useVerifyOtpMutation: () => ({
    mutateAsync: mockVerifyOtp,
    isPending: false,
    error: null,
    reset: vi.fn()
  }),
  useResendOtpMutation: () => ({ mutateAsync: mockResendOtp })
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useSignInForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResendOtp.mockResolvedValue(undefined);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children)
    );

  it('should navigate to "/" on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({ user: { id: '1' } });

    const { result } = renderHook(() => useSignInForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        email: 'test@test.com',
        password: 'Pass123!'
      });
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'Pass123!'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should reset password field and not navigate on submit error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('E-mail ou senha incorretos.'));

    const { result } = renderHook(() => useSignInForm(), { wrapper });

    act(() => {
      result.current.form.setValue('password', 'WrongPass');
    });

    await act(async () => {
      await result.current.onSubmit({
        email: 'test@test.com',
        password: 'WrongPass'
      });
    });

    await waitFor(() => {
      expect(result.current.form.getValues('password')).toBe('');
    });

    expect(result.current.pendingEmail).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should switch to verification step and resend code when email is not confirmed', async () => {
    mockMutateAsync.mockRejectedValue(new Error(EMAIL_NOT_CONFIRMED_ERROR));

    const { result } = renderHook(() => useSignInForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        email: 'pending@test.com',
        password: 'Pass123!'
      });
    });

    expect(result.current.pendingEmail).toBe('pending@test.com');
    expect(mockResendOtp).toHaveBeenCalledWith({ email: 'pending@test.com' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should verify the OTP code and navigate on success', async () => {
    mockMutateAsync.mockRejectedValue(new Error(EMAIL_NOT_CONFIRMED_ERROR));
    mockVerifyOtp.mockResolvedValue({ session: {} });

    const { result } = renderHook(() => useSignInForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        email: 'pending@test.com',
        password: 'Pass123!'
      });
    });

    await act(async () => {
      result.current.handleVerifyOtp('123456');
    });

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'pending@test.com',
        token: '123456'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should return to the credentials step on back', async () => {
    mockMutateAsync.mockRejectedValue(new Error(EMAIL_NOT_CONFIRMED_ERROR));

    const { result } = renderHook(() => useSignInForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmit({
        email: 'pending@test.com',
        password: 'Pass123!'
      });
    });

    act(() => {
      result.current.handleBackToCredentials();
    });

    expect(result.current.pendingEmail).toBeNull();
  });
});
