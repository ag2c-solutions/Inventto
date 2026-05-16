import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignInForm } from './use-sign-in-form';

const mockMutateAsync = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/use-mutations', () => ({
  useSignInMutation: () => ({ mutateAsync: mockMutateAsync })
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useSignInForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
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
    mockMutateAsync.mockRejectedValue(new Error('Invalid credentials'));

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

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
