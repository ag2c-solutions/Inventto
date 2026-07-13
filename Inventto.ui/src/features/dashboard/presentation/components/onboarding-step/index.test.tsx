import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { OnboardingStep } from '../../../domain/entities';

import { OnboardingStepCard } from '.';

function renderStep(step: OnboardingStep, index = 0) {
  return render(
    <MemoryRouter>
      <OnboardingStepCard step={step} index={index} />
    </MemoryRouter>
  );
}

const BASE_STEP: OnboardingStep = {
  id: 'product',
  title: 'Cadastre seu primeiro produto',
  subtitle: 'Defina nome, SKU e estoque mínimo.',
  href: '/products/create',
  done: false,
  active: false
};

describe('OnboardingStepCard', () => {
  it('should render the step number and a CTA linking to the route when pending', () => {
    renderStep(BASE_STEP, 0);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(BASE_STEP.title)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Começar/ });
    expect(cta).toHaveAttribute('href', '/products/create');
  });

  it('should render a CTA when active, same as pending', () => {
    renderStep({ ...BASE_STEP, active: true }, 0);

    expect(screen.getByRole('link', { name: /Começar/ })).toBeInTheDocument();
  });

  it('should render the done tag instead of the CTA when done', () => {
    renderStep({ ...BASE_STEP, done: true }, 0);

    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Começar/ })
    ).not.toBeInTheDocument();
  });

  it('should render the 1-based index for pending/active steps', () => {
    renderStep(BASE_STEP, 2);

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
