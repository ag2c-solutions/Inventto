import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  recoverPasswordPayloadFactory,
  resetPasswordFormValuesFactory
} from '../../../../../tests/factories/auth.factory';

import { useRecoverPasswordForm } from './use-recover-password-form';

const mockNavigate = vi.fn();
const mockRecoverPassword = vi.fn();
const mockVerifyRecoveryOtp = vi.fn();
const mockSetNewPassword = vi.fn();
const mockResetVerify = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../../hooks/use-mutations', () => ({
  useRecoverPasswordMutation: () => ({ mutateAsync: mockRecoverPassword }),
  useVerifyRecoveryOtpMutation: () => ({
    mutateAsync: mockVerifyRecoveryOtp,
    isPending: false,
    error: null,
    reset: mockResetVerify
  }),
  useSetNewPasswordMutation: () => ({ mutateAsync: mockSetNewPassword })
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(MemoryRouter, null, children);

describe('useRecoverPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRecoverPassword.mockResolvedValue(undefined);
    mockVerifyRecoveryOtp.mockResolvedValue({});
    mockSetNewPassword.mockResolvedValue(undefined);
  });

  it('starts at the email step', () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    expect(result.current.step).toBe('email');
  });

  it('advances to the otp step and stores the email on submit', async () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    const payload = recoverPasswordPayloadFactory.build();
    await act(async () => {
      await result.current.onSubmitEmail(payload);
    });

    expect(mockRecoverPassword).toHaveBeenCalledWith(payload);
    expect(result.current.step).toBe('otp');
    expect(result.current.email).toBe(payload.email);
  });

  it('still advances to otp when the send fails (RN002 anti-enumeração)', async () => {
    mockRecoverPassword.mockRejectedValue(new Error('rate limit'));

    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmitEmail(recoverPasswordPayloadFactory.build());
    });

    expect(result.current.step).toBe('otp');
  });

  it('advances to the password step after a valid code', async () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    const payload = recoverPasswordPayloadFactory.build();
    await act(async () => {
      await result.current.onSubmitEmail(payload);
    });
    await act(async () => {
      await result.current.onSubmitOtp('123456');
    });

    expect(mockVerifyRecoveryOtp).toHaveBeenCalledWith({
      email: payload.email,
      token: '123456'
    });
    expect(result.current.step).toBe('password');
  });

  it('stays on the otp step when the code is invalid', async () => {
    mockVerifyRecoveryOtp.mockRejectedValue(new Error('Código inválido.'));

    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmitEmail(recoverPasswordPayloadFactory.build());
    });
    await act(async () => {
      await result.current.onSubmitOtp('000000');
    });

    expect(result.current.step).toBe('otp');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to the dashboard after setting the new password', async () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    const passwordValues = resetPasswordFormValuesFactory.build();
    await act(async () => {
      await result.current.onSubmitPassword(passwordValues);
    });

    expect(mockSetNewPassword).toHaveBeenCalledWith({
      newPassword: passwordValues.password
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('resends the code through recoverPassword', async () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    const payload = recoverPasswordPayloadFactory.build();
    await act(async () => {
      await result.current.onSubmitEmail(payload);
    });

    mockRecoverPassword.mockClear();

    act(() => {
      result.current.onResendOtp();
    });

    expect(mockRecoverPassword).toHaveBeenCalledWith(payload);
  });

  it('goes back to the email step', async () => {
    const { result } = renderHook(() => useRecoverPasswordForm(), { wrapper });

    await act(async () => {
      await result.current.onSubmitEmail(recoverPasswordPayloadFactory.build());
    });
    act(() => {
      result.current.onBackToEmail();
    });

    expect(result.current.step).toBe('email');
  });
});
