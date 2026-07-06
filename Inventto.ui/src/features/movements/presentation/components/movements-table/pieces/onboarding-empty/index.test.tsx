import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MovementsOnboardingEmpty } from '.';

vi.mock('../../../add-moviment', () => ({
  AddNewMovements: () => <button type="button">Registrar</button>
}));

describe('MovementsOnboardingEmpty', () => {
  it('should render the empty state message and the AddNewMovements CTA', () => {
    render(<MovementsOnboardingEmpty />);

    expect(screen.getByText('Nenhuma movimentação ainda.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Registrar' })
    ).toBeInTheDocument();
  });
});
