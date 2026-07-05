import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignUpPage } from './index';

vi.mock('../../components/forms/sign-up', () => ({
  SignUpForm: () => <div data-testid="sign-up-form" />
}));

describe('SignUpPage', () => {
  it('should render the SignUpForm inside the SignUpFormProvider', () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SignUpPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
  });
});
