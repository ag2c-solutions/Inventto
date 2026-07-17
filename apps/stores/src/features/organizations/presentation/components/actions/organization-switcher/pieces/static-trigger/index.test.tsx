import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/shared/components/ui/sidebar';

import { StaticTrigger } from '.';

describe('StaticTrigger', () => {
  it('exibe o nome e o papel traduzido da organização', () => {
    render(
      <SidebarProvider>
        <StaticTrigger name="Ateliê Joana" role="manager" />
      </SidebarProvider>
    );

    expect(screen.getByText('Ateliê Joana')).toBeInTheDocument();
    expect(screen.getByText('Gerente')).toBeInTheDocument();
  });

  it('não exibe o papel quando ausente', () => {
    render(
      <SidebarProvider>
        <StaticTrigger name="Ateliê Joana" role={undefined} />
      </SidebarProvider>
    );

    expect(screen.getByText('Ateliê Joana')).toBeInTheDocument();
    expect(screen.queryByText('Gerente')).not.toBeInTheDocument();
  });
});
