import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GreetHeader } from '.';

describe('GreetHeader', () => {
  it('should show the greeting with the given name', () => {
    render(
      <GreetHeader name="Joana" organizationName="Ateliê Joana" role="owner" />
    );

    expect(screen.getByText('Bom dia, Joana')).toBeInTheDocument();
  });

  it('should show the sales-specific subtitle for the sales role', () => {
    render(
      <GreetHeader name="Joana" organizationName="Ateliê Joana" role="sales" />
    );

    expect(
      screen.getByText(
        'Aqui estão suas vendas e os pedidos a atender · Ateliê Joana'
      )
    ).toBeInTheDocument();
  });

  it.each(['owner', 'manager'] as const)(
    'should show the operational subtitle for the %s role',
    (role) => {
      render(
        <GreetHeader name="Joana" organizationName="Ateliê Joana" role={role} />
      );

      expect(
        screen.getByText(
          'Aqui está o resumo operacional de hoje · Ateliê Joana'
        )
      ).toBeInTheDocument();
    }
  );

  it('should show the "updated now" badge', () => {
    render(
      <GreetHeader
        name="Joana"
        organizationName="Ateliê Joana"
        role="manager"
      />
    );

    expect(screen.getByText('Atualizado agora')).toBeInTheDocument();
  });
});
