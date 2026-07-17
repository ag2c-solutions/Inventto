import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignInPage } from './index';

vi.mock('../../components/forms/sign-in/index', () => ({
  SignInForm: () => <div data-testid="sign-in-form" />
}));

describe('SignInPage', () => {
  it('should render the SignInForm', () => {
    render(<SignInPage />);

    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
  });
});
