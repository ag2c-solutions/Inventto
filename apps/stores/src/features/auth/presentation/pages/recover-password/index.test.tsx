import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RecoverPasswordPage } from './index';

vi.mock('../../components/forms/recover-password', () => ({
  RecoverPasswordForm: () => <div data-testid="recover-password-form" />
}));

describe('RecoverPasswordPage', () => {
  it('should render the RecoverPasswordForm', () => {
    render(<RecoverPasswordPage />);

    expect(screen.getByTestId('recover-password-form')).toBeInTheDocument();
  });
});
