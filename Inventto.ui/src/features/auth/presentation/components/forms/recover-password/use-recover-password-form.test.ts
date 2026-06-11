import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecoverPasswordForm } from './use-recover-password-form';

const mockRecoverPassword = vi.fn();

vi.mock('../../../hooks/use-mutations', () => ({
  useRecoverPasswordMutation: () => ({ mutateAsync: mockRecoverPassword })
}));

describe('useRecoverPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transition to sent state on successful submit', async () => {
    mockRecoverPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecoverPasswordForm());

    expect(result.current.isSent).toBe(false);

    await act(async () => {
      await result.current.onSubmit({ email: 'joana@email.com' });
    });

    expect(mockRecoverPassword).toHaveBeenCalledWith({
      email: 'joana@email.com'
    });
    expect(result.current.isSent).toBe(true);
  });

  it('should transition to sent state even when the request fails (RN002)', async () => {
    mockRecoverPassword.mockRejectedValue(new Error('rate limit'));

    const { result } = renderHook(() => useRecoverPasswordForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'naoexiste@email.com' });
    });

    expect(result.current.isSent).toBe(true);
  });
});
