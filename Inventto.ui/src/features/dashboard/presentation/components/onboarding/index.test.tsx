import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { OnboardingStatus } from '../../../domain/entities';

import { Onboarding } from '.';

function renderOnboarding(status: OnboardingStatus) {
  return render(
    <MemoryRouter>
      <Onboarding status={status} />
    </MemoryRouter>
  );
}

const EMPTY_STATUS: OnboardingStatus = {
  hasProducts: false,
  hasCatalog: false,
  hasPublishedStorefront: false,
  hasSales: false
};

describe('Onboarding', () => {
  it('should render the hero with the exact microcopy', () => {
    renderOnboarding(EMPTY_STATUS);

    expect(
      screen.getByRole('heading', { name: 'Vamos preparar sua loja.' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Três passos para começar a vender. Conclua na ordem — cada um destrava o próximo.'
      )
    ).toBeInTheDocument();
  });

  it('should render the 3 steps with exact titles in order, none done yet', () => {
    renderOnboarding(EMPTY_STATUS);

    expect(
      screen.getByText('Cadastre seu primeiro produto')
    ).toBeInTheDocument();
    expect(screen.getByText('Crie um catálogo')).toBeInTheDocument();
    expect(screen.getByText('Publique sua vitrine')).toBeInTheDocument();
    expect(screen.queryByText('Concluído')).not.toBeInTheDocument();
    // Nenhum passo concluído: todos (pendente + ativo) mostram CTA "Começar".
    expect(screen.getAllByRole('link', { name: /Começar/ })).toHaveLength(3);
  });

  it('should show progression: step 1 done, step 2 active, step 3 pending', () => {
    renderOnboarding({ ...EMPTY_STATUS, hasProducts: true });

    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Começar/ })).toHaveLength(2);
  });

  it('should show progression: steps 1 and 2 done, step 3 (publish) still pending', () => {
    renderOnboarding({
      ...EMPTY_STATUS,
      hasProducts: true,
      hasCatalog: true
    });

    expect(screen.getAllByText('Concluído')).toHaveLength(2);
    const cta = screen.getByRole('link', { name: /Começar/ });
    expect(cta).toHaveAttribute('href', '/storefronts');
  });
});
